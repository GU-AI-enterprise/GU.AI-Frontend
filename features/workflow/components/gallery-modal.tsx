"use client";

import { useEffect, useState } from "react";
import { X, Loader2, ImageIcon } from "lucide-react";
import { getImages, type DBAsset } from "@/features/archive/imageService";
import { toast } from "sonner";

interface Props {
  onSelect: (url: string) => void;
  onClose: () => void;
}

export function GalleryModal({ onSelect, onClose }: Props) {
  const [galleryImages, setGalleryImages] = useState<DBAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getImages()
      .then(setGalleryImages)
      .catch(() => toast.error("Không thể tải thư viện ảnh"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[70vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border shrink-0">
          <span className="font-semibold text-sm">Chọn từ thư viện</span>
          <button onClick={onClose} className="cursor-pointer p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <X className="size-4" />
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-3">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : galleryImages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground">
                <ImageIcon className="size-8" />
                <span className="text-sm">Thư viện trống</span>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {galleryImages.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => onSelect(img.url)}
                    className="cursor-pointer aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-primary transition-all group"
                  >
                    <img
                      src={img.thumbnail_url || img.url}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
