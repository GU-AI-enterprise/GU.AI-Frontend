"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Coins, Clock, Lightbulb } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface ToolGuideInput {
  label: string;
  required: boolean;
  tip: string;
}

export interface ToolGuideData {
  title: string;
  description: string;
  inputs: ToolGuideInput[];
  tips: string[];
  credit: string;
  time: string;
}

interface Props {
  guide: ToolGuideData | null;
  onClose: () => void;
}

export function ToolGuideModal({ guide, onClose }: Props) {
  return (
    <AnimatePresence>
      {guide && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-md rounded-3xl border border-border bg-card shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                <h2 className="text-base font-semibold text-foreground">{guide.title}</h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>

              <ScrollArea className="max-h-[70vh]">
              <div className="px-6 py-5 space-y-5">
                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed">{guide.description}</p>

                {/* Inputs */}
                <div>
                  <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Ảnh đầu vào</h3>
                  <div className="space-y-2.5">
                    {guide.inputs.map((input, i) => (
                      <div key={i} className="flex items-start gap-3">
                        {input.required
                          ? <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                          : <AlertCircle  className="size-4 text-muted-foreground shrink-0 mt-0.5" />}
                        <div>
                          <span className="text-xs font-semibold text-foreground">
                            {input.label}
                            {input.required && <span className="text-red-500 ml-1">*</span>}
                            {!input.required && <span className="text-muted-foreground ml-1">(tuỳ chọn)</span>}
                          </span>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{input.tip}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tips */}
                {guide.tips.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Lightbulb className="size-3.5 text-amber-500" /> Mẹo để có kết quả tốt
                    </h3>
                    <ul className="space-y-1.5">
                      {guide.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <span className="text-primary mt-0.5">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Cost & Time */}
                <div className="flex items-center gap-4 pt-1 border-t border-border">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Coins className="size-3.5 text-amber-500" />
                    <span>{guide.credit}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3.5 text-blue-500" />
                    <span>{guide.time}</span>
                  </div>
                </div>
              </div>
              </ScrollArea>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
