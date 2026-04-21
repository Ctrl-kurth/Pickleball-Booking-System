"use client";

import { useEffect } from "react";

/**
 * ThreeHotfix
 * 
 * This component intercepts console warnings to suppress the 
 * "THREE.Clock: This module has been deprecated" message.
 * 
 * In Three.js v0.183+, this warning is triggered on every frame by 
 * @react-three/fiber's internal loop, causing massive console bloat 
 * and eventual browser crashes due to memory exhaustion.
 */
export function ThreeHotfix() {
  useEffect(() => {
    const originalWarn = console.warn;

    console.warn = (...args: unknown[]) => {
      if (
        typeof args[0] === "string" && 
        args[0].includes("THREE.Clock: This module has been deprecated")
      ) {
        // Silently swallow the flooding deprecation warning
        return;
      }
      originalWarn.apply(console, args);
    };

    return () => {
      console.warn = originalWarn;
    };
  }, []);

  return null;
}
