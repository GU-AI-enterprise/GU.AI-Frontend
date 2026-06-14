"use client";

import { Upload, ClipboardPaste, GalleryHorizontal } from "lucide-react";

interface Props {
  onUpload: () => void;
  onPaste: () => void;
  onGallery: () => void;
}

const btnCls =
  "cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background border border-border text-xs font-medium hover:bg-secondary transition-colors";

export function DropZoneContent({ onUpload, onPaste, onGallery }: Props) {
  return (
    <>
      <div className="flex items-center justify-center gap-2 mb-2">
        <div className="w-14 h-18 rounded-xl bg-gradient-to-br from-orange-200 to-orange-400 shadow-lg -rotate-6" />
        <div className="w-14 h-18 rounded-xl bg-gradient-to-br from-sky-200 to-sky-400 shadow-lg z-10" />
        <div className="w-14 h-18 rounded-xl bg-gradient-to-br from-amber-200 to-amber-400 shadow-lg rotate-6" />
      </div>
      <p className="text-[11px] text-muted-foreground">Nhấp → Ctrl+V để dán · Kéo thả ảnh vào đây</p>
      <div className="flex items-center gap-2">
        <button onClick={(e) => { e.stopPropagation(); onPaste(); }} className={btnCls}>
          <ClipboardPaste className="size-3.5" /> Paste
        </button>
        <button onClick={(e) => { e.stopPropagation(); onUpload(); }} className={btnCls}>
          <Upload className="size-3.5" /> Tải lên
        </button>
        <button onClick={(e) => { e.stopPropagation(); onGallery(); }} className={btnCls}>
          <GalleryHorizontal className="size-3.5" /> Gallery
        </button>
      </div>
    </>
  );
}
