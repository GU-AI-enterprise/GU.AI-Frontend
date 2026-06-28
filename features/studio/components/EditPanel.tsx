"use client";

import type { StudioImage } from "../types";
import { fileToStudioImage } from "../helpers";
import { ImageSlot } from "./ImageSlot";
import { MiniImageSlot } from "./MiniImageSlot";

interface Props {
  source: StudioImage | null;
  mask: StudioImage | null;
  imageContext: StudioImage | null;
  onSourceChange: (img: StudioImage | null) => void;
  onMaskChange: (img: StudioImage | null) => void;
  onImageContextChange: (img: StudioImage | null) => void;
  onPaste: (onImage: (file: File) => void) => Promise<void>;
  openGallery: (cb: (url: string) => void) => void;
  openLibraryModal?: (category: string, cb: (url: string) => void, onUpload: () => void) => void;
}

export function EditPanel({
  source, mask, imageContext,
  onSourceChange, onMaskChange, onImageContextChange,
  onPaste, openGallery, openLibraryModal
}: Props) {
  const mkImg = (url: string): StudioImage => ({ id: Math.random().toString(36).substr(2, 9), url });

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
        <MiniImageSlot
          label="Mask" sub="Trắng = chỉnh, đen = giữ"
          image={mask} onChange={onMaskChange}
          onPaste={onPaste} openGallery={openGallery} openLibraryModal={openLibraryModal}
        />
        <MiniImageSlot
          label="Ngữ cảnh" sub="Tham chiếu trực quan"
          image={imageContext} onChange={onImageContextChange}
          onPaste={onPaste} openGallery={openGallery} openLibraryModal={openLibraryModal}
          category="background"
        />
      </div>
    </div>
  );
}
