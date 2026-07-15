import React, { useEffect } from "react";
import { Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      id="sukoon-splash"
      className="absolute inset-0 bg-gradient-to-tr from-[#E0F2FE] via-[#F0FDF4] to-[#FAF5FF] flex flex-col items-center justify-center z-50 select-none overflow-hidden"
    >
      {/* Soft floating background energy orbs for ambient wellness vibe */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-brand-primary/10 rounded-full blur-3xl animate-pulse duration-[6000ms]" />
      <div className="absolute bottom-1/3 right-1/4 w-60 h-60 bg-brand-secondary/20 rounded-full blur-3xl animate-pulse duration-[8000ms]" />
      <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-brand-accent/15 rounded-full blur-2xl animate-pulse duration-[5000ms]" />

      <div className="text-center space-y-6 z-10 px-6">
        {/* Animated Logo Container */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: [0.8, 1.05, 1], opacity: 1 }}
          transition={{ duration: 1.8, ease: "easeOut" }}
          className="flex items-center justify-center"
        >
          <div className="w-20 h-20 rounded-[28px] bg-gradient-to-tr from-brand-primary to-brand-primary/80 flex items-center justify-center shadow-xl shadow-brand-primary/20 relative">
            <div className="absolute inset-1 rounded-[24px] border border-white/25" />
            <Sparkles className="w-10 h-10 text-white animate-pulse" />
          </div>
        </motion.div>

        {/* Text Container with staggered fade-in */}
        <div className="space-y-3">
          <motion.h1
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="font-display font-extrabold text-3xl tracking-tight text-brand-dark"
          >
            Sukoon <span className="text-brand-primary">AI</span>
          </motion.h1>

          <motion.p
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 0.8 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="font-body text-sm font-semibold text-brand-gray tracking-wide"
          >
            Your Companion for Mental Wellness
          </motion.p>
        </div>
      </div>

      {/* Subtle indicator of state at bottom (stretching the minimalist style) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
        className="absolute bottom-12 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-widest text-brand-gray/50 font-semibold font-sans">
          Gemma Hackathon Project
        </span>
        <div className="w-8 h-[2px] bg-brand-primary/30 rounded-full overflow-hidden">
          <motion.div
            initial={{ left: "-100%" }}
            animate={{ left: "100%" }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="relative h-full w-1/2 bg-brand-primary rounded-full"
          />
        </div>
      </motion.div>
    </div>
  );
}
