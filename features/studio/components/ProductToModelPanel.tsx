"use client";

import type { StudioImage } from "../types";
import { fileToStudioImage } from "../helpers";
import { ImageSlot } from "./ImageSlot";
import { MiniImageSlot } from "./MiniImageSlot";

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
        <MiniImageSlot
          label="Ảnh pose mẫu" sub="Tuỳ chọn"
          image={imagePrompt} onChange={onImagePromptChange}
          onPaste={onPaste} openGallery={openGallery} openLibraryModal={openLibraryModal}
          category="pose"
        />
        <MiniImageSlot
          label="Ảnh mặt ref" sub="+3 credits"
          image={faceRef} onChange={onFaceRefChange}
          onPaste={onPaste} openGallery={openGallery} openLibraryModal={openLibraryModal}
          category="model"
        />
        <MiniImageSlot
          label="Ảnh nền" sub="Tuỳ chọn"
          image={bgRef} onChange={onBgRefChange}
          onPaste={onPaste} openGallery={openGallery} openLibraryModal={openLibraryModal}
          category="background"
        />
      </div>

    </div>
  );
}
