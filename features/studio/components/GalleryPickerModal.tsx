"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/apiFetch";
import GuaiLoader from "@/components/shared/guai-loader";

interface LibraryItem {
  id: string;
  cat: string;
  title: string;
  image?: string;
}

interface GalleryImg {
  id: string;
  url: string;
}

type TabKey = "gallery" | "library";

interface Props {
  galleryImages: GalleryImg[];
  onClose: () => void;
  onSelect: (url: string) => void;
}

const CAT_LABEL: Record<string, string> = {
  pose: "Dáng ảnh",
  background: "Background",
  prompt: "Prompt",
  example: "Ví dụ",
};

export function GalleryPickerModal({ galleryImages, onClose, onSelect }: Props) {
  const [tab, setTab] = useState<TabKey>("gallery");
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(true);

  useEffect(() => {
    apiClient.get("/api/library").then((res) => {
      if (res.data.success) {
        setLibraryItems(
          (res.data.data as any[])
            .filter((d) => d.category !== "model" && d.image_url)
            .map((d) => ({ id: d.id, cat: d.category, title: d.title, image: d.image_url }))
        );
      }
    }).finally(() => setLibraryLoading(false));
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-background border border-border rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-1 bg-secondary/60 rounded-xl p-1">
            <button
              onClick={() => setTab("gallery")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                tab === "gallery" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Gallery của tôi
            </button>
            <button
              onClick={() => setTab("library")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                tab === "library" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Thư viện
            </button>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary transition-colors">
            <X className="size-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {tab === "gallery" ? (
            galleryImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {galleryImages.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => onSelect(img.url)}
                    className="group relative rounded-xl overflow-hidden border border-border bg-card hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 transition-all aspect-[3/4]"
                  >
                    <Image
                      src={img.url}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      loading="lazy"
                      className="object-cover transition-transform duration-500 group-hover:scale-105 bg-secondary/50"
                    />
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <p className="text-sm">Gallery của bạn đang trống.</p>
              </div>
            )
          ) : libraryLoading ? (
            <div className="flex items-center justify-center py-20">
              <GuaiLoader />
            </div>
          ) : libraryItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {libraryItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => item.image && onSelect(item.image)}
                  className="group relative rounded-xl overflow-hidden border border-border bg-card hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 transition-all aspect-[3/4] cursor-pointer"
                >
                  <Image
                    src={item.image!}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    loading="lazy"
                    className="object-cover transition-transform duration-500 group-hover:scale-105 bg-secondary/50"
                  />
                  <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-black/50 text-white">
                    {CAT_LABEL[item.cat] ?? item.cat}
                  </span>
                  <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                    <p className="text-xs font-medium text-white truncate drop-shadow-md">{item.title}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <p className="text-sm">Không có dữ liệu trong thư viện.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
