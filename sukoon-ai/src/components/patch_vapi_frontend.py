import re

with open(r'd:\Google Gemma 4 Hackathron\sukoon-ai\src\components\ContentArea.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports
content = content.replace('import { Mic, Square, Trash2, Settings, Volume2, VolumeX } from "lucide-react";', 'import { Mic, Square, Trash2, Settings, Volume2, VolumeX, PhoneCall, PhoneOff } from "lucide-react";\nimport Vapi from "@vapi-ai/web";')

# 2. Vapi Instance & State
state_insert = """
  // --- VAPI STATE ---
  const [vapiActive, setVapiActive] = useState(false);
  const [vapiAgentId, setVapiAgentId] = useState("");
  const vapiRef = useRef<any>(null);

  useEffect(() => {
    const vapi = new Vapi(import.meta.env.VITE_VAPI_PUBLIC_KEY || "181e4768-e83e-4082-9a21-519941ab16ef");
    vapiRef.current = vapi;

    vapi.on('call-start', () => setVapiActive(true));
    vapi.on('call-end', () => setVapiActive(false));
    vapi.on('error', (e) => console.error(e));

    return () => {
      vapi.stop();
    };
  }, []);

  const toggleVapi = () => {
    if (vapiActive) {
      vapiRef.current?.stop();
    } else {
      if (!vapiAgentId) {
        alert("Please enter a Vapi Agent ID in Settings first!");
        return;
      }
      vapiRef.current?.start(vapiAgentId);
    }
  };
"""
content = content.replace('const [ttsEnabled, setTtsEnabled] = useState(true);', state_insert + '\n  const [ttsEnabled, setTtsEnabled] = useState(true);')

# 3. Add to Settings Tab
settings_vapi = """
              <div className="pt-4 border-t border-slate-100">
                <h4 className="font-display font-bold text-xs text-[#2F3E46] mb-2">Vapi Voice Agent Setup</h4>
                <p className="text-[10px] text-slate-500 font-semibold mb-3">
                  Enter the Agent ID from your Vapi dashboard to enable high-quality Hindi voice calling.
                </p>
                <input
                  type="text"
                  placeholder="Paste Agent ID here..."
                  value={vapiAgentId}
                  onChange={(e) => setVapiAgentId(e.target.value)}
                  className="w-full h-10 px-3.5 mb-2 bg-slate-50 text-xs text-[#2F3E46] placeholder:text-slate-400 rounded-xl border border-slate-200 focus:border-[#5DADE2] focus:outline-hidden transition-all shadow-3xs font-semibold"
                />
                <button 
                  onClick={toggleVapi}
                  className={`w-full py-2.5 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 ${vapiActive ? 'bg-rose-500 hover:bg-rose-600 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`}
                >
                  {vapiActive ? <PhoneOff className="w-4 h-4" /> : <PhoneCall className="w-4 h-4" />}
                  {vapiActive ? "End Vapi Call" : "Start Vapi Call"}
                </button>
              </div>
"""
content = content.replace('<div className="pt-4 border-t border-slate-100">\n                 <button ', settings_vapi + '\n              <div className="pt-4 border-t border-slate-100">\n                 <button ')

with open(r'd:\Google Gemma 4 Hackathron\sukoon-ai\src\components\ContentArea.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
