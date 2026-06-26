"use client";

import React from "react";
import { motion } from "framer-motion";

const dotTransition = (delay: number) => ({
  duration: 1,
  repeat: Infinity,
  repeatType: "loop" as const,
  delay,
  ease: "easeInOut" as const,
});

export function LoaderOne() {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 0.2, 0.4].map((delay) => (
        <motion.span
          key={delay}
          initial={{ y: 0 }}
          animate={{ y: [0, -6, 0] }}
          transition={dotTransition(delay)}
          className="size-2 rounded-full bg-primary"
        />
      ))}
    </div>
  );
}
