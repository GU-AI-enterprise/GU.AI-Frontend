"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ImageIcon, Search, Download, Trash2,
  FolderHeart, Plus, Folder, Check, X, FolderPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import GuaiLoader from "@/components/shared/guai-loader";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/shared/confirm-modal";

interface DBAsset {
  id: string;
  url: string;
  thumbnail_url: string;
  type: string;
  category?: string;
  file_size: number;
  created_at: string;
}

interface Collection {
  id: string;
  name: string;
  cover_asset?: { url: string; thumbnail_url: string } | null;
}

export default function GalleryPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<DBAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "input" | "output" | "edit">("all");
  const [deleteImageId, setDeleteImageId] = useState<string | null>(null);

  // Save to album state
  const [saveAssetId, setSaveAssetId] = useState<string | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  const [savingToId, setSavingToId] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!isMounted) return;
        if (error || !session?.user) { router.push("/login"); return; }
        setAuthLoading(false);
        fetchImages();
      } catch {
        if (isMounted) router.push("/login");
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      if (event === "SIGNED_OUT" || !session?.user) router.push("/login");
    });

    return () => { isMounted = false; subscription.unsubscribe(); };
  }, [router]);

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  };

  const fetchImages = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;
      const res = await fetch(`${apiUrl}/api/images`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (json.success) setAssets(json.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const openSaveModal = async (assetId: string) => {
    setSaveAssetId(assetId);
    setCollectionsLoading(true);
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch(`${apiUrl}/api/collections`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (json.success) setCollections(json.data);
    } catch {
      toast.error("Không thể tải danh sách album.");
    } finally {
      setCollectionsLoading(false);
    }
  };

  const handleSaveToCollection = async (collectionId: string) => {
    if (!saveAssetId) return;
    setSavingToId(collectionId);
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch(`${apiUrl}/api/collections/${collectionId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ assetId: saveAssetId }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Đã lưu ảnh vào album!");
        setSaveAssetId(null);
      } else if (json.error?.includes("đã tồn tại")) {
        toast.info("Ảnh này đã có trong album rồi.");
      } else {
        toast.error(json.error || "Không thể lưu ảnh vào album.");
      }
    } catch {
      toast.error("Có lỗi xảy ra.");
    } finally {
      setSavingToId(null);
    }
  };

  const executeDeleteImage = async () => {
    if (!deleteImageId) return;
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch(`${apiUrl}/api/images/${deleteImageId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setAssets(prev => prev.filter(img => img.id !== deleteImageId));
        toast.success("Xóa ảnh thành công!");
      } else {
        toast.error(json.error || "Không thể xóa ảnh.");
      }
    } catch {
      toast.error("Có lỗi xảy ra khi xóa ảnh.");
    } finally {
      setDeleteImageId(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const filteredAssets = assets.filter(img => {
    const matchesSearch = img.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (img.type && img.type.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = filterType === "all" || img.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const groupedByDate = filteredAssets.reduce<Record<string, DBAsset[]>>((acc, img) => {
    const date = new Date(img.created_at).toLocaleDateString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(img);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
    const toMs = (s: string) => new Date(s.split("/").reverse().join("-")).getTime();
    return toMs(b) - toMs(a);
  });

  if (authLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <GuaiLoader size="lg" text="Đang xác thực..." />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-3">
              <ImageIcon className="size-7 text-primary" />
              Tất cả ảnh
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Quản lý và tổ chức thư viện ảnh của bạn.
            </p>
          </div>
          <Button
            onClick={() => router.push("/archive/upload")}
            className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
          >
            <Plus className="size-4 mr-2" /> Tải lên ảnh mới
          </Button>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-3 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm ảnh..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
            />
          </div>
          <select
            value={filterType}
            onChange={(e: any) => setFilterType(e.target.value)}
            className="px-4 py-2.5 text-sm rounded-xl bg-background border border-border focus:border-primary focus:outline-none cursor-pointer"
          >
            <option value="all">Tất cả định dạng</option>
            <option value="image">Ảnh</option>
            <option value="video">Video</option>
            <option value="file">File</option>
          </select>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <GuaiLoader size="md" text="Đang tải thư viện..." />
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-3xl border border-dashed border-border bg-card">
            <ImageIcon className="size-12 text-muted-foreground mb-4" />
            <h3 className="text-sm font-semibold text-muted-foreground">Không tìm thấy hình ảnh nào</h3>
            <p className="text-xs text-muted-foreground/70 mt-1 max-w-xs text-center">
              Thư viện của bạn hiện đang trống. Hãy tải lên hình ảnh mới.
            </p>
            <Button onClick={() => router.push("/archive/upload")} className="mt-5 rounded-xl text-xs bg-primary hover:bg-primary">
              Tải lên ngay
            </Button>
          </div>
        ) : (
          <div className="space-y-10">
            {sortedDates.map((date) => (
              <div key={date}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-sm font-semibold text-foreground">{date}</h2>
                  <div className="flex-1 h-px bg-border/60" />
                  <span className="text-xs text-muted-foreground">{groupedByDate[date].length} ảnh</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {groupedByDate[date].map((img) => (
                    <motion.div
                      key={img.id}
                      layoutId={img.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group relative rounded-2xl overflow-hidden border border-border bg-card aspect-[3/4] transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.1)]"
                    >
                      <img
                        src={img.url}
                        alt="GU.AI Asset"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end">
                        <p className="text-[10px] text-white/60 font-medium">{formatFileSize(img.file_size)}</p>
                        <div className="flex items-center gap-2 mt-3">
                          <a
                            href={img.url}
                            download
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all text-white"
                          >
                            <Download className="size-3.5" />
                          </a>
                          <button
                            onClick={() => openSaveModal(img.id)}
                            className="flex-1 py-2 rounded-xl bg-primary hover:bg-primary/90 transition-all text-[11px] font-semibold text-center text-primary-foreground flex items-center justify-center gap-1.5"
                          >
                            <FolderHeart className="size-3.5" />
                            Lưu vào Album
                          </button>
                          <button
                            onClick={() => setDeleteImageId(img.id)}
                            className="p-2 rounded-xl bg-red-500/20 backdrop-blur-md border border-red-500/30 hover:bg-red-500/30 hover:text-red-300 transition-all text-red-400"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save to Album Modal */}
      <AnimatePresence>
        {saveAssetId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSaveAssetId(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl z-10"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold flex items-center gap-2 text-foreground">
                  <FolderHeart className="size-4 text-primary" />
                  Lưu vào Album
                </h3>
                <button
                  onClick={() => setSaveAssetId(null)}
                  className="p-1 rounded-lg hover:bg-accent text-muted-foreground transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Collections list */}
              {collectionsLoading ? (
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
                    onClick={() => { setSaveAssetId(null); router.push("/archive/collections"); }}
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
                      onClick={() => handleSaveToCollection(col.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-2xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-left group disabled:opacity-60"
                    >
                      {/* Thumb */}
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

              {/* Footer */}
              {collections.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <button
                    onClick={() => { setSaveAssetId(null); router.push("/archive/collections"); }}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
                  >
                    <FolderPlus className="size-3.5" />
                    Tạo album mới
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={deleteImageId !== null}
        onClose={() => setDeleteImageId(null)}
        onConfirm={executeDeleteImage}
        title="Xóa ảnh khỏi thư viện"
        description="Bạn có chắc chắn muốn xóa ảnh này? Thao tác này không thể phục hồi."
        confirmText="Xóa ảnh"
        variant="destructive"
      />
    </div>
  );
}
