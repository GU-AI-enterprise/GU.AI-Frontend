"use client";

import { useRef } from "react";
import { Upload, X } from "lucide-react";
import type { StudioImage } from "../types";
import { fileToStudioImage } from "../helpers";
import { ImageSlot } from "./ImageSlot";

interface Props {
  product: StudioImage | null;
  imagePrompt: StudioImage | null;
  faceRef: StudioImage | null;
  bgRef: StudioImage | null;
  onProductChange: (img: StudioImage | null) => void;
  onImagePromptChange: (img: StudioImage | null) => void;
  onFaceRefChange: (img: StudioImage | null) => void;
  onBgRefChange: (img: StudioImage | null) => void;
  onPaste: (onImage: (file: File) => void) => Promise<void>;
  openGallery: (cb: (url: string) => void) => void;
  openLibraryModal?: (category: string, cb: (url: string) => void, onUpload: () => void) => void;
}

export function ProductToModelPanel({
  product, imagePrompt, faceRef, bgRef,
  onProductChange, onImagePromptChange, onFaceRefChange, onBgRefChange,
  onPaste, openGallery, openLibraryModal
}: Props) {
  const promptRef  = useRef<HTMLInputElement>(null);
  const faceRefRef = useRef<HTMLInputElement>(null);
  const bgRefRef   = useRef<HTMLInputElement>(null);

  const miniSlots = [
    { label: "Ảnh pose mẫu", sub: "Tuỳ chọn", val: imagePrompt, set: onImagePromptChange, ref: promptRef, cat: "pose" },
    { label: "Ảnh mặt ref",  sub: "+3 credits", val: faceRef,   set: onFaceRefChange,    ref: faceRefRef, cat: "model" },
    { label: "Ảnh nền",      sub: "Tuỳ chọn", val: bgRef,       set: onBgRefChange,      ref: bgRefRef, cat: "background" },
  ] as const;

  return (
    <div className="h-full flex flex-col gap-3 min-h-0">
      {/* Main product slot */}
      <div className="flex-1 min-h-0">
        <ImageSlot
          label="Ảnh sản phẩm" sublabel="Bắt buộc" required
          image={product} onClear={() => onProductChange(null)}
          onFileChange={(f) => onProductChange(fileToStudioImage(f))}
          onPaste={() => onPaste((f) => onProductChange(fileToStudioImage(f)))}
          onGallery={() => openGallery((url) => onProductChange({ id: Math.random().toString(36).substr(2, 9), url }))}
          verifyAs="product"
        />
      </div>

      {/* Optional mini slots */}
      <div className="grid grid-cols-3 gap-2 shrink-0" style={{ height: "90px" }}>
        {miniSlots.map(({ label, sub, val, set, ref, cat }) => (
          <div
            key={label}
            className="relative rounded-xl overflow-hidden border border-dashed border-border bg-card flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 transition-colors"
            onClick={() => {
              if (openLibraryModal) {
                openLibraryModal(cat, (url) => set({ id: "lib", url }), () => ref.current?.click());
              } else {
                ref.current?.click();
              }
            }}
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
                <span className="text-[8px] text-muted-foreground/60">{sub}</span>
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
