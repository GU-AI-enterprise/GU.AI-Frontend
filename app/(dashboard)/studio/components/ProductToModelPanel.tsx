"use client";

import { useRef } from "react";
import { Upload, X } from "lucide-react";
import type { StudioImage, GenResolution, GenMode, FaceRefMode } from "../types";
import { fileToStudioImage } from "../helpers";
import { ImageSlot } from "./ImageSlot";

const ASPECT_RATIOS = ["1:1", "3:4", "4:5", "9:16", "16:9"];
const RESOLUTIONS: GenResolution[] = ["1k", "2k", "4k"];
const GEN_MODES: GenMode[] = ["fast", "balanced", "quality"];
const FACE_REF_MODES: { value: FaceRefMode; label: string }[] = [
  { value: "match_reference", label: "giống nhất" },
  { value: "match_base",      label: "cân bằng" },
];

interface Props {
  product: StudioImage | null;
  imagePrompt: StudioImage | null;
  faceRef: StudioImage | null;
  bgRef: StudioImage | null;
  prompt: string;
  aspectRatio: string;
  resolution: GenResolution;
  genMode: GenMode;
  faceRefMode: FaceRefMode;
  onProductChange: (img: StudioImage | null) => void;
  onImagePromptChange: (img: StudioImage | null) => void;
  onFaceRefChange: (img: StudioImage | null) => void;
  onBgRefChange: (img: StudioImage | null) => void;
  onPromptChange: (v: string) => void;
  onAspectRatioChange: (v: string) => void;
  onResolutionChange: (v: GenResolution) => void;
  onGenModeChange: (v: GenMode) => void;
  onFaceRefModeChange: (v: FaceRefMode) => void;
  onPaste: (onImage: (file: File) => void) => Promise<void>;
  openGallery: (cb: (url: string) => void) => void;
}

export function ProductToModelPanel({
  product, imagePrompt, faceRef, bgRef, prompt, aspectRatio, resolution, genMode, faceRefMode,
  onProductChange, onImagePromptChange, onFaceRefChange, onBgRefChange,
  onPromptChange, onAspectRatioChange, onResolutionChange, onGenModeChange, onFaceRefModeChange,
  onPaste, openGallery,
}: Props) {
  const promptRef  = useRef<HTMLInputElement>(null);
  const faceRefRef = useRef<HTMLInputElement>(null);
  const bgRefRef   = useRef<HTMLInputElement>(null);

  const miniSlots = [
    { label: "Ảnh pose mẫu", sub: "Tuỳ chọn", val: imagePrompt, set: onImagePromptChange, ref: promptRef },
    { label: "Ảnh mặt ref",  sub: "+3 credits", val: faceRef,   set: onFaceRefChange,    ref: faceRefRef },
    { label: "Ảnh nền",      sub: "Tuỳ chọn", val: bgRef,       set: onBgRefChange,      ref: bgRefRef },
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
        />
      </div>

      {/* Optional mini slots */}
      <div className="grid grid-cols-3 gap-2 shrink-0" style={{ height: "90px" }}>
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

      {/* Controls */}
      <div className="shrink-0 flex flex-col gap-2">
        <textarea
          rows={2} value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder='Mô tả thêm: "professional office", "man casual", "studio white background"...'
          className="w-full px-3 py-2 text-xs rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none resize-none transition-all"
        />

        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground shrink-0">Tỉ lệ:</span>
            {ASPECT_RATIOS.map(r => (
              <button key={r} onClick={() => onAspectRatioChange(r)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${aspectRatio === r ? "bg-foreground text-background" : "bg-secondary/40 text-muted-foreground hover:bg-secondary"}`}>
                {r}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground shrink-0">Res:</span>
            {RESOLUTIONS.map(r => (
              <button key={r} onClick={() => onResolutionChange(r)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${resolution === r ? "bg-foreground text-background" : "bg-secondary/40 text-muted-foreground hover:bg-secondary"}`}>
                {r}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground shrink-0">Mode:</span>
            {GEN_MODES.map(m => (
              <button key={m} onClick={() => onGenModeChange(m)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${genMode === m ? "bg-foreground text-background" : "bg-secondary/40 text-muted-foreground hover:bg-secondary"}`}>
                {m}
              </button>
            ))}
          </div>

          {faceRef && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground shrink-0">Face:</span>
              {FACE_REF_MODES.map(m => (
                <button key={m.value} onClick={() => onFaceRefModeChange(m.value)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${faceRefMode === m.value ? "bg-foreground text-background" : "bg-secondary/40 text-muted-foreground hover:bg-secondary"}`}>
                  {m.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
