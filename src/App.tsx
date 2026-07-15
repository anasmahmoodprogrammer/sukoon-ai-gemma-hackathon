import React, { useState, useEffect } from "react";
import { ModuleId, UserProfile } from "./types";
import Topbar from "./components/Topbar";
import BottomNavigation from "./components/BottomNavigation";
import ContentArea from "./components/ContentArea";
import ModalShell from "./components/ModalShell";
import Toast from "./components/Toast";
import SplashScreen from "./components/SplashScreen";

export default function App() {
  // Splash Screen State
  const [showSplash, setShowSplash] = useState(true);

  // Active module state mapping to mobile tabs or shortcuts
  const [activeModule, setActiveModule] = useState<ModuleId>("dashboard");

  // User details initialized with personalized standards
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "Muhammad Anas",
    email: "anasmahmood090@gmail.com",
    role: "Premium Member",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256&h=256",
    joinedDate: "July 2026"
  });

  // Help & Logout modals
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  // Toast feedback state
  const [activeToast, setActiveToast] = useState<{ message: string; type: "success" | "info" } | null>(null);

  // Trigger Toast helper
  const triggerToast = (message: string, type: "success" | "info" = "info") => {
    setActiveToast({ message, type });
  };

  // Welcome Toast after splash transition completes
  useEffect(() => {
    if (!showSplash) {
      const welcomeTimer = setTimeout(() => {
        triggerToast("Assalam-o-Alaikum, Anas! Take a deep breath and find your inner peace.", "success");
      }, 1000);
      return () => clearTimeout(welcomeTimer);
    }
  }, [showSplash]);

  // Global Ctrl + K listener
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        triggerToast("Mindfulness search shortcut activated!", "info");
      }
    };
    window.addEventListener("keydown", handleGlobalKeys);
    return () => window.removeEventListener("keydown", handleGlobalKeys);
  }, []);

  // Handle Logout Confirmation
  const handleLogoutConfirm = () => {
    triggerToast("Wellness session ended securely.", "success");
    setActiveModule("dashboard");
    setTimeout(() => {
      triggerToast("Welcome back! Local session re-established.", "info");
    }, 1500);
  };

  // 1. Render Splash Screen for exactly 3 seconds at start
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div 
      id="sukoon-app-root" 
      className="min-h-screen bg-gradient-to-tr from-[#E0F2FE] via-[#F8FBFD] to-[#FAF5FF] flex items-center justify-center font-body antialiased p-0 sm:p-4 selection:bg-brand-primary/20 selection:text-brand-dark"
    >
      {/* Decorative ambient blurred orbs surrounding the centered mobile device on wider screens */}
      <div className="hidden lg:block absolute top-10 left-10 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl" />
      <div className="hidden lg:block absolute bottom-10 right-10 w-96 h-96 bg-brand-accent/5 rounded-full blur-3xl" />

      {/* Main Responsive Mobile-First Device Frame (Constrained to standard mobile viewport width 430px) */}
      <div className="relative w-full max-w-[430px] min-h-screen sm:min-h-[850px] sm:max-h-[920px] sm:rounded-[40px] sm:shadow-[0_24px_60px_rgba(47,62,70,0.12)] sm:border-[10px] sm:border-slate-800 bg-brand-bg flex flex-col overflow-hidden">
        {/* Dynamic Mobile Top App Bar */}
        <Topbar 
          userProfile={userProfile}
          activeModule={activeModule}
          setActiveModule={setActiveModule}
          onOpenHelpModal={() => setHelpModalOpen(true)}
          onOpenLogoutModal={() => setLogoutModalOpen(true)}
          onTriggerToast={triggerToast}
        />

        {/* Scrollable Container with customized hidden scrollbars */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin select-none">
          <ContentArea 
            activeModule={activeModule}
            setActiveModule={setActiveModule}
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            onTriggerToast={triggerToast}
          />
        </div>

        {/* Dynamic Fixed Mobile Bottom Navigation */}
        <BottomNavigation 
          activeModule={activeModule}
          setActiveModule={setActiveModule}
        />
      </div>

      {/* Help Support Modal */}
      <ModalShell 
        isOpen={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
        title="Help & Support"
        type="help"
      />

      {/* Logout Confirmation Modal */}
      <ModalShell 
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        title="End Calming Session"
        type="logout"
        onConfirm={handleLogoutConfirm}
      />

      {/* Toast Feedback Notification alerts */}
      {activeToast && (
        <Toast 
          message={activeToast.message}
          type={activeToast.type}
          onClose={() => setActiveToast(null)}
        />
      )}
    </div>
  );
}
