"use client";

import type { StudioImage } from "../types";
import { fileToStudioImage } from "../helpers";
import { ImageSlot } from "./ImageSlot";

interface Props {
  faceImage: StudioImage | null;
  onFaceImageChange: (img: StudioImage | null) => void;
  onPaste: (onImage: (file: File) => void) => Promise<void>;
  openGallery: (cb: (url: string) => void) => void;
}

export function FaceToModelPanel({ faceImage, onFaceImageChange, onPaste, openGallery }: Props) {
  const mkImg = (url: string): StudioImage => ({ id: Math.random().toString(36).substr(2, 9), url });

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex-1 min-h-0">
        <ImageSlot
          label="Ảnh khuôn mặt" sublabel="Ảnh selfie hoặc chân dung rõ mặt" required
          image={faceImage} onClear={() => onFaceImageChange(null)}
          onFileChange={(f) => onFaceImageChange(fileToStudioImage(f))}
          onPaste={() => onPaste((f) => onFaceImageChange(fileToStudioImage(f)))}
          onGallery={() => openGallery((url) => onFaceImageChange(mkImg(url)))}
        />
      </div>
    </div>
  );
}
