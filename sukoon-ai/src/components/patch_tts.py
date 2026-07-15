import re

with open(r'd:\Google Gemma 4 Hackathron\sukoon-ai\src\components\ContentArea.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports
content = content.replace('Mic, Square, Trash2, Settings', 'Mic, Square, Trash2, Settings, Volume2, VolumeX')

# 2. State & Refs
state_insert = """
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const ttsEnabledRef = useRef(ttsEnabled);
  useEffect(() => { ttsEnabledRef.current = ttsEnabled; }, [ttsEnabled]);

  useEffect(() => {
    if (activeModule !== 'ai-companion') {
      window.speechSynthesis?.cancel();
    }
  }, [activeModule]);
"""
content = content.replace('const [isTyping, setIsTyping] = useState(false);', 'const [isTyping, setIsTyping] = useState(false);' + state_insert)

# 3. Modify handleSendMessage to speak the final text
old_tts = """
                if (endData.complete && endData.complete.reply) {
                  setMessages(prev => prev.map(msg => 
                    msg.id === companionMsgId ? { ...msg, text: endData.complete.reply } : msg
                  ));
                }
"""

new_tts = """
                if (endData.complete && endData.complete.reply) {
                  const finalReply = endData.complete.reply;
                  setMessages(prev => prev.map(msg => 
                    msg.id === companionMsgId ? { ...msg, text: finalReply } : msg
                  ));
                  if (ttsEnabledRef.current && window.speechSynthesis) {
                    window.speechSynthesis.cancel(); // Stop any ongoing speech
                    const utterance = new SpeechSynthesisUtterance(finalReply);
                    utterance.lang = 'ur-PK';
                    // Fallback to English if no Urdu voice found, but browser handles this natively
                    window.speechSynthesis.speak(utterance);
                  }
                }
"""
content = content.replace(old_tts.strip(), new_tts.strip())

# 4. UI Toggle in Chat Header
old_header = """
            <div className="flex items-center gap-1 text-[9px] text-slate-400 bg-white px-2 py-1 rounded-full border border-slate-100 shadow-3xs select-none">
              <Shield className="w-3 h-3 text-emerald-500" />
              <span>Private</span>
            </div>
"""

new_header = """
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setTtsEnabled(!ttsEnabled);
                  if (ttsEnabled) window.speechSynthesis?.cancel();
                }}
                className={`p-1.5 rounded-full transition-colors ${ttsEnabled ? 'bg-[#5DADE2]/10 text-[#5DADE2]' : 'bg-slate-100 text-slate-400'}`}
                aria-label={ttsEnabled ? "Mute voice" : "Unmute voice"}
              >
                {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <div className="flex items-center gap-1 text-[9px] text-slate-400 bg-white px-2 py-1 rounded-full border border-slate-100 shadow-3xs select-none">
                <Shield className="w-3 h-3 text-emerald-500" />
                <span>Private</span>
              </div>
            </div>
"""
content = content.replace(old_header.strip(), new_header.strip())

with open(r'd:\Google Gemma 4 Hackathron\sukoon-ai\src\components\ContentArea.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
