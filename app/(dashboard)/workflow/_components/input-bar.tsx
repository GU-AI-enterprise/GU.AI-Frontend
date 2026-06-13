"use client";

import React, { useRef, useState, useEffect } from "react";
import { Send, Loader2, ChevronDown, Sparkles } from "lucide-react";
import { CompactImageSlot } from "./image-slot";
import { IMAGE_SLOTS, REASONING_MODELS } from "./constants";
import type { PageState, ReasoningModelId } from "./types";

// ── Model Picker ───────────────────────────────────────────────────────────────

export function ModelPicker({
  value,
  onChange,
  disabled,
}: {
  value: ReasoningModelId;
  onChange: (v: ReasoningModelId) => void;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = REASONING_MODELS.find((m) => m.id === value) ?? REASONING_MODELS[0];

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="cursor-pointer flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-secondary/40 text-[11px] font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <Sparkles className="size-3 text-primary shrink-0" />
        <span>{current.label}</span>
        <ChevronDown className={`size-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-1.5 z-50 w-52 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
          <div className="px-3 py-2 border-b border-border/60">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Model phân tích</p>
          </div>
          {REASONING_MODELS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => { onChange(m.id); setOpen(false); }}
              className={`cursor-pointer w-full flex items-start gap-2 px-3 py-2.5 text-left hover:bg-secondary/50 transition-colors ${value === m.id ? "bg-primary/5" : ""}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-xs font-medium text-foreground">{m.label}</span>
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                    m.badge === "Tốt nhất"
                      ? "bg-primary/15 text-primary"
                      : "bg-secondary text-muted-foreground"
                  }`}>
                    {m.badge}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">{m.description}</p>
              </div>
              {value === m.id && (
                <div className="size-2 rounded-full bg-primary mt-1.5 shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Input Bar ─────────────────────────────────────────────────────────────────

interface Props {
  prompt: string;
  setPrompt: (v: string) => void;
  images: Record<string, string | null>;
  setImages: React.Dispatch<React.SetStateAction<Record<string, string | null>>>;
  isInputDisabled: boolean;
  pageState: PageState;
  model: ReasoningModelId;
  setModel: (v: ReasoningModelId) => void;
  onSend: () => void;
  onOpenGallery: (key: string) => void;
}

export function InputBar({
  prompt, setPrompt, images, setImages,
  isInputDisabled, pageState, model, setModel, onSend, onOpenGallery,
}: Props) {
  return (
    <div className="border-t border-border bg-card/80 backdrop-blur-sm px-4 pt-3 pb-4 space-y-2.5 shrink-0">
      {/* Image slots + model picker row */}
      <div className="flex items-center gap-2 flex-wrap justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-muted-foreground">Ảnh đính kèm:</span>
          {IMAGE_SLOTS.map(({ key, label }) => (
            <CompactImageSlot
              key={key}
              label={label}
              url={images[key]}
              disabled={isInputDisabled}
              onSet={(url) => setImages((prev) => ({ ...prev, [key]: url }))}
              onClear={() => setImages((prev) => ({ ...prev, [key]: null }))}
              onOpenGallery={() => onOpenGallery(key)}
            />
          ))}
        </div>
        <ModelPicker value={model} onChange={setModel} disabled={isInputDisabled} />
      </div>

      {/* Textarea + send */}
      <div className="flex gap-2 items-end">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); }
          }}
          placeholder={isInputDisabled ? "Đang xử lý…" : "Mô tả yêu cầu… (Enter để gửi, Shift+Enter xuống dòng)"}
          rows={2}
          disabled={isInputDisabled}
          className="flex-1 resize-none rounded-xl border border-border bg-secondary/30 px-3.5 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/60 focus:bg-card transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          type="button"
          onClick={onSend}
          disabled={!prompt.trim() || isInputDisabled}
          className="cursor-pointer size-10 rounded-xl bg-foreground text-background flex items-center justify-center hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 self-end"
        >
          {pageState === "planning"
            ? <Loader2 className="size-4 animate-spin" />
            : <Send className="size-4" />}
        </button>
      </div>
    </div>
  );
}
