import re

with open(r'd:\Google Gemma 4 Hackathron\backend\routes\chat.js', 'r', encoding='utf-8') as f:
    content = f.read()

vapi_route = """
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
                systemInstruction: systemPrompt + "\\n\\nYou are speaking over voice. Do not output emojis, markdown, or JSON. Just natural spoken language in Hindi (or Urdu/English if requested)."
            }
        });

        for await (const chunk of responseStream) {
            const data = JSON.stringify({
                choices: [{ delta: { content: chunk.text } }]
            });
            res.write(`data: ${data}\\n\\n`);
        }

        res.write('data: [DONE]\\n\\n');
        res.end();

    } catch (error) {
        console.error("Vapi Gemini API Error:", error);
        res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: "Sorry, I encountered an error." } }] })}\\n\\n`);
        res.write('data: [DONE]\\n\\n');
        res.end();
    }
});
"""

content = content.replace('module.exports = router;', vapi_route + '\nmodule.exports = router;')

with open(r'd:\Google Gemma 4 Hackathron\backend\routes\chat.js', 'w', encoding='utf-8') as f:
    f.write(content)
