"use client";

import { useRef } from "react";
import { Upload, X } from "lucide-react";
import type { StudioImage } from "../types";
import { fileToStudioImage } from "../helpers";
import { ImageSlot } from "./ImageSlot";

interface Props {
  source: StudioImage | null;
  mask: StudioImage | null;
  imageContext: StudioImage | null;
  onSourceChange: (img: StudioImage | null) => void;
  onMaskChange: (img: StudioImage | null) => void;
  onImageContextChange: (img: StudioImage | null) => void;
  onPaste: (onImage: (file: File) => void) => Promise<void>;
  openGallery: (cb: (url: string) => void) => void;
}

export function EditPanel({
  source, mask, imageContext,
  onSourceChange, onMaskChange, onImageContextChange,
  onPaste, openGallery,
}: Props) {
  const maskRef    = useRef<HTMLInputElement>(null);
  const contextRef = useRef<HTMLInputElement>(null);

  const mkImg = (url: string): StudioImage => ({ id: Math.random().toString(36).substr(2, 9), url });

  const miniSlots = [
    {
      label: "Mask",
      sub: "Trắng = chỉnh, đen = giữ",
      val: mask,
      set: onMaskChange,
      ref: maskRef,
    },
    {
      label: "Ngữ cảnh",
      sub: "Tham chiếu trực quan",
      val: imageContext,
      set: onImageContextChange,
      ref: contextRef,
    },
  ] as const;

  return (
    <div className="h-full flex flex-col gap-3 min-h-0">
      {/* Main source image slot */}
      <div className="flex-1 min-h-0">
        <ImageSlot
          label="Ảnh nguồn" sublabel="Bắt buộc" required
          image={source} onClear={() => onSourceChange(null)}
          onFileChange={(f) => onSourceChange(fileToStudioImage(f))}
          onPaste={() => onPaste((f) => onSourceChange(fileToStudioImage(f)))}
          onGallery={() => openGallery((url) => onSourceChange(mkImg(url)))}
        />
      </div>

      {/* Optional mini slots: mask + image_context */}
      <div className="grid grid-cols-2 gap-2 shrink-0" style={{ height: "90px" }}>
        {miniSlots.map(({ label, sub, val, set, ref }) => (
          <div
            key={label}
            className="relative rounded-xl overflow-hidden border border-dashed border-border bg-card flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 transition-colors"
            onClick={() => ref.current?.click()}
          >
            {val ? (
              <>
                <img src={val.url} alt={label} className="size-full object-cover" />
                <button
                  onClick={(e) => { e.stopPropagation(); set(null); }}
                  className="absolute top-1 right-1 size-4 rounded-full bg-background/80 flex items-center justify-center"
                >
                  <X className="size-2.5 text-foreground" />
                </button>
              </>
            ) : (
              <>
                <Upload className="size-3.5 text-muted-foreground mb-0.5" />
                <span className="text-[9px] text-muted-foreground text-center leading-tight px-1">{label}</span>
                <span className="text-[8px] text-muted-foreground/60 text-center leading-tight px-1">{sub}</span>
              </>
            )}
            <input
              type="file" accept="image/*"
              ref={ref}
              className="hidden"
              onChange={(e) => { if (e.target.files?.[0]) set(fileToStudioImage(e.target.files[0])); }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
