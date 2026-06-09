"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LOADING_MESSAGES, LOADING_TIMING_MS } from "../constants";

interface Props {
  active: boolean;
}

export function ProcessingPanel({ active }: Props) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (!active) { setMsgIndex(0); return; }
    const timers = LOADING_TIMING_MS.map((delay, i) => setTimeout(() => setMsgIndex(i + 1), delay));
    return () => timers.forEach(clearTimeout);
  }, [active]);

  return (
    <div className="flex flex-col items-center justify-center gap-6 rounded-3xl border border-border bg-card h-full min-h-0">
      {/* Animated loading GIF with premium pulse glow */}
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-primary/10 blur-2xl animate-pulse" />
        <img
          src="/animation/studio_animation.gif"
          alt="AI Processing"
          className="w-full h-full object-contain rounded-2xl relative z-10"
        />
      </div>

      <div className="overflow-hidden" style={{ height: "1.4rem" }}>
        <AnimatePresence mode="wait">
          <motion.p
            key={msgIndex}
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            className="text-sm font-medium text-center whitespace-nowrap px-6"
          >
            {LOADING_MESSAGES[msgIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
