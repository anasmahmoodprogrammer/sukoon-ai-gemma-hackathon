import React, { useState, useEffect } from "react";
import { 
  Search, 
  Bell, 
  ChevronDown, 
  User, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Calendar, 
  Clock,
  Sparkles
} from "lucide-react";
import { ModuleId, UserProfile } from "../types";

interface TopbarProps {
  userProfile: UserProfile;
  activeModule: ModuleId;
  setActiveModule: (module: ModuleId) => void;
  onOpenHelpModal: () => void;
  onOpenLogoutModal: () => void;
  onTriggerToast: (message: string, type: "success" | "info") => void;
}

export default function Topbar({
  userProfile,
  setActiveModule,
  onOpenHelpModal,
  onOpenLogoutModal,
  onTriggerToast
}: TopbarProps) {
  const [hasNewNotification, setHasNewNotification] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");

  // Simulated notifications list with mindful reminders
  const notifications = [
    { id: 1, text: "Breathe in... Breathe out. Time for a quick break.", read: false, time: "Just now" },
    { id: 2, text: "You've stayed mindful today! Your journal is waiting.", read: false, time: "2h ago" },
    { id: 3, text: "A peaceful mind leads to a peaceful heart.", read: true, time: "5h ago" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format date elegantly: "Tuesday, Jul 14, 2026"
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  // Format time beautifully: "12:31:05 AM"
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onTriggerToast(`Search placeholder activated for: "${searchQuery}"`, "info");
      setSearchQuery("");
    }
  };

  return (
    <header 
      id="sukoon-header"
      className="w-full h-18 bg-white/95 backdrop-blur-md border-b border-[#E1E9EE] z-30 flex items-center justify-between px-5 shrink-0 select-none"
    >
      {/* Left Section: Personalized Greeting & Mobile Logo */}
      <div className="flex items-center gap-2.5">
        <div 
          onClick={() => setActiveModule("dashboard")}
          className="w-9 h-9 rounded-xl bg-brand-primary flex items-center justify-center shadow-xs shrink-0 font-display font-bold text-white text-base cursor-pointer active:scale-95 transition-transform"
        >
          S
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] font-sans font-medium text-brand-gray/95 leading-none flex items-center gap-1">
            Assalam-o-Alaikum 👋 <span className="text-[9px] px-1 py-0.5 rounded-full bg-[#E0F2FE] text-brand-primary font-bold">Sukoon AI</span>
          </span>
          <span className="text-[14px] font-display font-bold text-brand-dark leading-tight mt-0.5">
            {userProfile.name}
          </span>
        </div>
      </div>

      {/* Right Section: Notification Bell and Profile Avatar */}
      <div className="flex items-center gap-1.5">
        {/* Dynamic Notification center (Mindful reminders) */}
        <div className="relative">
          <button
            onClick={() => {
              const GENTLE_WISDOM = [
                "Breathe in peace... Breathe out worry. You are doing wonderfully. 🌸",
                "Assalam-o-Alaikum! Pause for 5 seconds and appreciate this present moment. ✨",
                "A peaceful mind leads to a peaceful heart. Be gentle with yourself today. ☀️",
                "You have stayed mindful today! Your journal is waiting for your thoughts. 📖",
                "Take a deep breath. Focus on the quiet rhythm of your heart. 🌙",
                "Rest is a self-loving shelter for your soul. It is okay to take a break. 🌫"
              ];
              const randomWisdom = GENTLE_WISDOM[Math.floor(Math.random() * GENTLE_WISDOM.length)];
              onTriggerToast(randomWisdom, "success");
              setHasNewNotification(false);
            }}
            id="notification-bell-btn"
            className="relative p-2 text-brand-dark hover:text-brand-primary hover:bg-brand-bg rounded-full transition-all duration-300 focus:outline-hidden cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="Daily mindfulness notification"
          >
            <Bell className="w-5 h-5" />
            {hasNewNotification && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-error rounded-full ring-2 ring-white"></span>
            )}
          </button>
        </div>

        {/* User Profile Avatar which navigates directly to Settings/Profile Tab */}
        <button
          onClick={() => setActiveModule("settings")}
          id="profile-dropdown-btn"
          className="w-10 h-10 bg-brand-accent text-white font-bold text-xs rounded-full flex items-center justify-center border-2 border-white shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer overflow-hidden"
          aria-label="Profile Settings"
        >
          {userProfile.avatarUrl ? (
            <img 
              src={userProfile.avatarUrl} 
              alt={userProfile.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // If image fails, clear avatarUrl to trigger fallback to initials
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            userProfile.name.split(" ").map(n => n[0]).join("")
          )}
        </button>
      </div>
    </header>
  );
}
