import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, 
  Send, 
  Smile, 
  Heart, 
  BookOpen, 
  PenTool, 
  Plus, 
  Play, 
  Pause, 
  RotateCcw, 
  Phone, 
  Check, 
  Shield, 
  Clock, 
  ChevronRight, 
  Info, 
  Bot, 
  Wind, 
  Users, 
  Search, 
  Moon, 
  Compass, 
  Trophy,
  X,
  Bookmark
} from "lucide-react";
import { ModuleId, UserProfile } from "../types";
import MoodSelector, { MOODS_DATA } from "./MoodSelector";
import AnalyticsDashboard from "./AnalyticsDashboard";
import { Mic, Square, Trash2, Settings, Volume2, VolumeX, PhoneCall, PhoneOff } from "lucide-react";
import Vapi from "@vapi-ai/web";

interface ContentAreaProps {
  activeModule: ModuleId;
  setActiveModule: (module: ModuleId) => void;
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
  onTriggerToast: (message: string, type: "success" | "info") => void;
}

interface ChatMessage {
  id: number;
  sender: "user" | "companion";
  text: string;
  time: string;
}

interface JournalEntry {
  id: number;
  title: string;
  body: string;
  date: string;
  mood?: string;
  promptUsed?: string;
}

interface WellnessTip {
  id: number;
  title: string;
  category: string;
  readTime: string;
  text: string;
  urduText: string;
  emoji: string;
}

