"use client";

import type { StudioImage, GenResolution, FaceRefMode } from "../types";
import { fileToStudioImage } from "../helpers";
import { ImageSlot } from "./ImageSlot";

// Face Swap = đặt khuôn mặt từ ảnh ref vào ảnh thời trang có sẵn.
// Dùng model-swap API với faceReference bắt buộc (khác ModelSwap — faceRef optional, có thêm prompt/genMode).

const RESOLUTIONS: GenResolution[] = ["1k", "2k", "4k"];
const FACE_REF_MODES: { value: FaceRefMode; label: string }[] = [
  { value: "match_reference", label: "giống nhất" },
  { value: "match_base",      label: "cân bằng" },
];

interface Props {
  modelImage: StudioImage | null;
  faceRef: StudioImage | null;
  resolution: GenResolution;
  faceRefMode: FaceRefMode;
  onModelImageChange: (img: StudioImage | null) => void;
  onFaceRefChange: (img: StudioImage | null) => void;
  onResolutionChange: (v: GenResolution) => void;
  onFaceRefModeChange: (v: FaceRefMode) => void;
  onPaste: (onImage: (file: File) => void) => Promise<void>;
  openGallery: (cb: (url: string) => void) => void;
}

export function FaceSwapPanel({
  modelImage, faceRef, resolution, faceRefMode,
  onModelImageChange, onFaceRefChange,
  onResolutionChange, onFaceRefModeChange,
  onPaste, openGallery,
}: Props) {
  const mkImg = (url: string): StudioImage => ({ id: Math.random().toString(36).substr(2, 9), url });

  return (
    <div className="h-full flex flex-col gap-3 min-h-0">
      {/* Two required image slots */}
      <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
        <ImageSlot
          label="Ảnh thời trang" sublabel="Ảnh gốc có model" required
          image={modelImage} onClear={() => onModelImageChange(null)}
          onFileChange={(f) => onModelImageChange(fileToStudioImage(f))}
          onPaste={() => onPaste((f) => onModelImageChange(fileToStudioImage(f)))}
          onGallery={() => openGallery((url) => onModelImageChange(mkImg(url)))}
        />
        <ImageSlot
          label="Ảnh khuôn mặt" sublabel="Mặt cần swap vào" required
          image={faceRef} onClear={() => onFaceRefChange(null)}
          onFileChange={(f) => onFaceRefChange(fileToStudioImage(f))}
          onPaste={() => onPaste((f) => onFaceRefChange(fileToStudioImage(f)))}
          onGallery={() => openGallery((url) => onFaceRefChange(mkImg(url)))}
        />
      </div>

      {/* Controls */}
      <div className="shrink-0 flex flex-wrap gap-x-4 gap-y-1.5">
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
          <span className="text-[10px] text-muted-foreground shrink-0">Face:</span>
          {FACE_REF_MODES.map(m => (
            <button key={m.value} onClick={() => onFaceRefModeChange(m.value)}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${faceRefMode === m.value ? "bg-foreground text-background" : "bg-secondary/40 text-muted-foreground hover:bg-secondary"}`}>
              {m.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
