"use client";

import { useRef } from "react";
import { X } from "lucide-react";
import type { StudioImage } from "../types";
import { DropZoneContent } from "./DropZoneContent";

interface Props {
  label: string;
  sublabel?: string;
  image: StudioImage | null;
  onClear: () => void;
  onFileChange: (file: File) => void;
  onPaste: () => void;
  onGallery: () => void;
  required?: boolean;
}

export function ImageSlot({ label, sublabel, image, onClear, onFileChange, onPaste, onGallery, required }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  // Native paste event — fires when Ctrl+V pressed while frame is focused
  const handleNativePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) { onFileChange(file); return; }
      }
    }
  };

  return (
    <div className="flex flex-col gap-2 min-h-0 h-full">
      <div className="flex items-center justify-between shrink-0">
        <span className="text-xs font-semibold">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </span>
        {sublabel && <span className="text-[10px] text-muted-foreground">{sublabel}</span>}
      </div>

      <div className="relative flex-1 min-h-0 group">
        {/* Image display */}
        <div className={`absolute inset-0 flex items-center justify-center p-2 transition-opacity duration-150 ${image ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
          <img
            src={image?.url ?? undefined}
            alt={label}
            className="max-w-full max-h-full rounded-2xl border border-border shadow-md"
          />
          <button
            onClick={onClear}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-background/80 backdrop-blur-sm text-foreground opacity-0 group-hover:opacity-100 transition-opacity shadow"
          >
            <X className="size-3.5" />
          </button>
        </div>

        {/* Drop / focus zone — click to focus, then Ctrl+V to paste */}
        <div
          tabIndex={image ? -1 : 0}
          onPaste={handleNativePaste}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file?.type.startsWith("image/")) onFileChange(file);
          }}
          className={`absolute inset-0 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 cursor-default select-none
            hover:border-primary/30 hover:bg-card
            focus:outline-none focus:border-primary/60 focus:bg-primary/5
            transition-all
            ${image ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"}`}
        >
          <input
            type="file"
            accept="image/*"
            ref={fileRef}
            onChange={(e) => { if (e.target.files?.[0]) onFileChange(e.target.files[0]); }}
            className="hidden"
          />

          <DropZoneContent
            onUpload={() => fileRef.current?.click()}
            onPaste={onPaste}
            onGallery={onGallery}
          />
        </div>
      </div>
    </div>
  );
}
