"use client";

import { useRef } from "react";
import { Upload, X, ClipboardPaste, GalleryHorizontal, Layers } from "lucide-react";
import type { StudioImage } from "../types";
import { fileToStudioImage } from "../helpers";

interface Props {
  label: string;
  sub: string;
  image: StudioImage | null;
  onChange: (img: StudioImage | null) => void;
  onPaste: (onImage: (file: File) => void) => Promise<void>;
  openGallery: (cb: (url: string) => void) => void;
  openLibraryModal?: (category: string, cb: (url: string) => void, onUpload: () => void) => void;
  /** Category để mở Thư viện — không truyền thì ẩn nút Thư viện (ví dụ: Mask). */
  category?: string;
}

const iconBtnCls =
  "cursor-pointer flex items-center justify-center size-5 rounded-md bg-background/90 border border-border text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors";

export function MiniImageSlot({ label, sub, image, onChange, onPaste, openGallery, openLibraryModal, category }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const mkImg = (url: string): StudioImage => ({ id: Math.random().toString(36).substr(2, 9), url });

  // Native paste event — fires when Ctrl+V pressed while ô đang được focus (giống ImageSlot)
  const handleNativePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) { onChange(fileToStudioImage(file)); return; }
      }
    }
  };

  return (
    <div
      tabIndex={image ? -1 : 0}
      onPaste={handleNativePaste}
      className="relative rounded-xl overflow-hidden border border-dashed border-border bg-card flex flex-col items-center justify-center gap-1 cursor-default select-none focus:outline-none focus:border-primary/60 focus:bg-primary/5 transition-colors"
    >
      {image ? (
        <>
          <img src={image.url} alt={label} className="size-full object-cover" />
          <button
            onClick={() => onChange(null)}
            className="absolute top-1 right-1 size-4 rounded-full bg-background/80 flex items-center justify-center cursor-pointer"
          >
            <X className="size-2.5 text-foreground" />
          </button>
        </>
      ) : (
        <>
          <span className="text-[9px] text-muted-foreground text-center leading-tight px-1 font-medium">{label}</span>
          <span className="text-[8px] text-muted-foreground/60 text-center leading-tight px-1">{sub}</span>
          <div className="flex items-center gap-1 mt-0.5">
            <button onClick={() => onPaste((f) => onChange(fileToStudioImage(f)))} className={iconBtnCls} title="Paste">
              <ClipboardPaste className="size-3" />
            </button>
            <button onClick={() => fileRef.current?.click()} className={iconBtnCls} title="Tải lên">
              <Upload className="size-3" />
            </button>
            <button onClick={() => openGallery((url) => onChange(mkImg(url)))} className={iconBtnCls} title="Gallery">
              <GalleryHorizontal className="size-3" />
            </button>
            {category && openLibraryModal && (
              <button
                onClick={() => openLibraryModal(category, (url) => onChange(mkImg(url)), () => fileRef.current?.click())}
                className={iconBtnCls}
                title="Thư viện"
              >
                <Layers className="size-3" />
              </button>
            )}
          </div>
        </>
      )}
      <input
        type="file" accept="image/*"
        ref={fileRef}
        className="hidden"
        onChange={(e) => { if (e.target.files?.[0]) onChange(fileToStudioImage(e.target.files[0])); }}
      />
    </div>
  );
}
