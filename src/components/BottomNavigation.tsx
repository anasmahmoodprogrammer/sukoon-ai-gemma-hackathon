import React from "react";
import { Home, Bot, Smile, BookOpen, User } from "lucide-react";
import { ModuleId } from "../types";

interface BottomNavigationProps {
  activeModule: ModuleId;
  setActiveModule: (module: ModuleId) => void;
}

export default function BottomNavigation({
  activeModule,
  setActiveModule,
}: BottomNavigationProps) {
  const navItems = [
    {
      id: "dashboard" as ModuleId,
      label: "Home",
      icon: Home,
    },
    {
      id: "ai-companion" as ModuleId,
      label: "AI Chat",
      icon: Bot,
    },
    {
      id: "mood-tracker" as ModuleId,
      label: "Mood",
      icon: Smile,
    },
    {
      id: "journal" as ModuleId,
      label: "Journal",
      icon: BookOpen,
    },
    {
      id: "settings" as ModuleId, // mapped to profile
      label: "Profile",
      icon: User,
    },
  ];

  return (
    <nav
      id="sukoon-bottom-nav"
      className="w-full bg-white/90 backdrop-blur-md border-t border-[#E1E9EE] h-18 px-4 flex items-center justify-around z-30 shadow-[0_-4px_24px_rgba(0,0,0,0.03)] shrink-0"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeModule === item.id || (item.id === "settings" && activeModule === "settings");

        return (
          <button
            key={item.id}
            onClick={() => setActiveModule(item.id)}
            id={`bottom-nav-item-${item.id}`}
            className="flex flex-col items-center justify-center flex-1 h-full min-w-[64px] min-h-[48px] cursor-pointer group focus:outline-hidden transition-all duration-200"
          >
            {/* Icon Wrapper with bounce/glow accent */}
            <div
              className={`p-1.5 rounded-xl transition-all duration-300 relative ${
                isActive
                  ? "text-brand-primary scale-110"
                  : "text-brand-gray group-hover:text-brand-primary group-active:scale-95"
              }`}
            >
              <Icon className="w-5 h-5" />
              {isActive && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-brand-primary rounded-full animate-ping" />
              )}
            </div>

            {/* Micro label */}
            <span
              className={`text-[10px] font-sans font-bold tracking-tight mt-0.5 transition-colors duration-200 ${
                isActive ? "text-brand-primary font-extrabold" : "text-brand-gray/80"
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
