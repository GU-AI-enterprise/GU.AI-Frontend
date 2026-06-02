"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FolderHeart, X, Folder, FolderPlus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import GuaiLoader from "@/components/shared/guai-loader";
import { getCollections, addItemToCollection, type Collection } from "@/features/archive/collectionService";
import { toast } from "sonner";

interface SaveToAlbumModalProps {
  assetId: string | null;
  onClose: () => void;
}

export function SaveToAlbumModal({ assetId, onClose }: SaveToAlbumModalProps) {
  const router = useRouter();
  const isOpen = !!assetId;

  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingToId, setSavingToId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    getCollections()
      .then(setCollections)
      .catch(() => toast.error("Không thể tải danh sách album."))
      .finally(() => setLoading(false));
  }, [isOpen]);

  const handleSave = async (collectionId: string) => {
    if (!assetId) return;
    setSavingToId(collectionId);
    try {
      await addItemToCollection(collectionId, assetId);
      toast.success("Đã lưu ảnh vào album!");
      onClose();
    } catch (err: any) {
      if (err.message?.includes("đã tồn tại")) {
        toast.info("Ảnh này đã có trong album rồi.");
      } else {
        toast.error(err.message || "Không thể lưu ảnh vào album.");
      }
    } finally {
      setSavingToId(null);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl z-10 transition-all duration-200 ${isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-bold flex items-center gap-2 text-foreground">
            <FolderHeart className="size-4 text-primary" />
            Lưu vào Album
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-accent text-muted-foreground transition-colors">
            <X className="size-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <GuaiLoader size="sm" text="Đang tải album..." />
          </div>
        ) : collections.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <Folder className="size-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Chưa có album nào.</p>
            <Button
              variant="outline"
              className="rounded-xl text-xs"
              onClick={() => { onClose(); router.push("/archive/collections"); }}
            >
              <FolderPlus className="size-3.5 mr-1.5" />
              Tạo album mới
            </Button>
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {collections.map((col) => (
              <button
                key={col.id}
                disabled={savingToId === col.id}
                onClick={() => handleSave(col.id)}
                className="w-full flex items-center gap-3 p-3 rounded-2xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-left group disabled:opacity-60"
              >
                <div className="size-10 rounded-xl overflow-hidden border border-border bg-accent shrink-0">
                  {col.cover_asset ? (
                    <img src={col.cover_asset.thumbnail_url || col.cover_asset.url} alt="" className="size-full object-cover" />
                  ) : (
                    <div className="size-full flex items-center justify-center">
                      <Folder className="size-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <span className="flex-1 text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                  {col.name}
                </span>
                {savingToId === col.id ? (
                  <div className="size-4 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
                ) : (
                  <Check className="size-4 text-muted-foreground/0 group-hover:text-primary/40 transition-colors shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}

        {collections.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <button
              onClick={() => { onClose(); router.push("/archive/collections"); }}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
            >
              <FolderPlus className="size-3.5" />
              Tạo album mới
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
