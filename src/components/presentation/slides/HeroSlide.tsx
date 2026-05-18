'use client';

import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

export function HeroSlide() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-12 text-center relative overflow-hidden bg-black">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-6 max-w-4xl z-10"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-center w-16 h-16 rounded-full border border-white/10 bg-white/5 shadow-[0_0_30px_rgba(255,255,255,0.05)]"
        >
          <Sparkles className="w-6 h-6 text-white" />
        </motion.div>
        
        <h1 className="text-6xl md:text-8xl font-medium tracking-tight text-[#EDEDED] leading-tight">
          Next-Gen <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
            Presentation Experience
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-[#A1A1AA] max-w-2xl leading-relaxed tracking-wide font-light">
          A bespoke, interactive, and fully custom keyboard-navigable architecture built with Next.js and Framer Motion.
        </p>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-8 px-6 py-2 rounded-full border border-white/10 bg-white/[0.03] text-[#A1A1AA] text-sm tracking-widest uppercase flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          Press Space or Arrow Keys to begin
        </motion.div>
      </motion.div>
    </div>
  );
}
