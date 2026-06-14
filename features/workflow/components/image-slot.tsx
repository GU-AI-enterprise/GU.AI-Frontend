"use client";

import { useRef, useState } from "react";
import { Upload, X, Loader2, FolderHeart } from "lucide-react";
import { uploadFile } from "@/features/archive/imageService";
import { toast } from "sonner";

interface Props {
  label: string;
  url: string | null;
  disabled: boolean;
  onSet: (url: string) => void;
  onClear: () => void;
  onOpenGallery: () => void;
}

export function CompactImageSlot({ label, url, disabled, onSet, onClear, onOpenGallery }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = (file: File) => {
    setUploading(true);
    uploadFile(file)
      .then(onSet)
      .catch((err) => toast.error(`Upload thất bại: ${err.message}`))
      .finally(() => setUploading(false));
  };

  return (
    <div className="shrink-0">
      <div style={{ display: url ? "none" : undefined }}>
        <div className={`flex flex-col items-center gap-1 ${disabled ? "opacity-40 pointer-events-none" : ""}`}>
          <div className="flex gap-0.5">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="cursor-pointer flex items-center gap-0.5 px-2 py-1 rounded-lg border border-dashed border-border bg-secondary/40 text-[11px] text-muted-foreground hover:border-primary/50 hover:text-foreground transition-all"
            >
              <span style={{ display: uploading ? "inline-flex" : "none" }}>
                <Loader2 className="size-3 animate-spin" />
              </span>
              <span style={{ display: uploading ? "none" : "inline-flex" }}>
                <Upload className="size-3" />
              </span>
              {label}
            </button>
            <button
              type="button"
              onClick={onOpenGallery}
              className="cursor-pointer p-1 rounded-lg border border-dashed border-border bg-secondary/40 hover:border-primary/50 transition-all"
              title="Chọn từ thư viện"
            >
              <FolderHeart className="size-3 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: url ? undefined : "none" }}>
        <div className="relative group">
          <img src={url ?? undefined} alt={label} className="size-12 rounded-xl object-cover border-2 border-primary/40" />
          <span className="absolute bottom-0 left-0 right-0 text-[9px] text-center bg-black/60 text-white rounded-b-[10px] px-0.5 py-0.5 truncate">
            {label}
          </span>
          <button
            onClick={onClear}
            style={{ display: disabled ? "none" : undefined }}
            className="cursor-pointer absolute -top-1.5 -right-1.5 size-4 rounded-full bg-background border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
          >
            <X className="size-2.5" />
          </button>
        </div>
      </div>

      <input
        type="file"
        accept="image/*"
        ref={fileRef}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
