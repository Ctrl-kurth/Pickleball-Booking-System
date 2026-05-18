import { useEffect, useCallback } from 'react';

export function useKeyboardNavigation({
  onNext,
  onPrev,
  isEnabled = true,
}: {
  onNext: () => void;
  onPrev: () => void;
  isEnabled?: boolean;
}) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isEnabled) return;

      // Ignore keystrokes if the user is typing in an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
        case 'Space':
        case 'Enter':
          e.preventDefault();
          onNext();
          break;
        case 'ArrowLeft':
        case 'Backspace':
          e.preventDefault();
          onPrev();
          break;
      }
    },
    [onNext, onPrev, isEnabled]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}
