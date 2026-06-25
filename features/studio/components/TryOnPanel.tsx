"use client";

import type { StudioImage } from "../types";
import { fileToStudioImage } from "../helpers";
import { ImageSlot } from "./ImageSlot";

interface Props {
  modelImage: StudioImage | null;
  garmentImage: StudioImage | null;
  onModelImageChange: (img: StudioImage | null) => void;
  onGarmentImageChange: (img: StudioImage | null) => void;
  onPaste: (onImage: (file: File) => void) => Promise<void>;
  openGallery: (cb: (url: string) => void) => void;
  openLibraryModal?: (category: string, cb: (url: string) => void, onUpload: () => void) => void;
}

export function TryOnPanel({
  modelImage, garmentImage,
  onModelImageChange, onGarmentImageChange,
  onPaste, openGallery, openLibraryModal
}: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 h-full min-h-0">
      <ImageSlot
        label="Ảnh người mẫu" sublabel="Model"
        image={modelImage} onClear={() => onModelImageChange(null)}
        onFileChange={(f) => onModelImageChange(fileToStudioImage(f))}
        onPaste={() => onPaste((f) => onModelImageChange(fileToStudioImage(f)))}
        onGallery={() => openGallery((url) => onModelImageChange({ id: Math.random().toString(36).substr(2, 9), url }))}
        onLibrary={openLibraryModal ? () => openLibraryModal("model", (url) => onModelImageChange({ id: Math.random().toString(36).substr(2, 9), url }), () => {}) : undefined}
        libraryKind="model"
        verifyAs="model"
      />
      <ImageSlot
        label="Ảnh trang phục" sublabel="Sản phẩm rõ nét"
        image={garmentImage} onClear={() => onGarmentImageChange(null)}
        onFileChange={(f) => onGarmentImageChange(fileToStudioImage(f))}
        onPaste={() => onPaste((f) => onGarmentImageChange(fileToStudioImage(f)))}
        onGallery={() => openGallery((url) => onGarmentImageChange({ id: Math.random().toString(36).substr(2, 9), url }))}
        verifyAs="product"
      />
    </div>
  );
}
