import React, { useEffect } from "react";
import { X, HelpCircle, LogOut, Check } from "lucide-react";

interface ModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: "help" | "logout" | "standard";
  onConfirm?: () => void;
  children?: React.ReactNode;
}

export default function ModalShell({
  isOpen,
  onClose,
  title,
  type,
  onConfirm,
  children
}: ModalShellProps) {
  
  // Close on Esc key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      id="modal-backdrop-overlay"
      className="fixed inset-0 bg-brand-dark/30 backdrop-blur-xs z-55 flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        id="modal-card-box"
        className="w-full max-w-md bg-white rounded-3xl border border-sky-50 shadow-2xl p-6 sm:p-8 space-y-6 transform origin-center transition-all animate-in scale-in duration-300"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-50 pb-3">
          <div className="flex items-center gap-2.5">
            {type === "help" && <HelpCircle className="w-5 h-5 text-brand-primary" />}
            {type === "logout" && <LogOut className="w-5 h-5 text-brand-error" />}
            <h3 className="font-display font-bold text-base text-brand-dark">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-brand-bg rounded-lg text-brand-gray hover:text-brand-dark transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="font-body text-sm text-brand-dark/90 leading-relaxed">
          {children ? (
            children
          ) : type === "help" ? (
            <div className="space-y-4">
              <p>
                Welcome to <strong>Sukoon AI Support Center</strong>. We are here to guide you on finding tranquility and utilizing our mental wellness resources safely.
              </p>
              <div className="p-4 bg-sky-50/40 border border-sky-100/50 rounded-2xl space-y-2">
                <h4 className="font-display font-bold text-xs text-brand-primary">Frequently Asked Questions</h4>
                <div className="text-xs space-y-2">
                  <p><strong>Q: Is my data private?</strong><br />A: Yes. All data in this mockup is stored entirely in your local browser state and is completely confidential.</p>
                  <p><strong>Q: Is this a replacement for therapy?</strong><br />A: No. Sukoon AI is a supportive companion. If you are experiencing a crisis, please use the Crisis Hotlines in our Community module.</p>
                </div>
              </div>
            </div>
          ) : type === "logout" ? (
            <div className="space-y-3">
              <p>
                Are you sure you want to sign out from your Sukoon AI dashboard session?
              </p>
              <p className="text-xs text-brand-gray bg-red-50 p-3 rounded-xl border border-red-100">
                Signing out will temporarily clear local journal histories and session caches stored in this browser session.
              </p>
            </div>
          ) : null}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-brand-dark font-body font-semibold text-xs rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          
          {(type === "logout" || onConfirm) && (
            <button
              onClick={() => {
                if (onConfirm) onConfirm();
                onClose();
              }}
              className={`px-4 py-2 font-body font-bold text-xs rounded-xl text-white shadow-md transition-colors cursor-pointer
                ${type === "logout" 
                  ? "bg-brand-error hover:bg-red-500 shadow-red-100" 
                  : "bg-brand-primary hover:bg-sky-400 shadow-sky-100"
                }
              `}
            >
              Confirm
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
