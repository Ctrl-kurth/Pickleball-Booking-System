'use client';

import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { ProgressBar } from './ProgressBar';

interface SlideEngineProps {
  slides: React.ReactNode[];
}

export function SlideEngine({ slides }: SlideEngineProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 for next, -1 for prev

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  useKeyboardNavigation({
    onNext: handleNext,
    onPrev: handlePrev,
  });

  const variants = useMemo(
    () => ({
      enter: (dir: number) => ({
        opacity: 0,
        x: dir > 0 ? 50 : -50,
        scale: 0.98,
      }),
      center: {
        opacity: 1,
        x: 0,
        scale: 1,
      },
      exit: (dir: number) => ({
        opacity: 0,
        x: dir > 0 ? -50 : 50,
        scale: 0.98,
      }),
    }),
    []
  );

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-white font-sans selection:bg-white/30">
      <ProgressBar currentSlide={currentIndex} totalSlides={slides.length} />

      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            opacity: { duration: 0.4 },
            x: { type: 'spring', stiffness: 300, damping: 30 },
            scale: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
          }}
          className="absolute inset-0 w-full h-full"
        >
          {slides[currentIndex]}
        </motion.div>
      </AnimatePresence>
      
      {/* Optional: Minimalist manual navigation controls for mobile/mouse users */}
      <div className="fixed bottom-8 right-8 z-50 flex items-center gap-4 opacity-0 hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="p-3 rounded-full border border-white/10 bg-black/50 backdrop-blur-md text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer"
          aria-label="Previous Slide"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <button
          onClick={handleNext}
          disabled={currentIndex === slides.length - 1}
          className="p-3 rounded-full border border-white/10 bg-black/50 backdrop-blur-md text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer"
          aria-label="Next Slide"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>
    </div>
  );
}
