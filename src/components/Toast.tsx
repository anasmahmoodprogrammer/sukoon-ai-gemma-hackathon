import React, { useEffect } from "react";
import { Sparkles, Check, Info, X } from "lucide-react";

interface ToastProps {
  message: string;
  type: "success" | "info";
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  
  // Auto close toast after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div 
      id="sukoon-toast-notification"
      className={`fixed bottom-6 left-6 z-50 p-4 max-w-sm rounded-2xl border shadow-xl flex items-start gap-3.5 select-none animate-in slide-in-from-bottom-6 fade-in duration-300
        ${type === "success" 
          ? "bg-white border-emerald-100 text-brand-dark" 
          : "bg-white border-sky-100 text-brand-dark"
        }
      `}
    >
      {/* Dynamic Status Icon */}
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0
        ${type === "success" 
          ? "bg-emerald-50 text-emerald-600" 
          : "bg-sky-50 text-brand-primary"
        }
      `}>
        {type === "success" ? (
          <Check className="w-4.5 h-4.5" />
        ) : (
          <Info className="w-4.5 h-4.5" />
        )}
      </div>

      {/* Message and Description */}
      <div className="flex-1 space-y-0.5">
        <h4 className="font-display font-bold text-xs text-brand-dark">
          {type === "success" ? "Mindful Step Achieved" : "Sukoon Notification"}
        </h4>
        <p className="font-body text-xs text-brand-gray leading-relaxed">
          {message}
        </p>
      </div>

      {/* Close button */}
      <button 
        onClick={onClose}
        className="p-1 hover:bg-slate-50 text-brand-gray hover:text-brand-dark rounded-lg transition-colors cursor-pointer"
        aria-label="Dismiss toast"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