export default function ContentArea({
  activeModule,
  setActiveModule,
  userProfile,
  setUserProfile,
  onTriggerToast
}: ContentAreaProps) {
  
  // --- 1. CORE WELLNESS METRICS STATE (For Progress Ring) ---
  const [moodLogged, setMoodLogged] = useState(false);
  const [breathCompleted, setBreathCompleted] = useState(false);
  const [journalSaved, setJournalSaved] = useState(false);

  // --- 2. HOME SCREEN SEARCH & TIPS ---
  const [searchQuery, setSearchQuery] = useState("");
  const [favoriteTips, setFavoriteTips] = useState<number[]>([]);
  const [activeGuide, setActiveGuide] = useState<WellnessTip | null>(null);

  // --- 3. OVERLAYS (BREATHING & MEDITATION) ---
  const [showBreathingOverlay, setShowBreathingOverlay] = useState(false);
  const [showMeditationOverlay, setShowMeditationOverlay] = useState(false);
  const [showCrisisOverlay, setShowCrisisOverlay] = useState(false);

  // --- 4. CHAT COMPANION STATE ---
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: "companion",
      text: "Assalam-o-Alaikum! I am your Sukoon Companion. I am here to listen, offer comfort, and support you in total safety and privacy. How is your heart feeling today?",
      time: "Just now"
    }
  ]);
  const [inputText, setInputText] = useState("");
  // --- PHASE 4/5 STATE ---
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [useFaithFraming, setUseFaithFraming] = useState(false);
  const [largeFont, setLargeFont] = useState(false);

  const [isTyping, setIsTyping] = useState(false);
  
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

  const [ttsEnabled, setTtsEnabled] = useState(true);
  const ttsEnabledRef = useRef(ttsEnabled);
  useEffect(() => { ttsEnabledRef.current = ttsEnabled; }, [ttsEnabled]);

  useEffect(() => {
    if (activeModule !== 'ai-companion') {
      window.speechSynthesis?.cancel();
    }
  }, [activeModule]);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Suggested pre-populated prompt buttons
  const suggestedPrompts = [
    { label: "I feel anxious", text: "I've been feeling really anxious and overwhelmed today. Can you help me ground myself?" },
    { label: "Had a rough day", text: "I had an exhausting and stressful day. I just need a comforting friend to talk to." },
    { label: "Help me sleep", text: "My mind is racing and I can't sleep. Can you guide me through a calming wind-down?" },
    { label: "Share a win! 🌸", text: "I completed my breathing exercise today and feel proud!" }
  ];

  // --- 5. MOOD STATE ---
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [moodAffirmation, setMoodAffirmation] = useState("");
  const [moodNotes, setMoodNotes] = useState("");
  const [moodHistory, setMoodHistory] = useState<Array<{date: string, mood: string, emoji: string}>>([
    { date: "Yesterday", mood: "Quiet", emoji: "🌫" },
    { date: "2 days ago", mood: "Peaceful", emoji: "🌸" }
  ]);

  // --- 6. JOURNAL STATE ---
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([
    {
      id: 1,
      title: "First step towards Sukoon",
      body: "Today I decided to prioritize my emotional well-being. Finding a quiet, secure space like Sukoon AI feels incredibly reassuring. I want to build a gentle habit of writing down my thoughts.",
      date: "July 12, 2026",
      mood: "🌸 Peaceful"
    }
  ]);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [journalMood, setJournalMood] = useState("🌸 Peaceful");
  const [activePrompt, setActivePrompt] = useState("");

  const gratitudePrompts = [
    "What are three small things that brought you comfort today?",
    "Write about a person who makes you feel safe and appreciated.",
    "Describe a peaceful place you love to imagine when feeling overwhelmed.",
    "What is a personal strength you utilized this week?"
  ];

  // --- 7. MEDITATION TIMER STATE ---
  const [medTimeLeft, setMedTimeLeft] = useState(300); // 5 mins
  const [medActive, setMedActive] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(300);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // --- 8. BOX BREATHING STATE (4-4-4-4) ---
  const [breathPhase, setBreathPhase] = useState<"Inhale" | "Hold (In)" | "Exhale" | "Hold (Out)">("Inhale");
  const [breathCount, setBreathCount] = useState(4);
  const [breathActive, setBreathActive] = useState(false);
  const breathIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // --- 9. PROFILE EDIT STATE ---
  const [settingsName, setSettingsName] = useState(userProfile.name);
  const [settingsBio, setSettingsBio] = useState("Seeking calm, emotional balance, and mindfulness in my daily life.");
  const [settingsReminders, setSettingsReminders] = useState(true);

  // --- STATIC WELLNESS TIPS DATA ---
  const wellnessTips: WellnessTip[] = [
    {
      id: 1,
      title: "5-4-3-2-1 Grounding Technique",
      category: "Anxiety Relief",
      readTime: "3 min read",
      emoji: "🌸",
      text: "When overwhelming feelings roll in, look around you. Identify 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste. This immediately roots your awareness in physical safety.",
      urduText: "جب پریشانی محسوس ہو تو اپنے گرد 5 چیزیں دیکھیں، 4 کو چھوئیں، 3 کو سنیں، 2 کو سونگھیں، اور 1 کو چکھیں۔ یہ آپ کو فوری پرسکون کرتا ہے۔"
    },
    {
      id: 2,
      title: "The Power of Loving Self-Talk",
      category: "Mindfulness",
      readTime: "2 min read",
      emoji: "☀️",
      text: "We often talk to ourselves with harsh standards we would never impose on a friend. When you struggle, pause and think: 'What would a loving friend tell me right now?' Give yourself that same gentle grace.",
      urduText: "اپنے ساتھ نرمی سے بات کریں۔ خود سے وہ بات کہیں جو ایک مخلص دوست اس وقت آپ سے کہتا۔"
    },
    {
      id: 3,
      title: "A Gentle Bedtime Sleep Ritual",
      category: "Healthy Sleep",
      readTime: "4 min read",
      emoji: "🌙",
      text: "Turn off all screens 30 minutes before bed. Spend 5 minutes writing down any lingering worries in a journal. This signal tells your brain: 'Your thoughts are stored safely, it is okay to rest now.'",
      urduText: "سونے سے 30 منٹ پہلے موبائل دور کر دیں اور پریشانیاں ڈائری میں لکھ دیں تاکہ دماغ سکون پا سکے۔"
    },
    {
      id: 4,
      title: "Gratitude in Tough Times",
      category: "Positivity",
      readTime: "2 min read",
      emoji: "🌸",
      text: "Gratitude doesn't mean ignoring pain. It means acknowledging that light coexists with shadow. Note one tiny pleasant detail: a warm cup of chai, a gentle breeze, or a comforting sound.",
      urduText: "شکر گزاری کا مطلب درد کو نظر انداز کرنا نہیں، بلکہ اندھیرے میں بھی چھوٹی روشنیوں کو دیکھنا ہے۔"
    }
  ];

  // --- DYNAMIC PROGRESS CALCULATION ---
  const completedCount = (moodLogged ? 1 : 0) + (breathCompleted ? 1 : 0) + (journalSaved ? 1 : 0);
  const progressPercent = Math.round((completedCount / 3) * 100);

  // --- EFFECTS ---
  // Chat auto-scroll
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Meditation Timer Loop
  useEffect(() => {
    if (medActive) {
      timerRef.current = setInterval(() => {
        setMedTimeLeft((prev) => {
          if (prev <= 1) {
            setMedActive(false);
            onTriggerToast("Meditation session completed! Beautiful job. 🧘", "success");
            setBreathCompleted(true); // awards breathing/meditation progress
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [medActive]);

  // Box Breathing Loop (Inhale 4s -> Hold 4s -> Exhale 4s -> Hold 4s)
  useEffect(() => {
    if (breathActive) {
      setBreathCount(4);
      setBreathPhase("Inhale");
      
      let count = 4;
      let phase: typeof breathPhase = "Inhale";

      breathIntervalRef.current = setInterval(() => {
        count -= 1;
        if (count <= 0) {
          count = 4;
          if (phase === "Inhale") {
            phase = "Hold (In)";
            onTriggerToast("Hold your breath gently... 🌸", "info");
          } else if (phase === "Hold (In)") {
            phase = "Exhale";
            onTriggerToast("Exhale slowly and let go of tension... 🌬️", "info");
          } else if (phase === "Hold (In)" || phase === "Exhale") {
            phase = "Hold (Out)";
          } else {
            phase = "Inhale";
            onTriggerToast("Inhale peaceful energy... ☀️", "info");
          }
          setBreathPhase(phase);
        }
        setBreathCount(count);
      }, 1000);
    } else {
      setBreathPhase("Inhale");
      setBreathCount(4);
      if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
    }
    return () => {
      if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
    };
  }, [breathActive]);

  // --- HANDLERS ---
  
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

  const handleSendMessage = async (textToSend: string, audioDataBlob?: Blob | null) => {
    if (!textToSend.trim() && !audioDataBlob) return;

    const userMsg: ChatMessage = {
      id: Date.now(),
      sender: "user",
      
          sessionId: "mobile-user-123",
          text: textToSend,
          framing: useFaithFraming ? "faith-informed" : "secular",
          audioBase64: audioDataBlob ? { data: await blobToBase64(audioDataBlob), mimeType: audioDataBlob.type } : undefined
 || "[Voice Message]",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    const companionMsgId = Date.now() + 1;
    setMessages(prev => [...prev, {
      id: companionMsgId,
      sender: "companion",
      text: "...",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }]);

    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: "mobile-user-123",
          
          sessionId: "mobile-user-123",
          text: textToSend,
          framing: useFaithFraming ? "faith-informed" : "secular",
          audioBase64: audioDataBlob ? { data: await blobToBase64(audioDataBlob), mimeType: audioDataBlob.type } : undefined

        })
      });

      if (!response.ok) throw new Error("Failed to connect");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader");
      const decoder = new TextDecoder();
      
      let fullAiResponse = "";
      let sseBuffer = "";

      setIsTyping(false);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        sseBuffer += decoder.decode(value, {stream: true});
        const lines = sseBuffer.split('\n');
        sseBuffer = lines.pop() || "";

        let isError = false;
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (line.startsWith('event: error')) {
             isError = true;
          } else if (line.startsWith('data: ') && isError) {
             isError = false;
          } else if (line.startsWith('data: ') && lines[i-1] !== 'event: end' && lines[i-1] !== 'event: error') {
            const data = line.slice(6);
            try {
              const parsedData = JSON.parse(data);
              if (parsedData.chunk) {
                fullAiResponse += parsedData.chunk;
                const match = fullAiResponse.match(/"reply"\s*:\s*"((?:[^"\\]|\\.)*)/);
                if (match) {
                  let extractedText = match[1];
                  try { extractedText = JSON.parse('"' + match[1] + '"'); } catch(e) {}
                  
                  setMessages(prev => prev.map(msg => 
                    msg.id === companionMsgId ? { ...msg, text: extractedText } : msg
                  ));
                }
              }
            } catch(e) {}
          } else if (line.startsWith('event: end')) {
            const nextLine = lines[i + 1];
            if (nextLine && nextLine.startsWith('data: ')) {
              try {
                const endData = JSON.parse(nextLine.slice(6));
                if (endData.complete && endData.complete.reply) {
                  const finalReply = endData.complete.reply;
                  setMessages(prev => prev.map(msg => 
                    msg.id === companionMsgId ? { ...msg, text: finalReply } : msg
                  ));
                  if (ttsEnabledRef.current && window.speechSynthesis) {
                    window.speechSynthesis.cancel(); // Stop any ongoing speech
                    const utterance = new SpeechSynthesisUtterance(finalReply);
                    // Use language_code from Gemma if provided, fallback to ur-PK
                    utterance.lang = endData.complete.language_code || 'ur-PK';
                    // Fallback to English if no Urdu voice found, but browser handles this natively
                    window.speechSynthesis.speak(utterance);
                  }
                }
                if (endData.complete && endData.complete.risk_level === "crisis") {
                  setShowCrisisOverlay(true);
                }
              } catch(e) {}
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      setIsTyping(false);
      setMessages(prev => prev.map(msg => 
        msg.id === companionMsgId ? { ...msg, text: "I'm having trouble connecting right now. Please try again or call the helpline." } : msg
      ));
    }
  };

  const handleMoodCheckIn = (moodLabel: string, quote: string) => {
    setSelectedMood(moodLabel);
    setMoodAffirmation(quote);
    onTriggerToast(`Mood recorded: ${moodLabel}`, "success");
  };

  const saveMoodCheckInResult = () => {
    if (!selectedMood) return;
    const moodObj = MOODS_DATA.find(m => m.label === selectedMood);
    const newHistoryItem = {
      date: "Today",
      mood: selectedMood,
      emoji: moodObj?.emoji || "🌸"
    };
    setMoodHistory([newHistoryItem, ...moodHistory]);
    setMoodLogged(true);
    setMoodNotes("");
    setSelectedMood(null);
    onTriggerToast("Daily mood logged into your private timeline!", "success");
  };

  const handleAddJournalEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim()) {
      onTriggerToast("Please write a title and a reflection.", "info");
      return;
    }

    const newEntry: JournalEntry = {
      id: Date.now(),
      title: newTitle,
      body: newBody,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      mood: journalMood,
      promptUsed: activePrompt || undefined
    };

    setJournalEntries([newEntry, ...journalEntries]);
    setNewTitle("");
    setNewBody("");
    setActivePrompt("");
    setJournalSaved(true);
    onTriggerToast("Journal entry saved beautifully!", "success");
  };

  const toggleFavoriteTip = (id: number) => {
    if (favoriteTips.includes(id)) {
      setFavoriteTips(favoriteTips.filter(tId => tId !== id));
      onTriggerToast("Tip removed from favorites", "info");
    } else {
      setFavoriteTips([...favoriteTips, id]);
      onTriggerToast("Tip saved to favorites! 🌸", "success");
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsName.trim()) return;
    setUserProfile({
      ...userProfile,
      name: settingsName
    });
    onTriggerToast("Profile goals and details updated!", "success");
  };

  // Filter tips based on search
  const filteredTips = wellnessTips.filter(tip => 
    tip.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    tip.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tip.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="sukoon-content-area" className="w-full">
      
      {/* ------------------ FLOATING AI CHAT CTA BUTTON ------------------ */}
      {activeModule !== "ai-companion" && (
        <button
          id="floating-ai-companion-cta"
          onClick={() => setActiveModule("ai-companion")}
          className="fixed bottom-22 right-6 z-40 w-14 h-14 bg-[#5DADE2] hover:bg-[#4a9cd3] text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(93,173,226,0.35)] active:scale-90 transition-all duration-300 animate-bounce cursor-pointer group"
          aria-label="Chat with Sukoon AI Companion"
        >
          <div className="relative">
            <Bot className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#A8E6CF] rounded-full border border-white animate-pulse"></span>
          </div>
          {/* Tooltip on hover */}
          <span className="absolute right-16 bg-brand-dark text-white text-[10px] font-bold py-1.5 px-3 rounded-lg shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Chat with Friend
          </span>
        </button>
      )}

      {/* ------------------ TAB 1: HOME SCREEN ------------------ */}
      {activeModule === "dashboard" && (
        <div className="space-y-5 animate-in fade-in duration-300">
          
          {/* SEARCH BAR */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search calm tips or daily affirmations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-11 pr-4 bg-white text-xs text-[#2F3E46] placeholder:text-slate-400 rounded-2xl border border-slate-100 focus:border-[#5DADE2]/60 focus:outline-hidden transition-all shadow-xs font-semibold"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Clear
              </button>
            )}
          </div>

          {/* GREETING */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="font-display font-extrabold text-xl text-[#2F3E46] tracking-tight">
                Assalam-o-Alaikum, <span className="text-[#5DADE2]">{userProfile.name.split(" ")[0]}</span> 👋
              </h2>
              <p className="font-sans text-[11px] text-slate-500 font-semibold leading-none">
                May peace be upon you. Let's practice sukoon today.
              </p>
            </div>

            {/* MINI PROGRESS PANEL */}
            <div 
              onClick={() => setActiveModule("settings")}
              className="flex items-center gap-2 bg-white border border-slate-100 px-3 py-1.5 rounded-2xl shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              <div className="relative w-7 h-7 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="14" cy="14" r="11" stroke="#f1f5f9" strokeWidth="2.5" fill="transparent" />
                  <circle 
                    cx="14" 
                    cy="14" 
                    r="11" 
                    stroke="#5DADE2" 
                    strokeWidth="2.5" 
                    fill="transparent" 
                    strokeDasharray={2 * Math.PI * 11}
                    strokeDashoffset={2 * Math.PI * 11 * (1 - progressPercent / 100)}
                    className="transition-all duration-500"
                  />
                </svg>
                <span className="absolute text-[8px] font-bold text-[#2F3E46]">{completedCount}/3</span>
              </div>
              <span className="text-[10px] font-sans font-bold text-[#2F3E46]">Goal</span>
            </div>
          </div>

          {/* AI CHAT BUTTON (PRIMARY CTA) */}
          <div className="relative p-5 bg-gradient-to-br from-[#5DADE2]/15 via-[#CDB4DB]/10 to-white rounded-3xl border border-[#5DADE2]/10 shadow-[0_4px_25px_rgba(93,173,226,0.06)] overflow-hidden">
            <div className="absolute top-[-20px] right-[-20px] w-28 h-28 bg-[#5DADE2]/10 rounded-full blur-2xl" />
            <div className="absolute bottom-[-10px] left-[-10px] w-20 h-20 bg-[#CDB4DB]/10 rounded-full blur-xl" />
            
            <div className="space-y-3 relative z-10">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white text-[9px] font-extrabold text-[#5DADE2] uppercase tracking-wider shadow-xs">
                ✨ Always Private
              </span>
              <div className="space-y-1">
                <h3 className="font-display font-extrabold text-base text-[#2F3E46] leading-snug">
                  Pour your heart out in secure solace
                </h3>
                <p className="font-body text-xs text-slate-500 font-semibold leading-relaxed">
                  Talk to your AI companion about anxiety, stress, or your daily triumphs. Completely private, stigmas-free friend.
                </p>
              </div>
              <button
                onClick={() => setActiveModule("ai-companion")}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#5DADE2] hover:bg-[#4a9cd3] text-white font-sans font-bold text-xs rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <Bot className="w-4 h-4" /> Let's Start Chatting
              </button>
            </div>
          </div>

          {/* DAILY MOOD selector CARD */}
          <MoodSelector 
            selectedMood={selectedMood} 
            onMoodSelect={handleMoodCheckIn} 
            moodAffirmation={moodAffirmation}
          />

          {/* MOOD SAVE PROMPT */}
          {selectedMood && (
            <div className="bg-emerald-50/50 border border-[#A8E6CF]/30 p-3.5 rounded-2xl flex items-center justify-between gap-3 animate-in slide-in-from-top-1 duration-200">
              <p className="text-[11px] font-body text-slate-600 font-semibold">
                Lock in your <span className="text-emerald-700 font-bold">"{selectedMood}"</span> reflection for today's streak?
              </p>
              <button
                onClick={saveMoodCheckInResult}
                className="px-3.5 py-1.5 bg-[#A8E6CF] hover:bg-[#97cfba] text-slate-800 font-sans font-bold text-[10px] rounded-lg transition-colors cursor-pointer"
              >
                Log Mood
              </button>
            </div>
          )}

          {/* BREATHING & JOURNAL SHORTCUTS GRID */}
          <div className="grid grid-cols-2 gap-3.5">
            
            {/* BREATHING CARD */}
            <div 
              onClick={() => setShowBreathingOverlay(true)}
              className="p-4 bg-white hover:bg-slate-50/50 rounded-3xl border border-slate-100 shadow-xs cursor-pointer active:scale-98 transition-all flex flex-col justify-between min-h-[135px] relative overflow-hidden group"
            >
              <div className="space-y-1.5 relative z-10">
                <div className="w-8 h-8 rounded-xl bg-[#A8E6CF]/20 flex items-center justify-center text-[#90ceb6]">
                  <Wind className="w-4.5 h-4.5 animate-pulse" />
                </div>
                <h4 className="font-display font-extrabold text-xs text-[#2F3E46]">Box Breathing</h4>
                <p className="text-[10px] font-sans text-slate-500 font-semibold leading-normal">
                  4-4-4-4 scientific loop to calm panic.
                </p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-50 relative z-10">
                <span className="text-[9px] font-extrabold text-[#5DADE2] uppercase">Relax Now</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* JOURNAL SHORTCUT */}
            <div 
              onClick={() => setActiveModule("journal")}
              className="p-4 bg-white hover:bg-slate-50/50 rounded-3xl border border-slate-100 shadow-xs cursor-pointer active:scale-98 transition-all flex flex-col justify-between min-h-[135px] relative overflow-hidden group"
            >
              <div className="space-y-1.5 relative z-10">
                <div className="w-8 h-8 rounded-xl bg-[#CDB4DB]/20 flex items-center justify-center text-[#b69cc5]">
                  <PenTool className="w-4.5 h-4.5" />
                </div>
                <h4 className="font-display font-extrabold text-xs text-[#2F3E46]">Private Journal</h4>
                <p className="text-[10px] font-sans text-slate-500 font-semibold leading-normal">
                  Write reflections and gratitude notes.
                </p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-50 relative z-10">
                <span className="text-[9px] font-extrabold text-[#5DADE2] uppercase">Write Entry</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>

            </div>

          </div>

          {/* DYNAMIC WELLNESS TIP CARD / CAROUSEL SECTION */}
          <div className="space-y-2.5">
            <h4 className="font-display font-extrabold text-[12px] text-[#2F3E46] uppercase tracking-wider flex items-center gap-1.5">
              <span>💡</span> Hand-picked Wellness Guides
            </h4>
            
            <div className="space-y-3">
              {filteredTips.length > 0 ? (
                filteredTips.map((tip) => (
                  <div 
                    key={tip.id} 
                    className="p-4 bg-white rounded-3xl border border-slate-100 shadow-xs space-y-3 transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] uppercase font-bold text-[#5DADE2] bg-[#5DADE2]/10 px-2 py-0.5 rounded-md">
                        {tip.category}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-sans text-slate-400 font-bold">{tip.readTime}</span>
                        <button 
                          onClick={() => toggleFavoriteTip(tip.id)}
                          className="p-1 text-slate-300 hover:text-rose-400 transition-colors cursor-pointer"
                          aria-label="Save tip"
                        >
                          <Heart className={`w-3.5 h-3.5 ${favoriteTips.includes(tip.id) ? "text-rose-500 fill-current" : ""}`} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <h5 className="font-display font-extrabold text-[13px] text-[#2F3E46] flex items-center gap-1.5">
                        <span className="select-none">{tip.emoji}</span> {tip.title}
                      </h5>
                      <p className="text-[11px] font-sans text-slate-500 leading-relaxed font-semibold">
                        {tip.text}
                      </p>
                      <p className="text-[10px] font-body text-slate-400 text-right italic font-medium">
                        "{tip.urduText}"
                      </p>
                    </div>

                    <div className="pt-1 flex justify-end">
                      <button 
                        onClick={() => setActiveGuide(tip)}
                        className="text-[10px] font-sans font-extrabold text-[#5DADE2] hover:underline cursor-pointer"
                      >
                        Read exercises details &rarr;
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center bg-white rounded-3xl border border-slate-100">
                  <p className="text-xs text-slate-400">No calm resources matched your search. Try "sleep" or "anxiety".</p>
                </div>
              )}
            </div>
          </div>

          {/* EMERGENCY HELP BUTTON */}
          <div className="pt-2 text-center">
            <button 
              onClick={() => setShowCrisisOverlay(true)}
              className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-rose-50 hover:bg-rose-100/70 border border-rose-100 text-rose-600 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 animate-bounce" /> Emergency Crisis Lines (Pakistan)
            </button>
          </div>

          <div className="h-6" />
        </div>
      )}

      {/* ------------------ TAB 2: AI COMPANION (CHAT) ------------------ */}
      {activeModule === "ai-companion" && (
        <div className="flex flex-col h-[calc(100vh-13.5rem)] min-h-[500px] bg-white rounded-3xl border border-slate-100 shadow-subtle overflow-hidden animate-in fade-in duration-300">
          
          {/* Top Panel */}
          <div className="px-5 py-3.5 border-b border-slate-100 bg-[#F8FAFC]/50 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#5DADE2]/10 flex items-center justify-center text-[#5DADE2]">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xs text-[#2F3E46] leading-none">Sukoon Companion</h3>
                <p className="text-[9px] font-sans text-emerald-600 font-bold mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span> Confidential Safe Space
                </p>
              </div>
            </div>
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
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col max-w-[85%] ${msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"}`}
              >
                <div className={`p-3.5 rounded-2xl font-body leading-relaxed shadow-3xs ${largeFont ? 'text-sm' : 'text-xs'}
                  ${msg.sender === "user"
                    ? "bg-[#5DADE2] text-white rounded-tr-none"
                    : "bg-[#F1F5F9]/80 text-[#2F3E46] border border-slate-100 rounded-tl-none"
                  }
                `}>
                  {msg.text}
                </div>
                <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.time}</span>
              </div>
            ))}

            {isTyping && (
              <div className="flex flex-col items-start max-w-[75%] mr-auto">
                <div className="bg-[#F1F5F9]/80 border border-slate-100 p-3 rounded-2xl rounded-tl-none flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#5DADE2] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-1.5 h-1.5 bg-[#5DADE2] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-1.5 h-1.5 bg-[#5DADE2] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Suggested Prompts Grid */}
          <div className="p-3 border-t border-slate-100/80 bg-white shrink-0 overflow-x-auto">
            <div className="flex gap-2 pb-0.5 whitespace-nowrap scrollbar-none">
              {suggestedPrompts.map((btn) => (
                <button
                  key={btn.label}
                  type="button"
                  onClick={() => handleSendMessage(btn.text)}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-sky-50/50 border border-slate-100 text-[#2F3E46] font-sans font-bold text-[10px] rounded-full transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
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
        </div>
      )}

      {/* ------------------ TAB 3: MOOD TRACKER ------------------ */}
      {activeModule === "mood-tracker" && (
        <div className="max-w-md mx-auto space-y-5 animate-in fade-in duration-300">
          
          <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs space-y-4">
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-extrabold text-[#5DADE2] tracking-wider bg-[#5DADE2]/10 px-2 py-0.5 rounded-full">
                Mindfulness Pulse
              </span>
              <h3 className="font-display font-bold text-base text-[#2F3E46]">Record your emotional anchor</h3>
              <p className="font-body text-xs text-slate-500 leading-relaxed font-semibold">
                By naming our emotional states, we remove their subconscious control. Where is your heart landing right now?
              </p>
            </div>

            {/* Comprehensive Mood Selector */}
            <MoodSelector 
              selectedMood={selectedMood} 
              onMoodSelect={handleMoodCheckIn} 
              moodAffirmation={moodAffirmation}
              compact={true}
            />

            {/* Optional notes area */}
            {selectedMood && (
              <div className="space-y-3 pt-2 animate-in slide-in-from-top-1 duration-200">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    Add a personal note to this feel-state (Optional)
                  </label>
                  <textarea
                    placeholder="Capture a brief reflection of what sparked this emotion..."
                    value={moodNotes}
                    onChange={(e) => setMoodNotes(e.target.value)}
                    className="w-full p-3 bg-slate-50 text-xs text-[#2F3E46] placeholder:text-slate-400 rounded-xl border border-slate-150 focus:border-[#5DADE2]/50 focus:outline-hidden min-h-[60px] font-semibold"
                  />
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={saveMoodCheckInResult}
                    className="px-4.5 py-2 bg-[#5DADE2] hover:bg-[#4a9cd3] text-white font-sans font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Save Reflection
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* MOOD LOG HISTORY TIMELINE */}
          <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs space-y-3.5">
            <h4 className="font-display font-bold text-xs text-[#2F3E46] uppercase tracking-wider flex items-center gap-1.5">
              <span>📅</span> My Feel-State Timeline
            </h4>

            <div className="space-y-2.5">
              {moodHistory.map((log, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-[#F8FAFC]/50 border border-slate-50 rounded-2xl"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl filter drop-shadow-3xs select-none">{log.emoji}</span>
                    <div>
                      <h5 className="text-xs font-bold text-[#2F3E46]">{log.mood}</h5>
                      <p className="text-[9px] text-slate-400 font-bold">Checked in successfully</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 font-bold bg-white px-2 py-0.5 rounded-md border border-slate-100">
                    {log.date}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="h-6" />
        </div>
      )}

      {/* ------------------ TAB 4: JOURNAL ------------------ */}
      {activeModule === "journal" && (
        <div className="max-w-md mx-auto space-y-5 animate-in fade-in duration-300">
          
          {/* NEW JOURNAL CARD */}
          <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-50 pb-2.5">
              <PenTool className="w-4.5 h-4.5 text-[#5DADE2]" />
              <h3 className="font-display font-bold text-sm text-[#2F3E46]">Write a Mindful Reflection</h3>
            </div>

            {/* Gratitude Prompts */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">
                Stuck? Tap a soft gratitude prompt
              </span>
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none select-none">
                {gratitudePrompts.map((prompt, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setActivePrompt(prompt);
                      setNewTitle("Gratitude reflection");
                      setNewBody(`Prompt: ${prompt}\n\n`);
                      onTriggerToast("Prompt added to canvas!", "info");
                    }}
                    className="px-3 py-1.5 bg-[#FAF5FF] hover:bg-[#F3E8FF] border border-[#CDB4DB]/30 text-[#2F3E46] text-[9.5px] font-sans font-bold rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Prompt {index + 1}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAddJournalEntry} className="space-y-3.5">
              
              {activePrompt && (
                <div className="p-3 bg-[#FAF5FF] border border-[#CDB4DB]/20 rounded-xl relative">
                  <p className="text-[10.5px] font-body text-purple-950 font-bold leading-normal">
                    "{activePrompt}"
                  </p>
                  <button 
                    type="button" 
                    onClick={() => {
                      setActivePrompt("");
                      setNewTitle("");
                      setNewBody("");
                    }} 
                    className="absolute top-2 right-2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Entry Title</label>
                <input
                  type="text"
                  placeholder="Give your reflection a supportive title..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full h-10 px-3.5 bg-[#F8FAFC] focus:bg-white text-xs text-[#2F3E46] placeholder:text-slate-400 rounded-xl border border-slate-150 focus:border-[#5DADE2]/60 focus:outline-hidden transition-all font-semibold"
                />
              </div>

              {/* Mood list for journal */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Grounding Mood</label>
                <div className="flex flex-wrap gap-1.5 select-none">
                  {["🌸 Peaceful", "☀️ Grateful", "🌧 Overwhelmed", "🌙 Tired", "🌫 Quiet"].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setJournalMood(m)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-sans font-bold border transition-all cursor-pointer
                        ${journalMood === m 
                          ? "bg-[#5DADE2]/10 border-[#5DADE2] text-[#5DADE2]" 
                          : "bg-white border-slate-200 text-[#2F3E46] hover:bg-slate-50"
                        }
                      `}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Your Thoughts</label>
                <textarea
                  placeholder="Let your words flow in gentle safety. This canvas is fully yours..."
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  className="w-full p-3.5 bg-[#F8FAFC] focus:bg-white text-xs text-[#2F3E46] placeholder:text-slate-400 rounded-xl border border-slate-150 focus:border-[#5DADE2]/60 focus:outline-hidden min-h-[120px] font-semibold leading-relaxed"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-4.5 py-2 bg-[#5DADE2] hover:bg-[#4a9cd3] text-white font-sans font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Save Journal Entry
                </button>
              </div>
            </form>
          </div>

          {/* PAST ENTRIES */}
          <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-50 pb-2">
              <BookOpen className="w-4.5 h-4.5 text-[#5DADE2]" />
              <h3 className="font-display font-bold text-xs text-[#2F3E46] uppercase tracking-wider">Saved Journal Reflections</h3>
            </div>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {journalEntries.length > 0 ? (
                journalEntries.map((entry) => (
                  <div 
                    key={entry.id} 
                    className="p-3.5 bg-[#F8FAFC]/50 hover:bg-[#F8FAFC] border border-slate-50 hover:border-[#5DADE2]/30 rounded-2xl transition-all cursor-pointer group"
                    onClick={() => {
                      onTriggerToast(`Reviewing: "${entry.title}"`, "info");
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-display font-bold text-xs text-[#2F3E46] group-hover:text-[#5DADE2] truncate">{entry.title}</h4>
                      <span className="text-[9px] bg-white border border-slate-100 text-[#2F3E46] font-bold rounded-md px-1.5 py-0.5 whitespace-nowrap">{entry.mood}</span>
                    </div>
                    <p className="text-[10.5px] text-slate-500 font-semibold line-clamp-3 mt-2 leading-relaxed whitespace-pre-line">{entry.body}</p>
                    <span className="text-[9px] text-slate-400 mt-2 block font-bold">{entry.date}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">No reflections written yet. Start your daily comfort record above.</p>
              )}
            </div>
          </div>

          <div className="h-6" />
        </div>
      )}

      {/* ------------------ TAB 5: PROFILE HUB ------------------ */}
      {activeModule === "settings" && (
        <div className="max-w-md mx-auto space-y-5 animate-in fade-in duration-300">
          
          {/* PROFILE AVATAR DETAILS */}
          <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-xs flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-tr from-[#5DADE2] via-[#CDB4DB] to-[#A8E6CF] text-white font-display font-extrabold text-lg rounded-full flex items-center justify-center border-2 border-white shadow-md relative">
              {settingsName.split(" ").map(n => n[0]).join("")}
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white"></span>
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h3 className="font-display font-extrabold text-base text-[#2F3E46] leading-none">{settingsName}</h3>
                <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-[#E0F2FE] text-[#5DADE2] font-extrabold uppercase tracking-wide">
                  Gemma Hacker
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-bold">{userProfile.email}</p>
              <p className="text-[9px] text-slate-400 font-bold">Joined: {userProfile.joinedDate}</p>
            </div>
          </div>

          {/* PROGRESS RING BLOCK */}
          <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs space-y-4">
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-extrabold text-[#5DADE2] tracking-wider bg-[#5DADE2]/10 px-2 py-0.5 rounded-full">
                My Daily Wellness Path
              </span>
              <h4 className="font-display font-bold text-xs text-[#2F3E46] uppercase tracking-wider">
                Progress Tracker
              </h4>
            </div>

            <div className="flex items-center justify-around gap-4 bg-[#F8FAFC]/40 p-4 rounded-2xl border border-slate-50">
              
              {/* Circular Progress Ring */}
              <div className="flex flex-col items-center gap-1.5 shrink-0 select-none">
                <div className="relative w-22 h-22 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    {/* Background Circle */}
                    <circle 
                      cx="44" 
                      cy="44" 
                      r="36" 
                      stroke="#f1f5f9" 
                      strokeWidth="5" 
                      fill="transparent" 
                    />
                    {/* Progress Circle */}
                    <circle 
                      cx="44" 
                      cy="44" 
                      r="36" 
                      stroke="#5DADE2" 
                      strokeWidth="5" 
                      fill="transparent" 
                      strokeDasharray={2 * Math.PI * 36}
                      strokeDashoffset={2 * Math.PI * 36 * (1 - progressPercent / 100)}
                      className="transition-all duration-700 ease-out"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-sm font-mono font-extrabold text-[#2F3E46]">{progressPercent}%</span>
                    <p className="text-[7px] font-sans font-bold text-slate-400 uppercase tracking-widest leading-none">Calm</p>
                  </div>
                </div>
              </div>

              {/* Checkboxes List */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors
                    ${moodLogged ? "bg-emerald-100 border-[#A8E6CF] text-emerald-600" : "bg-white border-slate-200"}`}
                  >
                    {moodLogged && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className={`font-sans font-bold text-[#2F3E46] ${moodLogged ? "line-through text-slate-400" : ""}`}>
                    Daily Mood Logged
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors
                    ${breathCompleted ? "bg-emerald-100 border-[#A8E6CF] text-emerald-600" : "bg-white border-slate-200"}`}
                  >
                    {breathCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className={`font-sans font-bold text-[#2F3E46] ${breathCompleted ? "line-through text-slate-400" : ""}`}>
                    Box Breathing Session
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors
                    ${journalSaved ? "bg-emerald-100 border-[#A8E6CF] text-emerald-600" : "bg-white border-slate-200"}`}
                  >
                    {journalSaved && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className={`font-sans font-bold text-[#2F3E46] ${journalSaved ? "line-through text-slate-400" : ""}`}>
                    Mindful Journal Reflection
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* EDIT INTENTIONS FORM */}
          <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs space-y-4">
            <h4 className="font-display font-bold text-xs text-[#2F3E46] uppercase tracking-wider">
              Wellness Focus & Goals
            </h4>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Customize Name</label>
                <input
                  type="text"
                  value={settingsName}
                  onChange={(e) => setSettingsName(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 focus:bg-white text-xs text-[#2F3E46] rounded-xl border border-slate-150 focus:border-[#5DADE2]/60 focus:outline-hidden transition-all font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">My Intention Statement</label>
                <textarea
                  value={settingsBio}
                  onChange={(e) => setSettingsBio(e.target.value)}
                  className="w-full p-3 bg-slate-50 focus:bg-white text-xs text-[#2F3E46] rounded-xl border border-slate-150 focus:border-[#5DADE2]/60 focus:outline-hidden min-h-[64px] font-semibold leading-relaxed"
                />
              </div>

              {/* Reminders Toggle Switch */}
              <div className="p-3 bg-[#F8FAFC]/50 rounded-xl flex items-center justify-between border border-slate-50">
                <div className="space-y-0.5">
                  <h5 className="text-[11px] font-sans font-bold text-[#2F3E46]">Daily Calming Reminders</h5>
                  <p className="text-[9px] text-slate-400 font-bold">Triggers gentle reminders to reflect and breathe.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSettingsReminders(!settingsReminders);
                    onTriggerToast(settingsReminders ? "Reminders muted" : "Reminders enabled! 🌸", "info");
                  }}
                  className={`w-9 h-5.5 rounded-full p-0.5 transition-all duration-300 flex items-center cursor-pointer ${
                    settingsReminders ? "bg-[#5DADE2] justify-end" : "bg-slate-200 justify-start"
                  }`}
                  aria-label="Toggle daily reminders"
                >
                  <span className="w-4.5 h-4.5 bg-white rounded-full shadow-xs" />
                </button>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-4.5 py-2 bg-[#5DADE2] hover:bg-[#4a9cd3] text-white font-sans font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" /> Save Goals
                </button>
              </div>
            </form>
          </div>

          <div className="h-6" />
        </div>
      )}

      {/* ------------------ BREATHING EXERCISE OVERLAY MODAL ------------------ */}
      {showBreathingOverlay && (
        <div className="absolute inset-0 bg-[#F8FAFC] z-50 flex flex-col p-6 overflow-y-auto animate-in fade-in slide-in-from-bottom duration-350 select-none">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-2">
              <Wind className="w-5 h-5 text-[#5DADE2]" />
              <h3 className="font-display font-extrabold text-sm text-[#2F3E46]">Box Breathing Loop</h3>
            </div>
            <button 
              onClick={() => {
                setBreathActive(false);
                setShowBreathingOverlay(false);
              }}
              className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 active:scale-90 transition-transform cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Subheading */}
          <div className="text-center py-4 space-y-1 shrink-0">
            <span className="text-[10px] uppercase font-extrabold text-[#5DADE2] bg-[#5DADE2]/10 px-2.5 py-0.5 rounded-full">
              4-4-4-4 Box Method
            </span>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed max-w-xs mx-auto">
              Follow the pacing halo to regulate oxygen, stabilize heart rates, and ground physical anxiety.
            </p>
          </div>

          {/* Central Breath Loop Graphics */}
          <div className="flex-1 flex flex-col items-center justify-center min-h-[220px] py-4 relative">
            <div className="relative w-56 h-56 flex items-center justify-center">
              
              {/* Calming expanding halo circle */}
              <div 
                className={`absolute rounded-full bg-[#5DADE2]/10 border border-[#5DADE2]/30 transition-all duration-4000 ease-in-out
                  ${breathPhase === "Inhale" && breathActive ? "w-56 h-56 opacity-100 scale-100" : ""}
                  ${breathPhase === "Hold (In)" && breathActive ? "w-56 h-56 opacity-100 scale-100 ring-8 ring-[#5DADE2]/15" : ""}
                  ${breathPhase === "Exhale" && breathActive ? "w-28 h-28 opacity-40 scale-50" : ""}
                  ${breathPhase === "Hold (Out)" && breathActive ? "w-28 h-28 opacity-40 scale-50" : ""}
                  ${!breathActive ? "w-40 h-40 opacity-30 scale-75" : ""}
                `}
              />

              {/* Core central puck */}
              <div className="w-32 h-32 bg-white rounded-full border border-sky-100 shadow-xl z-10 flex flex-col items-center justify-center text-center p-3">
                <span className="text-sm font-display font-extrabold text-[#2F3E46]">
                  {!breathActive ? "Ready" : breathPhase}
                </span>
                <span className="text-3xl font-mono font-extrabold text-[#5DADE2] mt-1.5 tabular-nums">
                  {!breathActive ? "—" : breathCount}
                </span>
              </div>
            </div>

            {/* Instruction description cue */}
            <div className="text-center mt-6 max-w-xs">
              <p className="text-xs font-bold text-[#2F3E46] min-h-[32px] leading-relaxed">
                {breathPhase === "Inhale" && breathActive && "Slowly fill your lungs with fresh, comforting air..."}
                {breathPhase === "Hold (In)" && breathActive && "Gently hold the breath, relaxing your shoulders..."}
                {breathPhase === "Exhale" && breathActive && "Slowly release the breath, letting go of any worry..."}
                {breathPhase === "Hold (Out)" && breathActive && "Rest empty and peaceful before the next inhale..."}
                {!breathActive && "Find a comfortable posture and click begin when ready."}
              </p>
            </div>
          </div>

          {/* Controls Footer */}
          <div className="py-6 border-t border-slate-50 shrink-0 flex flex-col gap-3">
            <button
              onClick={() => {
                setBreathActive(!breathActive);
                if (!breathActive) {
                  onTriggerToast("Breathing loop started! Follow the halo.", "info");
                  setBreathCompleted(true); // awards breathing task
                }
              }}
              className={`w-full py-3 text-white font-sans font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer
                ${breathActive ? "bg-amber-400 hover:bg-amber-500" : "bg-[#5DADE2] hover:bg-[#4a9cd3]"}
              `}
            >
              {breathActive ? "Pause Respiration Loop" : "Begin Box Breathing Loop"}
            </button>
            
            <button
              onClick={() => {
                setBreathActive(false);
                setBreathCount(4);
                setBreathPhase("Inhale");
                onTriggerToast("Pacing reset", "info");
              }}
              className="w-full py-2.5 bg-white border border-slate-200 text-[#2F3E46] hover:bg-slate-50 font-sans font-bold text-[11px] rounded-xl transition-colors cursor-pointer"
            >
              Reset Session
            </button>
          </div>
        </div>
      )}

      {/* ------------------ MEDITATION TIMER OVERLAY MODAL ------------------ */}
      {showMeditationOverlay && (
        <div className="absolute inset-0 bg-[#F8FAFC] z-50 flex flex-col p-6 overflow-y-auto animate-in fade-in slide-in-from-bottom duration-350 select-none">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#5DADE2]" />
              <h3 className="font-display font-extrabold text-sm text-[#2F3E46]">Sanctuary of Silence</h3>
            </div>
            <button 
              onClick={() => {
                setMedActive(false);
                setShowMeditationOverlay(false);
              }}
              className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 active:scale-90 transition-transform cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Subheading */}
          <div className="text-center py-4 space-y-1 shrink-0">
            <span className="text-[10px] uppercase font-extrabold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full">
              Silent Stillness Sanctuary
            </span>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed max-w-xs mx-auto">
              Close your eyes, breathe naturally, and sit in loving, non-judgmental awareness of your self.
            </p>
          </div>

          {/* Central Timer */}
          <div className="flex-1 flex flex-col items-center justify-center py-4 space-y-6">
            <div className="w-48 h-48 rounded-full border-4 border-slate-100 bg-white flex items-center justify-center relative shadow-inner">
              {medActive && (
                <div className="absolute inset-0 rounded-full border-4 border-[#5DADE2]/30 animate-ping opacity-60"></div>
              )}
              <div className="text-center">
                <span className="text-3xl font-mono font-extrabold text-[#2F3E46] tabular-nums">
                  {Math.floor(medTimeLeft / 60)}:{(medTimeLeft % 60) < 10 ? "0" : ""}{medTimeLeft % 60}
                </span>
                <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-widest font-extrabold">
                  {medActive ? "In Stillness" : "Ready"}
                </p>
              </div>
            </div>

            {/* Quick configuration presets */}
            <div className="space-y-2 w-full text-center">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Select Duration</span>
              <div className="flex justify-center gap-2">
                {[60, 180, 300, 600].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => {
                      setMedActive(false);
                      setSelectedDuration(sec);
                      setMedTimeLeft(sec);
                      onTriggerToast(`${sec / 60} min duration set`, "info");
                    }}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-sans font-bold border transition-all cursor-pointer
                      ${selectedDuration === sec 
                        ? "bg-[#5DADE2]/15 border-[#5DADE2] text-[#5DADE2]" 
                        : "bg-white border-slate-200 text-[#2F3E46] hover:bg-slate-50"
                      }
                    `}
                  >
                    {sec / 60} Min
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Controls Footer */}
          <div className="py-6 border-t border-slate-50 shrink-0 flex flex-col gap-3">
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setMedActive(!medActive);
                  if (!medActive) onTriggerToast("Silence timer activated", "success");
                }}
                className={`flex-1 py-3 text-white font-sans font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2
                  ${medActive ? "bg-amber-400 hover:bg-amber-500" : "bg-[#5DADE2] hover:bg-[#4a9cd3]"}
                `}
              >
                {medActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                {medActive ? "Pause Sanctuary" : "Enter Sanctuary"}
              </button>
              
              <button
                onClick={() => {
                  setMedActive(false);
                  setMedTimeLeft(selectedDuration);
                  onTriggerToast("Timer reset", "info");
                }}
                className="px-4 bg-white border border-slate-250 text-[#2F3E46] rounded-xl flex items-center justify-center hover:bg-slate-50 active:scale-95 cursor-pointer"
                title="Reset"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------ CRISIS HELPLINES OVERLAY MODAL ------------------ */}
      {showCrisisOverlay && (
        <div className="absolute inset-0 bg-[#F8FAFC] z-55 flex flex-col p-6 overflow-y-auto animate-in fade-in slide-in-from-bottom duration-350 select-none">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-2 text-rose-600">
              <Phone className="w-5 h-5 animate-pulse" />
              <h3 className="font-display font-extrabold text-sm">Emergency Hotlines (Pakistan)</h3>
            </div>
            <button 
              onClick={() => setShowCrisisOverlay(false)}
              className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 active:scale-90 transition-transform cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Subheading */}
          <div className="py-4 space-y-2 shrink-0">
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              If you or someone you care about is experiencing severe mental distress, acute anxiety, or thoughts of self-harm, please reach out directly to these WHO-recognized, professional clinical help services:
            </p>
          </div>

          {/* List of helplines */}
          <div className="flex-1 space-y-4 py-2">
            
            <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-3xs space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-[9px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Recommended
                </span>
                <span className="text-[9px] font-sans text-slate-400 font-bold">24/7 Support</span>
              </div>
              <h4 className="font-display font-extrabold text-xs text-[#2F3E46]">Umang Pakistan Helpline</h4>
              <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                An expert psychiatric healthcare platform providing psychological support, free therapy counseling, and crisis management. Fully integrated with clinical supervisors.
              </p>
              <div className="pt-2 flex justify-end">
                <a 
                  href="tel:03111222644" 
                  className="px-4.5 py-2 bg-[#5DADE2] text-white font-mono font-bold text-xs rounded-xl active:scale-95 transition-all inline-flex items-center gap-1.5"
                >
                  <Phone className="w-3 h-3 fill-current" /> 0311-1222-644
                </a>
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-3xs space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-[9px] uppercase font-bold text-[#5DADE2] bg-[#5DADE2]/10 px-2 py-0.5 rounded-md">
                  Telehealth
                </span>
                <span className="text-[9px] font-sans text-slate-400 font-bold">Mental Helpline</span>
              </div>
              <h4 className="font-display font-extrabold text-xs text-[#2F3E46]">Sehat Kahani Helpline</h4>
              <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                Dedicated virtual mental counseling hotlines connecting you to fully qualified clinical psychologists and trauma counselors. Safe and confidential.
              </p>
              <div className="pt-2 flex justify-end">
                <a 
                  href="tel:021111734282" 
                  className="px-4.5 py-2 bg-[#5DADE2] text-white font-mono font-bold text-xs rounded-xl active:scale-95 transition-all inline-flex items-center gap-1.5"
                >
                  <Phone className="w-3 h-3 fill-current" /> 021-111-734-282
                </a>
              </div>
            </div>

          </div>

          {/* Footer warning */}
          <div className="py-4 border-t border-slate-100 shrink-0 text-center">
            <p className="text-[9px] text-slate-400 font-semibold max-w-xs mx-auto">
              Sukoon AI is a supportive companion designed to assist with mild stress and daily pacing. It does not replace active psychiatric medical care.
            </p>
          </div>
        </div>
      )}

      {/* ------------------ DETAILED WELLNESS GUIDE CANVAS MODAL ------------------ */}
      {activeGuide && (
        <div className="absolute inset-0 bg-[#F8FAFC] z-55 flex flex-col p-6 overflow-y-auto animate-in fade-in slide-in-from-bottom duration-350 select-none">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-2 text-[#5DADE2]">
              <BookOpen className="w-5 h-5" />
              <h3 className="font-display font-extrabold text-sm text-[#2F3E46]">Wellness Guide</h3>
            </div>
            <button 
              onClick={() => setActiveGuide(null)}
              className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 active:scale-90 transition-transform cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 py-4 space-y-4">
            <span className="text-[9px] uppercase font-extrabold text-[#5DADE2] bg-[#5DADE2]/10 px-2 py-0.5 rounded-full select-none">
              {activeGuide.category} • {activeGuide.readTime}
            </span>
            <h2 className="font-display font-extrabold text-lg text-[#2F3E46]">
              {activeGuide.title}
            </h2>
            
            <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-3xs text-xs text-[#2F3E46] leading-relaxed font-body whitespace-pre-line">
              {activeGuide.text}
            </div>

            <div className="p-4 bg-[#F0FDF4] rounded-2xl border border-[#A8E6CF]/30 text-xs text-emerald-800 leading-relaxed font-body italic text-center">
              "{activeGuide.urduText}"
            </div>

            {/* Practical exercise shortcut button */}
            {activeGuide.title.includes("Grounding") && (
              <button
                onClick={() => {
                  setActiveGuide(null);
                  setShowBreathingOverlay(true);
                }}
                className="w-full py-3 bg-[#5DADE2] text-white font-sans font-bold text-xs rounded-xl shadow-xs transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Wind className="w-4 h-4" /> Practice Grounding Box Breath
              </button>
            )}

            {activeGuide.title.includes("Sleep") && (
              <button
                onClick={() => {
                  setActiveGuide(null);
                  setShowMeditationOverlay(true);
                }}
                className="w-full py-3 bg-[#5DADE2] text-white font-sans font-bold text-xs rounded-xl shadow-xs transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" /> Launch Silent Wind-down Timer
              </button>
            )}
          </div>

          {/* Footer close */}
          <div className="py-4 border-t border-slate-50 shrink-0 text-center">
            <button
              onClick={() => setActiveGuide(null)}
              className="px-6 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-[#2F3E46] font-sans font-bold text-xs rounded-xl cursor-pointer"
            >
              Done Reading
            </button>
          </div>
        </div>
      )}


      {/* ------------------ TAB 5: SETTINGS ------------------ */}
      {activeModule === "settings" && (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs space-y-4">
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-extrabold text-[#5DADE2] tracking-wider bg-[#5DADE2]/10 px-2 py-0.5 rounded-full">
                Preferences
              </span>
              <h3 className="font-display font-bold text-base text-[#2F3E46]">App Settings</h3>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-display font-bold text-xs text-[#2F3E46]">Faith-Informed Framing</h4>
                  <p className="text-[10px] text-slate-500 font-semibold">Use Islamic terminology and concepts for coping.</p>
                </div>
                <button 
                  onClick={() => setUseFaithFraming(!useFaithFraming)}
                  className={`w-10 h-6 rounded-full p-1 transition-colors ${useFaithFraming ? 'bg-[#5DADE2]' : 'bg-slate-200'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${useFaithFraming ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-display font-bold text-xs text-[#2F3E46]">Large Text</h4>
                  <p className="text-[10px] text-slate-500 font-semibold">Increase readability in chat.</p>
                </div>
                <button 
                  onClick={() => setLargeFont(!largeFont)}
                  className={`w-10 h-6 rounded-full p-1 transition-colors ${largeFont ? 'bg-[#5DADE2]' : 'bg-slate-200'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${largeFont ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>

              
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

              <div className="pt-4 border-t border-slate-100">
                 <button 
                   onClick={() => {
                     fetch('http://localhost:3000/api/clear', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({sessionId: 'mobile-user-123'}) })
                       .then(() => {
                         setMessages([]);
                         onTriggerToast("Session cleared securely.", "success");
                       });
                   }}
                   className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl transition-colors"
                 >
                   Clear Session Data
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* ------------------ TAB 6: INSIGHTS ------------------ */}
      {activeModule === "insights" && (
        <AnalyticsDashboard />
      )}

    </div>
  );
}
