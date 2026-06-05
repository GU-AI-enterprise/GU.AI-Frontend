"use client";

import type { StudioImage } from "../types";
import { fileToStudioImage } from "../helpers";
import { ImageSlot } from "./ImageSlot";

interface Props {
  modelImage: StudioImage | null;
  faceRef: StudioImage | null;
  onModelImageChange: (img: StudioImage | null) => void;
  onFaceRefChange: (img: StudioImage | null) => void;
  onPaste: (onImage: (file: File) => void) => Promise<void>;
  openGallery: (cb: (url: string) => void) => void;
}

export function ModelSwapPanel({
  modelImage, faceRef,
  onModelImageChange, onFaceRefChange,
  onPaste, openGallery,
}: Props) {
  const mkImg = (url: string): StudioImage => ({ id: Math.random().toString(36).substr(2, 9), url });

  return (
    <div className="h-full flex flex-col gap-3 min-h-0">
      {/* Two image slots */}
      <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
        <ImageSlot
          label="Ảnh thời trang" sublabel="Model gốc" required
          image={modelImage} onClear={() => onModelImageChange(null)}
          onFileChange={(f) => onModelImageChange(fileToStudioImage(f))}
          onPaste={() => onPaste((f) => onModelImageChange(fileToStudioImage(f)))}
          onGallery={() => openGallery((url) => onModelImageChange(mkImg(url)))}
        />
        <ImageSlot
          label="Ảnh mặt ref" sublabel="Tuỳ chọn"
          image={faceRef} onClear={() => onFaceRefChange(null)}
          onFileChange={(f) => onFaceRefChange(fileToStudioImage(f))}
          onPaste={() => onPaste((f) => onFaceRefChange(fileToStudioImage(f)))}
          onGallery={() => openGallery((url) => onFaceRefChange(mkImg(url)))}
        />
      </div>

    </div>
  );
}
