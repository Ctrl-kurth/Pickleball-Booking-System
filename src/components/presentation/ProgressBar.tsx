'use client';

import { motion } from 'motion/react';

interface ProgressBarProps {
  currentSlide: number;
  totalSlides: number;
}

export function ProgressBar({ currentSlide, totalSlides }: ProgressBarProps) {
  const progress = totalSlides > 1 ? currentSlide / (totalSlides - 1) : 0;

  return (
    <div className="fixed top-0 left-0 w-full h-[2px] bg-white/5 z-50">
      <motion.div
        className="h-full bg-white/80"
        initial={{ width: 0 }}
        animate={{ width: `${progress * 100}%` }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      />
    </div>
  );
}
