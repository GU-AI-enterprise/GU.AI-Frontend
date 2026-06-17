"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, Folder, ImageIcon, Trash2, Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import GuaiLoader from "@/components/shared/guai-loader";
import { Lightbox } from "@/components/shared/lightbox";
import { supabase } from "@/lib/supabase";
import { getCollection, getCollectionItems, removeItemFromCollection, type Collection } from "@/features/archive/collectionService";
import { type DBAsset as Asset } from "@/features/archive/imageService";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/shared/confirm-modal";

export default function CollectionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const collectionId = params.id as string;

  const [collection, setCollection] = useState<Collection | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [removeTargetId, setRemoveTargetId] = useState<string | null>(null);

  const selectedAsset = lightboxIndex !== null ? (assets[lightboxIndex] ?? null) : null;

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!isMounted) return;
        if (error || !session?.user) { router.push("/login"); return; }
        setAuthLoading(false);
        fetchData();
      } catch {
        if (isMounted) router.push("/login");
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      if (event === "SIGNED_OUT" || !session?.user) router.push("/login");
    });

    return () => { isMounted = false; subscription.unsubscribe(); };
  }, [router, collectionId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [col, items] = await Promise.all([
        getCollection(collectionId),
        getCollectionItems(collectionId),
      ]);
      setCollection(col);
      setAssets(items);
    } catch {
      toast.error("Không tìm thấy bộ sưu tập.");
      router.push("/archive/collections");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAsset = async () => {
    if (!removeTargetId) return;
    try {
      await removeItemFromCollection(collectionId, removeTargetId);
      setAssets(prev => prev.filter(a => a.id !== removeTargetId));
      toast.success("Đã xóa ảnh khỏi bộ sưu tập.");
    } catch (err: any) {
      toast.error(err.message || "Không thể xóa ảnh.");
    } finally {
      setRemoveTargetId(null);
    }
  };

  const handleDownload = async (asset: Asset) => {
    try {
      const res = await fetch(asset.url);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `guai-${asset.id.slice(0, 8)}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Không thể tải ảnh.");
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <GuaiLoader size="lg" text="Đang xác thực..." />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push("/archive/collections")}
            className="cursor-pointer flex items-center justify-center size-9 rounded-xl border border-border bg-card hover:bg-accent transition-colors"
          >
            <ArrowLeft className="size-4 text-muted-foreground" />
          </button>
          <div>
            <h1 className="font-serif text-3xl font-light tracking-tight text-foreground flex items-center gap-2.5">
              <Folder className="size-6 text-primary" />
              <span className="italic text-primary">{collection?.name ?? "Đang tải..."}</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {assets.length} ảnh · Tạo {collection ? new Date(collection.created_at).toLocaleDateString("vi-VN") : ""}
            </p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <GuaiLoader size="md" text="Đang tải ảnh..." />
          </div>
        ) : assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-3xl border border-dashed border-border bg-card">
            <ImageIcon className="size-12 text-muted-foreground mb-4" />
            <h3 className="text-sm font-semibold text-muted-foreground">Album chưa có ảnh nào</h3>
            <p className="text-xs text-muted-foreground/70 mt-1 text-center max-w-xs">
              Thêm ảnh từ Thư viện vào Album này để quản lý gọn gàng hơn.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {assets.map((asset, idx) => (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="group relative aspect-square rounded-2xl overflow-hidden border border-border bg-card cursor-pointer"
                onClick={() => setLightboxIndex(idx)}
              >
                <img
                  src={asset.thumbnail_url || asset.url}
                  alt=""
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-end justify-end p-2 gap-1.5 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDownload(asset); }}
                    className="cursor-pointer flex items-center justify-center size-7 rounded-lg bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white transition-colors"
                    title="Tải xuống"
                  >
                    <Download className="size-3.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setRemoveTargetId(asset.id); }}
                    className="cursor-pointer flex items-center justify-center size-7 rounded-lg bg-red-500/60 backdrop-blur-sm hover:bg-red-500/80 text-white transition-colors"
                    title="Xóa khỏi album"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox — shared component */}
      <Lightbox
        imageUrl={selectedAsset?.url ?? null}
        images={assets.map(a => ({
          url: a.url,
          thumbnailUrl: a.thumbnail_url || a.url,
          filename: `guai-${a.id.slice(0, 8)}.jpg`,
          createdAt: a.created_at,
        }))}
        currentIndex={lightboxIndex ?? 0}
        onNavigate={setLightboxIndex}
        filename={selectedAsset ? `guai-${selectedAsset.id.slice(0, 8)}.jpg` : undefined}
        createdAt={selectedAsset?.created_at}
        onClose={() => setLightboxIndex(null)}
        actions={selectedAsset ? [
          {
            icon: <Trash2 className="size-3.5" />,
            label: "Xóa khỏi album",
            onClick: () => { setRemoveTargetId(selectedAsset.id); setLightboxIndex(null); },
            variant: "destructive",
          },
        ] : []}
      />

      {/* Confirm remove */}
      <ConfirmModal
        isOpen={removeTargetId !== null}
        onClose={() => setRemoveTargetId(null)}
        onConfirm={handleRemoveAsset}
        title="Xóa ảnh khỏi album"
        description="Ảnh sẽ bị xóa khỏi album này nhưng vẫn còn trong Thư viện của bạn."
        confirmText="Xóa khỏi album"
        variant="destructive"
      />
    </div>
  );
}
