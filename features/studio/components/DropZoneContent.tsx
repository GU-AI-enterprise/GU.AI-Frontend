"use client";

import { Upload, ClipboardPaste, GalleryHorizontal, Layers } from "lucide-react";

interface Props {
  onUpload: () => void;
  onPaste: () => void;
  onGallery: () => void;
  onLibrary?: () => void;
}

const btnCls =
  "cursor-pointer flex items-center gap-1 @sm:gap-1.5 px-2 @sm:px-3 py-1 @sm:py-1.5 rounded-lg bg-background border border-border text-[10px] @sm:text-xs font-medium hover:bg-secondary transition-colors whitespace-nowrap";

export function DropZoneContent({ onUpload, onPaste, onGallery, onLibrary }: Props) {
  return (
    <>
      <div className="flex items-center justify-center gap-1.5 @sm:gap-2 mb-2">
        <div className="w-10 h-14 @sm:w-14 @sm:h-18 rounded-xl bg-gradient-to-br from-orange-200 to-orange-400 shadow-lg -rotate-6" />
        <div className="w-10 h-14 @sm:w-14 @sm:h-18 rounded-xl bg-gradient-to-br from-sky-200 to-sky-400 shadow-lg z-10" />
        <div className="w-10 h-14 @sm:w-14 @sm:h-18 rounded-xl bg-gradient-to-br from-amber-200 to-amber-400 shadow-lg rotate-6" />
      </div>
      <p className="text-[10px] @sm:text-[11px] text-muted-foreground text-center px-3 leading-snug">
        Nhấp → Ctrl+V để dán · Kéo thả ảnh vào đây
      </p>
      <div className="flex items-center justify-center flex-wrap gap-1.5 px-2">
        <button onClick={(e) => { e.stopPropagation(); onPaste(); }} className={btnCls}>
          <ClipboardPaste className="size-3 @sm:size-3.5" /> Paste
        </button>
        <button onClick={(e) => { e.stopPropagation(); onUpload(); }} className={btnCls}>
          <Upload className="size-3 @sm:size-3.5" /> Tải lên
        </button>
        {onLibrary && (
          <button onClick={(e) => { e.stopPropagation(); onLibrary(); }} className={btnCls}>
            <Layers className="size-3 @sm:size-3.5" /> Thư viện
          </button>
        )}
        <button onClick={(e) => { e.stopPropagation(); onGallery(); }} className={btnCls}>
          <GalleryHorizontal className="size-3 @sm:size-3.5" /> Gallery
        </button>
      </div>
    </>
  );
}
