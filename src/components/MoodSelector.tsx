import React from "react";
import { Sparkles, Heart } from "lucide-react";

export interface MoodItem {
  emoji: string;
  label: string;
  urduLabel: string;
  colorClass: string;
  bgClass: string;
  ringClass: string;
  accentBorder: string;
  quote: string;
}

interface MoodSelectorProps {
  selectedMood: string | null;
  onMoodSelect: (moodLabel: string, quote: string) => void;
  moodAffirmation?: string;
  compact?: boolean;
}

export const MOODS_DATA: MoodItem[] = [
  { 
    emoji: "🌸", 
    label: "Peaceful", 
    urduLabel: "سکون", 
    colorClass: "text-[#5DADE2]", 
    bgClass: "bg-[#5DADE2]/10", 
    ringClass: "ring-[#5DADE2]/20",
    accentBorder: "border-[#5DADE2]/40",
    quote: "Quiet minds bring inner strength and self-confidence. Breathe in peace." 
  },
  { 
    emoji: "☀️", 
    label: "Grateful", 
    urduLabel: "شکر گزار", 
    colorClass: "text-[#A8E6CF]", 
    bgClass: "bg-[#A8E6CF]/15", 
    ringClass: "ring-[#A8E6CF]/25",
    accentBorder: "border-[#A8E6CF]/40",
    quote: "Gratitude turns what we have into enough. Appreciate the little lights." 
  },
  { 
    emoji: "🌧", 
    label: "Overwhelmed", 
    urduLabel: "پریشان", 
    colorClass: "text-[#CDB4DB]", 
    bgClass: "bg-[#CDB4DB]/15", 
    ringClass: "ring-[#CDB4DB]/25",
    accentBorder: "border-[#CDB4DB]/40",
    quote: "It is okay to feel overwhelmed. Storms pass, and skies clear. Take it one gentle breath at a time." 
  },
  { 
    emoji: "🌙", 
    label: "Exhausted", 
    urduLabel: "تھکا ہوا", 
    colorClass: "text-purple-500", 
    bgClass: "bg-purple-50", 
    ringClass: "ring-purple-100",
    accentBorder: "border-purple-200",
    quote: "Rest is not idleness; it is a vital, self-loving shelter for your beautiful soul." 
  },
  { 
    emoji: "🌫", 
    label: "Quiet", 
    urduLabel: "خاموش", 
    colorClass: "text-slate-500", 
    bgClass: "bg-slate-50", 
    ringClass: "ring-slate-100",
    accentBorder: "border-slate-200",
    quote: "There is immense power and safety in slow reflection. Listen gently to your inner voice." 
  }
];

export default function MoodSelector({
  selectedMood,
  onMoodSelect,
  moodAffirmation,
  compact = false
}: MoodSelectorProps) {
  return (
    <div 
      id="mood-selector-container" 
      className={`bg-white rounded-[24px] border border-black/5 p-4.5 shadow-xs transition-all duration-300 ${
        compact ? "space-y-3" : "space-y-4"
      }`}
    >
      {/* Title Header with interactive micro-icons */}
      <div className="flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#5DADE2]/10 flex items-center justify-center text-[#5DADE2]">
            <Heart className="w-3.5 h-3.5 fill-current" />
          </div>
          <h4 className="font-display font-extrabold text-[13px] text-[#2F3E46] uppercase tracking-wider">
            How is your heart feeling?
          </h4>
        </div>
        <span className="text-[9px] font-sans font-bold text-[#5DADE2] bg-[#5DADE2]/10 px-2 py-0.5 rounded-full select-none">
          Quick Check
        </span>
      </div>

      {/* Comforting Interactive Emojis Grid */}
      <div className="grid grid-cols-5 gap-1.5 select-none">
        {MOODS_DATA.map((mood) => {
          const isSelected = selectedMood === mood.label;
          return (
            <button
              key={mood.label}
              id={`mood-btn-${mood.label.toLowerCase()}`}
              type="button"
              onClick={() => onMoodSelect(mood.label, mood.quote)}
              className={`group flex flex-col items-center justify-center py-2 px-1 rounded-2xl border transition-all duration-300 active:scale-95 cursor-pointer ${
                isSelected
                  ? `border-solid ${mood.accentBorder} ${mood.bgClass} ring-2 ${mood.ringClass}`
                  : "border-slate-100 bg-slate-50/40 hover:bg-white hover:border-[#5DADE2]/30"
              }`}
              aria-label={`Select ${mood.label} mood`}
            >
              {/* Soothing Emoji with float-up on hover & spring back on active */}
              <span className="text-2xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.03)] transition-transform duration-200 group-hover:scale-115 group-active:scale-90">
                {mood.emoji}
              </span>
              
              {/* English Label */}
              <span className={`text-[9px] font-sans font-bold mt-1 text-center truncate w-full transition-colors duration-200 ${
                isSelected ? mood.colorClass : "text-[#2F3E46]/80"
              }`}>
                {mood.label}
              </span>

              {/* Urdu Sub-label (Subtle and extremely beautiful) */}
              <span className={`text-[8px] font-sans opacity-70 leading-none mt-0.5 ${
                isSelected ? mood.colorClass : "text-slate-400"
              }`}>
                {mood.urduLabel}
              </span>
            </button>
          );
        })}
      </div>

      {/* Built-in dynamic reflection card with comforting background gradients */}
      {selectedMood && moodAffirmation && (
        <div 
          id="mood-affirmation-card"
          className="p-3.5 bg-gradient-to-r from-slate-50 to-[#5DADE2]/5 rounded-xl border border-[#5DADE2]/10 animate-in fade-in slide-in-from-top-1 duration-300 flex gap-2.5 items-start"
        >
          <div className="w-5 h-5 rounded-full bg-[#5DADE2]/10 flex items-center justify-center text-[#5DADE2] shrink-0 mt-0.5">
            <Sparkles className="w-3 h-3" />
          </div>
          <div className="space-y-0.5">
            <h5 className="text-[10px] font-sans font-extrabold text-[#5DADE2] uppercase tracking-wider">
              A Gentle Reminder
            </h5>
            <p className="text-[10.5px] text-[#2F3E46] leading-relaxed font-semibold">
              "{moodAffirmation}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
