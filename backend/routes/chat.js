const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');
const { systemPrompt } = require('../config/prompts');
const dbLogic = require('../db/sqlite');

// In-memory session store
// { [sessionId]: [{ role: 'user'|'model', parts: [...] }] }
const sessions = new Map();

// Initialize SDK
let ai;
try {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
} catch(e) {
    console.warn("Could not initialize GoogleGenAI. Did you set GEMINI_API_KEY?");
}

// POST /api/chat
router.post('/chat', async (req, res) => {
    const { sessionId, text, audioBase64, framing } = req.body;

    if (!sessionId) {
        return res.status(400).json({ error: 'sessionId is required' });
    }
    
    dbLogic.logConversation(sessionId);

    // Get or create session history
    let history = sessions.get(sessionId) || [];
    
    // Construct new user message
    let userParts = [];
    if (text) {
        userParts.push({ text: text });
    }
    if (audioBase64) {
        // Expected format: { data: 'base64string...', mimeType: 'audio/mp3' }
        userParts.push({
            inlineData: {
                data: audioBase64.data,
                mimeType: audioBase64.mimeType || 'audio/mp3'
            }
        });
    }

    if (userParts.length === 0) {
        return res.status(400).json({ error: 'Either text or audioBase64 is required' });
    }

    history.push({ role: 'user', parts: userParts });

    // Setup SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        if (!ai && process.env.GEMINI_API_KEY) {
            ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        }

        if (!ai) {
            throw new Error("API Key is missing.");
        }

        let currentSystemPrompt = systemPrompt;
        if (framing) {
            currentSystemPrompt += `\n\nThe user prefers a ${framing} framing for coping suggestions.`;
        }

        const responseStream = await ai.models.generateContentStream({
            // Fallback to gemini-2.5-flash if gemma-4 is not accessible yet in standard API
            model: 'gemini-2.5-flash', 
            contents: history,
            config: {
                systemInstruction: currentSystemPrompt,
                responseMimeType: 'application/json',
                responseSchema: {
                    type: "OBJECT",
                    properties: {
                        reply: { type: "STRING", description: "The conversational response to the user." },
                        risk_level: { type: "STRING", enum: ["none", "elevated", "crisis"] },
                        flags: { type: "ARRAY", items: { type: "STRING" } },
                        topic: { type: "STRING", description: "A 1-3 word category for the user's stress, e.g., 'exam stress', 'family pressure'. Empty if none." },
                        language_code: { type: "STRING", description: "The IETF language tag of the reply, e.g., 'ur-PK' for Urdu, 'hi-IN' for Hindi, 'en-US' for English." }
                    },
                    required: ["reply", "risk_level", "language_code"]
                }
            }
        });

        let fullJsonRaw = "";
        for await (const chunk of responseStream) {
            fullJsonRaw += chunk.text;
            res.write(`data: ${JSON.stringify({ chunk: chunk.text })}\n\n`);
        }

        // Try to parse the complete JSON
        try {
            const parsed = JSON.parse(fullJsonRaw);
            
            history.push({ role: 'model', parts: [{ text: fullJsonRaw }] });
            sessions.set(sessionId, history);

            if (parsed.risk_level === 'crisis') {
                dbLogic.logCrisisEvent(sessionId);
            }
            if (parsed.topic) {
                dbLogic.logTopic(parsed.topic);
            }

            res.write(`event: end\ndata: ${JSON.stringify({ complete: parsed })}\n\n`);
        } catch (parseError) {
            history.push({ role: 'model', parts: [{ text: fullJsonRaw }] });
            sessions.set(sessionId, history);
            res.write(`event: end\ndata: ${JSON.stringify({ error: "Failed to parse structured output", raw: fullJsonRaw })}\n\n`);
        }

        res.end();

    } catch (error) {
        console.error("Gemini API Error:", error);
        res.write(`event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
    }
});

// POST /api/clear
router.post('/clear', (req, res) => {
    const { sessionId } = req.body;
    if (sessionId) {
        sessions.delete(sessionId);
        res.json({ success: true, message: "Session cleared" });
    } else {
        res.status(400).json({ error: 'sessionId is required' });
    }
});


// POST /api/vapi/chat (OpenAI-compatible Custom LLM endpoint for Vapi)
router.post('/vapi/chat', async (req, res) => {
    const vapiMessages = req.body.messages || [];
    
    // Convert OpenAI format to Gemini format
    const history = vapiMessages
        .filter(msg => msg.role !== 'system')
        .map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        if (!ai) {
            ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        }

        // Standard Gemma 4 streaming call (no JSON schema required here since Vapi expects raw text chunks)
        const responseStream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash', 
            contents: history,
            config: {
                systemInstruction: systemPrompt + "\n\nYou are speaking over voice. Do not output emojis, markdown, or JSON. Just natural spoken language in Hindi (or Urdu/English if requested)."
            }
        });

        for await (const chunk of responseStream) {
            const data = JSON.stringify({
                choices: [{ delta: { content: chunk.text } }]
            });
            res.write(`data: ${data}\n\n`);
        }

        res.write('data: [DONE]\n\n');
        res.end();

    } catch (error) {
        console.error("Vapi Gemini API Error:", error);
        res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: "Sorry, I encountered an error." } }] })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
    }
});

module.exports = router;
