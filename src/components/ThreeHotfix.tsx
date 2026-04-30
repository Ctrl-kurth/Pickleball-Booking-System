"use client";

import { useEffect } from "react";

/**
 * ThreeHotfix
 * 
 * This component intercepts console warnings and logs to suppress:
 * 1. "THREE.Clock: This module has been deprecated" - Floods on every frame in some versions.
 * 2. "THREE.WebGLProgram: Program Info Log" - HLSL precision warnings on Windows (X4122).
 */
export function ThreeHotfix() {
  useEffect(() => {
    const originalWarn = console.warn;
    const originalLog = console.log;

    const isWebGLWarning = (msg: unknown) => {
      if (typeof msg !== "string") return false;
      return (
        msg.includes("THREE.WebGLProgram: Program Info Log") ||
        msg.includes("warning X4122") ||
        msg.includes("cannot be represented accurately in double precision")
      );
    };

    console.warn = (...args: unknown[]) => {
      if (
        (typeof args[0] === "string" && args[0].includes("THREE.Clock: This module has been deprecated")) ||
        isWebGLWarning(args[0])
      ) {
        return;
      }
      originalWarn.apply(console, args);
    };

    console.log = (...args: unknown[]) => {
      if (isWebGLWarning(args[0])) {
        return;
      }
      originalLog.apply(console, args);
    };

    return () => {
      console.warn = originalWarn;
      console.log = originalLog;
    };
  }, []);

  return null;
}
