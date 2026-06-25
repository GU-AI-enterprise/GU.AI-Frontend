"use client";

import type { StudioImage } from "../types";
import { fileToStudioImage } from "../helpers";
import { ImageSlot } from "./ImageSlot";

// Face Swap = đặt khuôn mặt từ ảnh ref vào ảnh thời trang có sẵn.
// Dùng model-swap API với faceReference bắt buộc (khác ModelSwap — faceRef optional, có thêm prompt/genMode).

interface Props {
  modelImage: StudioImage | null;
  faceRef: StudioImage | null;
  onModelImageChange: (img: StudioImage | null) => void;
  onFaceRefChange: (img: StudioImage | null) => void;
  onPaste: (onImage: (file: File) => void) => Promise<void>;
  openGallery: (cb: (url: string) => void) => void;
}

export function FaceSwapPanel({
  modelImage, faceRef,
  onModelImageChange, onFaceRefChange,
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
          verifyAs="model"
        />
        <ImageSlot
          label="Ảnh khuôn mặt" sublabel="Mặt cần swap vào" required
          image={faceRef} onClear={() => onFaceRefChange(null)}
          onFileChange={(f) => onFaceRefChange(fileToStudioImage(f))}
          onPaste={() => onPaste((f) => onFaceRefChange(fileToStudioImage(f)))}
          onGallery={() => openGallery((url) => onFaceRefChange(mkImg(url)))}
          verifyAs="face"
        />
      </div>

    </div>
  );
}
