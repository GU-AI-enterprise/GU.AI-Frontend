"use client";

import React from "react";
import { Send, Loader2 } from "lucide-react";
import { CompactImageSlot } from "./image-slot";
import { IMAGE_SLOTS } from "./constants";
import type { PageState } from "./types";

interface Props {
  prompt: string;
  setPrompt: (v: string) => void;
  images: Record<string, string | null>;
  setImages: React.Dispatch<React.SetStateAction<Record<string, string | null>>>;
  isInputDisabled: boolean;
  pageState: PageState;
  onSend: () => void;
  onOpenGallery: (key: string) => void;
}

export function InputBar({
  prompt, setPrompt, images, setImages,
  isInputDisabled, pageState, onSend, onOpenGallery,
}: Props) {
  return (
    <div className="border-t border-border bg-card/80 backdrop-blur-sm px-4 pt-3 pb-4 space-y-2.5 shrink-0">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] text-muted-foreground mr-0.5">Ảnh đính kèm:</span>
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
