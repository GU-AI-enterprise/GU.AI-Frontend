"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, Upload } from "lucide-react";
import { apiClient } from "@/lib/apiFetch";
import GuaiLoader from "@/components/shared/guai-loader";

interface Item {
  id: string;
  cat: string;
  title: string;
  image?: string;
  promptText?: string;
}

interface Props {
  category: string;
  onClose: () => void;
  onSelect: (url: string) => void;
  onUpload: () => void;
}

export function LibraryModal({ category, onClose, onSelect, onUpload }: Props) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get("/api/library").then((res) => {
      if (res.data.success) {
        const allItems = (res.data.data as any[]).map((d) => ({
          id: d.id,
          cat: d.category,
          title: d.title,
          image: d.image_url,
          promptText: d.prompt_text,
        }));
        setItems(allItems.filter((i) => i.cat === category));
      }
      setLoading(false);
    });
  }, [category]);

  const catNames: Record<string, string> = {
    model: "Người mẫu",
    pose: "Dáng ảnh",
    background: "Background",
    prompt: "Prompt",
    example: "Ví dụ",
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-background border border-border rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Chọn từ thư viện ({catNames[category] || category})</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onUpload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-secondary text-foreground hover:bg-secondary/80 rounded-xl transition-colors"
            >
              <Upload className="size-4" />
              Tải ảnh lên
            </button>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary transition-colors">
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <GuaiLoader />
            </div>
          ) : items.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.image) onSelect(item.image);
                  }}
                  className="cursor-pointer group relative rounded-xl overflow-hidden border border-border bg-card hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 transition-all aspect-[3/4]"
                >
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      loading="lazy"
                      className="object-cover transition-transform duration-500 group-hover:scale-105 bg-secondary/50"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary p-4 text-center">
                      <p className="text-xs text-muted-foreground line-clamp-4">{item.promptText}</p>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                    <p className="text-xs font-medium text-white truncate drop-shadow-md">{item.title}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <p className="text-sm">Không có dữ liệu trong thư viện cho mục này.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
