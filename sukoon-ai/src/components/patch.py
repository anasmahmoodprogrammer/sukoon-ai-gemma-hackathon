import re

with open(r'd:\Google Gemma 4 Hackathron\sukoon-ai\src\components\ContentArea.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports
content = content.replace('import MoodSelector, { MOODS_DATA } from "./MoodSelector";', 'import MoodSelector, { MOODS_DATA } from "./MoodSelector";\nimport AnalyticsDashboard from "./AnalyticsDashboard";\nimport { Mic, Square, Trash2, Settings } from "lucide-react";')

# 2. State
state_insert = """
  // --- PHASE 4/5 STATE ---
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [useFaithFraming, setUseFaithFraming] = useState(false);
  const [largeFont, setLargeFont] = useState(false);
"""
content = content.replace('const [inputText, setInputText] = useState("");', 'const [inputText, setInputText] = useState("");' + state_insert)

# 3. Voice Recording functions
funcs_insert = """
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      onTriggerToast("Recording audio...", "info");
    } catch (err) {
      console.error("Mic error", err);
      onTriggerToast("Microphone access denied.", "info");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const discardRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result.split(',')[1]);
        } else {
          reject(new Error("Failed to convert"));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };
"""
content = content.replace('const handleSendMessage = async (textToSend: string) => {', funcs_insert + '\n  const handleSendMessage = async (textToSend: string, audioDataBlob?: Blob | null) => {')

# 4. Modify handleSendMessage
content = content.replace('if (!textToSend.trim()) return;', 'if (!textToSend.trim() && !audioDataBlob) return;')
content = content.replace('text: textToSend,', 'text: textToSend || "[Voice Message]",')

fetch_body = """
          sessionId: "mobile-user-123",
          text: textToSend,
          framing: useFaithFraming ? "faith-informed" : "secular",
          audioBase64: audioDataBlob ? { data: await blobToBase64(audioDataBlob), mimeType: audioDataBlob.type } : undefined
"""
content = content.replace('text: textToSend', fetch_body)

# 5. Form replace
old_form = """
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }} 
            className="p-3.5 border-t border-slate-100 bg-[#F8FAFC]/50 shrink-0"
          >
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Share whatever is on your heart..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 h-10 px-3.5 bg-white text-xs text-[#2F3E46] placeholder:text-slate-400 rounded-xl border border-slate-100 focus:border-[#5DADE2]/60 focus:outline-hidden transition-all shadow-3xs font-semibold"
              />
              <button
                type="submit"
                className="w-10 h-10 bg-[#5DADE2] hover:bg-[#4a9cd3] text-white rounded-xl flex items-center justify-center shadow-xs active:scale-90 transition-all cursor-pointer"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[9px] text-center text-slate-400/80 mt-2 font-medium">
              We listen in complete safety. If you are experiencing distress, reach out to local helplines.
            </p>
          </form>
"""
new_form = """
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText, audioBlob);
              discardRecording();
            }} 
            className="p-3.5 border-t border-slate-100 bg-[#F8FAFC]/50 shrink-0"
          >
            {audioBlob && (
              <div className="flex items-center gap-2 mb-2 p-2 bg-[#5DADE2]/10 rounded-xl">
                <audio src={audioUrl || ""} controls className="h-8 flex-1" />
                <button type="button" onClick={discardRecording} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={isRecording ? "Recording..." : "Share whatever is on your heart..."}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isRecording}
                className="flex-1 h-10 px-3.5 bg-white text-xs text-[#2F3E46] placeholder:text-slate-400 rounded-xl border border-slate-100 focus:border-[#5DADE2]/60 focus:outline-hidden transition-all shadow-3xs font-semibold"
              />
              {!inputText.trim() && !audioBlob ? (
                 <button
                   type="button"
                   onClick={isRecording ? stopRecording : startRecording}
                   className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs active:scale-90 transition-all cursor-pointer ${isRecording ? 'bg-rose-500 text-white animate-pulse' : 'bg-[#CDB4DB] text-white hover:bg-[#b59ec3]'}`}
                 >
                   {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                 </button>
              ) : (
                <button
                  type="submit"
                  className="w-10 h-10 bg-[#5DADE2] hover:bg-[#4a9cd3] text-white rounded-xl flex items-center justify-center shadow-xs active:scale-90 transition-all cursor-pointer"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-[9px] text-center text-slate-400/80 mt-2 font-medium">
              We listen in complete safety. If you are experiencing distress, reach out to local helplines.
            </p>
          </form>
"""
content = content.replace(old_form.strip(), new_form.strip())

with open(r'd:\Google Gemma 4 Hackathron\sukoon-ai\src\components\ContentArea.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
