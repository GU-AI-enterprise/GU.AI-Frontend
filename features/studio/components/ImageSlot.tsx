"use client";

import { useEffect, useRef, useState } from "react";
import { TriangleAlert, X } from "lucide-react";
import type { StudioImage } from "../types";
import { DropZoneContent } from "./DropZoneContent";
import { verifyImage, type VerifyImageType } from "../studioService";

interface Props {
  label: string;
  sublabel?: string;
  image: StudioImage | null;
  onClear: () => void;
  onFileChange: (file: File) => void;
  onPaste: () => void;
  onGallery: () => void;
  onLibrary?: () => void;
  /** "model" đổi nút "Thư viện" thành "Người mẫu" (dùng cho các ô chọn ảnh người mẫu). */
  libraryKind?: "model" | "library";
  required?: boolean;
  /** Nếu set, tự verify ảnh bằng AI sau khi upload — chỉ cảnh báo, không chặn dùng ảnh. */
  verifyAs?: VerifyImageType;
}

export function ImageSlot({ label, sublabel, image, onClear, onFileChange, onPaste, onGallery, onLibrary, libraryKind, required, verifyAs }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const verifyTokenRef = useRef(0);

  useEffect(() => {
    if (!image) setWarning(null);
  }, [image]);

  // Mọi điểm nhận file mới (paste/drop/click upload) đều đi qua đây — UI cập nhật ngay (optimistic),
  // verify chạy nền và chỉ hiện cảnh báo nếu ảnh thực sự không phù hợp, không bao giờ chặn.
  const handleFile = (file: File) => {
    onFileChange(file);
    setWarning(null);
    if (!verifyAs) return;

    const token = ++verifyTokenRef.current;
    verifyImage(file, verifyAs)
      .then((result) => {
        if (verifyTokenRef.current !== token) return; // ảnh đã đổi trong lúc chờ — bỏ kết quả cũ
        if (!result.ok) setWarning(result.issues[0] ?? "Ảnh có thể không phù hợp với yêu cầu của tool này.");
      })
      .catch(() => { /* fail-open — không chặn UX nếu verify lỗi */ });
  };

  // Native paste event — fires when Ctrl+V pressed while frame is focused
  const handleNativePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) { handleFile(file); return; }
      }
    }
  };

  return (
    <div className="flex flex-col gap-2 min-h-0 h-full">
      <div className="flex items-center justify-between shrink-0">
        <span className="text-xs font-semibold">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </span>
        {sublabel && <span className="text-[10px] text-muted-foreground">{sublabel}</span>}
      </div>

      <div className="relative flex-1 min-h-0 group">
        {/* Image display */}
        <div className={`absolute inset-0 flex items-center justify-center p-2 transition-opacity duration-150 ${image ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
          <img
            src={image?.url ?? undefined}
            alt={label}
            className="max-w-full max-h-full rounded-2xl border border-border shadow-md"
          />
          <button
            onClick={onClear}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-background/80 backdrop-blur-sm text-foreground opacity-0 group-hover:opacity-100 transition-opacity shadow"
          >
            <X className="size-3.5" />
          </button>

          {warning && (
            <div className="absolute bottom-2 left-2 right-2 flex items-start gap-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 px-2.5 py-1.5 text-[11px] text-amber-700 dark:text-amber-400">
              <TriangleAlert className="size-3.5 shrink-0 mt-0.5" />
              <span className="flex-1">{warning}</span>
              <button onClick={() => setWarning(null)} className="cursor-pointer shrink-0 opacity-70 hover:opacity-100">
                <X className="size-3" />
              </button>
            </div>
          )}
        </div>

        {/* Drop / focus zone — click to focus, then Ctrl+V to paste */}
        <div
          tabIndex={image ? -1 : 0}
          onPaste={handleNativePaste}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file?.type.startsWith("image/")) handleFile(file);
          }}
          className={`absolute inset-0 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 cursor-default select-none @container
            hover:border-primary/30 hover:bg-card
            focus:outline-none focus:border-primary/60 focus:bg-primary/5
            transition-all
            ${image ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"}`}
        >
          <input
            type="file"
            accept="image/*"
            ref={fileRef}
            onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
            className="hidden"
          />

          <DropZoneContent
            onUpload={() => fileRef.current?.click()}
            onPaste={onPaste}
            onGallery={onGallery}
            onLibrary={onLibrary}
            libraryKind={libraryKind}
          />
        </div>
      </div>
    </div>
  );
}
