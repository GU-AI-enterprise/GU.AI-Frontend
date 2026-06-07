"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ImageIcon, Search, Download, Archive,
  FolderHeart, Plus, CheckSquare, X, Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import GuaiLoader from "@/components/shared/guai-loader";
import { Lightbox } from "@/components/shared/lightbox";
import { SaveToAlbumModal } from "@/components/shared/save-to-album-modal";
import { supabase } from "@/lib/supabase";
import { getImages, archiveImage, bulkArchive, type DBAsset } from "@/features/archive/imageService";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectPendingLightbox, clearPendingLightbox } from "@/features/aiJob/aiJobSlice";

export default function GalleryPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const pendingLightbox = useAppSelector(selectPendingLightbox);
  const [assets, setAssets] = useState<DBAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "input" | "output" | "edit">("all");

  const [lightboxUrl, setLightboxUrl]             = useState<string | null>(null);
  const [lightboxCreatedAt, setLightboxCreatedAt] = useState<string | undefined>();
  const [lightboxIndex, setLightboxIndex]         = useState(0);

  const [saveAssetId, setSaveAssetId] = useState<string | null>(null);

  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!isMounted) return;
        if (error || !session?.user) { router.push("/login"); return; }
        setAuthLoading(false);
        fetchImages();
      } catch { if (isMounted) router.push("/login"); }
    };
    initAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      if (event === "SIGNED_OUT" || !session?.user) router.push("/login");
    });
    return () => { isMounted = false; subscription.unsubscribe(); };
  }, [router]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      setAssets(await getImages());
    } catch { } finally { setLoading(false); }
  };

  // Open lightbox for a completed AI job when navigated from toast
  useEffect(() => {
    if (!pendingLightbox || loading) return;
    if (pendingLightbox.assetId) {
      const idx = assets.findIndex(a => a.id === pendingLightbox.assetId);
      if (idx !== -1) {
        setLightboxIndex(idx);
        setLightboxUrl(assets[idx].url);
        setLightboxCreatedAt(assets[idx].created_at);
        dispatch(clearPendingLightbox());
        return;
      }
    }
    // Fallback: open by imageUrl directly (asset not yet in list)
    if (pendingLightbox.imageUrl) {
      setLightboxUrl(pendingLightbox.imageUrl);
      dispatch(clearPendingLightbox());
    }
  }, [pendingLightbox, loading, assets]); // eslint-disable-line react-hooks/exhaustive-deps

  const executeArchive = async (id: string) => {
    try {
      await archiveImage(id);
      setAssets(prev => prev.filter(img => img.id !== id));
      toast.success("Đã chuyển vào Archive.", {
        action: { label: "Xem Archive", onClick: () => router.push("/archive/trash") },
      });
    } catch (err: any) {
      toast.error(err.message || "Không thể chuyển ảnh vào Archive.");
    }
  };

  const executeBulkArchive = async () => {
    const ids = Array.from(selectedIds);
    try {
      await bulkArchive(ids);
      setAssets(prev => prev.filter(img => !selectedIds.has(img.id)));
      setSelectedIds(new Set());
      setSelectMode(false);
      toast.success(`Đã chuyển ${ids.length} ảnh vào Archive.`, {
        action: { label: "Xem Archive", onClick: () => router.push("/archive/trash") },
      });
    } catch (err: any) {
      toast.error(err.message || "Không thể chuyển ảnh vào Archive.");
    }
  };

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const exitSelectMode = () => { setSelectMode(false); setSelectedIds(new Set()); };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "";
    const k = 1024, sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const filteredAssets = assets.filter(img => {
    const matchesSearch = img.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (img.type && img.type.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = filterType === "all" || img.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const groupedByDate = filteredAssets.reduce<Record<string, DBAsset[]>>((acc, img) => {
    const date = new Date(img.created_at).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    if (!acc[date]) acc[date] = [];
    acc[date].push(img);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
    const toMs = (s: string) => new Date(s.split("/").reverse().join("-")).getTime();
    return toMs(b) - toMs(a);
  });

  if (authLoading) return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <GuaiLoader size="lg" text="Đang xác thực..." />
    </div>
  );

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
            <p className="text-sm text-muted-foreground mt-1">Quản lý và tổ chức thư viện ảnh của bạn.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={selectMode ? exitSelectMode : () => setSelectMode(true)} className="rounded-xl text-xs">
              <X className={`size-3.5 mr-1.5 ${selectMode ? "" : "hidden"}`} />
              <Layers className={`size-3.5 mr-1.5 ${selectMode ? "hidden" : ""}`} />
              {selectMode ? "Thoát chọn" : "Chọn nhiều"}
            </Button>
            <Button onClick={() => router.push("/archive/upload")} className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm">
              <Plus className="size-4 mr-2" /> Tải lên ảnh mới
            </Button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-3 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input type="text" placeholder="Tìm kiếm ảnh..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all" />
          </div>
          <select value={filterType} onChange={(e: any) => setFilterType(e.target.value)}
            className="px-4 py-2.5 text-sm rounded-xl bg-background border border-border focus:border-primary focus:outline-none cursor-pointer">
            <option value="all">Tất cả định dạng</option>
            <option value="image">Ảnh</option>
            <option value="video">Video</option>
            <option value="file">File</option>
          </select>
        </div>

        {/* Gallery */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <GuaiLoader size="md" text="Đang tải thư viện..." />
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-3xl border border-dashed border-border bg-card">
            <ImageIcon className="size-12 text-muted-foreground mb-4" />
            <h3 className="text-sm font-semibold text-muted-foreground">Không tìm thấy hình ảnh nào</h3>
            <p className="text-xs text-muted-foreground/70 mt-1 max-w-xs text-center">Thư viện của bạn hiện đang trống.</p>
            <Button onClick={() => router.push("/archive/upload")} className="mt-5 rounded-xl text-xs bg-primary hover:bg-primary">Tải lên ngay</Button>
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
                  {groupedByDate[date].map((img) => {
                    const isSelected = selectedIds.has(img.id);
                    return (
                      <motion.div key={img.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className={`group relative rounded-2xl overflow-hidden border bg-card aspect-[3/4] transition-all duration-300 cursor-pointer ${isSelected ? "border-primary ring-2 ring-primary/40" : "border-border hover:border-primary/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.1)]"}`}
                        onClick={() => {
                          if (selectMode) toggleSelect(img.id);
                          else {
                            const idx = filteredAssets.findIndex(a => a.id === img.id);
                            setLightboxIndex(idx); setLightboxUrl(img.url); setLightboxCreatedAt(img.created_at);
                          }
                        }}>
                        <img src={img.url} alt="GU.AI Asset" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />

                        <div className={`absolute top-2 left-2 transition-opacity duration-150 ${selectMode ? "opacity-100" : "opacity-0"}`}>
                          <div className={`size-5 rounded-md border-2 flex items-center justify-center transition-colors ${isSelected ? "bg-primary border-primary" : "bg-black/40 border-white/60"}`}>
                            <CheckSquare className={`size-3.5 text-white transition-opacity ${isSelected ? "opacity-100" : "opacity-0"}`} />
                          </div>
                        </div>

                        <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent transition-opacity duration-300 p-4 flex flex-col justify-end ${selectMode ? "opacity-0" : "opacity-0 group-hover:opacity-100"}`}>
                          <p className="text-[10px] text-white/60 font-medium">{formatFileSize(img.file_size)}</p>
                          <div className="flex items-center gap-2 mt-3">
                            <a href={img.url} download target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
                              className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all text-white">
                              <Download className="size-3.5" />
                            </a>
                            <button onClick={(e) => { e.stopPropagation(); setSaveAssetId(img.id); }}
                              className="cursor-pointer flex-1 py-2 rounded-xl bg-primary hover:bg-primary/90 transition-all text-[11px] font-semibold text-center text-primary-foreground flex items-center justify-center gap-1.5">
                              <FolderHeart className="size-3.5" /> Lưu album
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); executeArchive(img.id); }}
                              className="cursor-pointer p-2 rounded-xl bg-amber-500/20 backdrop-blur-md border border-amber-500/30 hover:bg-amber-500/30 hover:text-amber-300 transition-all text-amber-400"
                              title="Chuyển vào Archive">
                              <Archive className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Multi-select bottom bar */}
      <div className={`fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 ${selectMode && selectedIds.size > 0 ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"}`}>
        <div className="mx-auto max-w-xl mb-6 px-4">
          <div className="flex items-center gap-3 bg-card border border-border rounded-2xl shadow-2xl p-3">
            <span className="text-sm font-semibold text-foreground flex-1">Đã chọn {selectedIds.size} ảnh</span>
            <button onClick={() => { const firstId = Array.from(selectedIds)[0]; if (firstId) setSaveAssetId(firstId); }}
              className="cursor-pointer flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors">
              <FolderHeart className="size-3.5" /> Lưu vào Album
            </button>
            <button onClick={executeBulkArchive}
              className="cursor-pointer flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-semibold hover:bg-red-500/20 transition-colors">
              <Archive className="size-3.5" /> Xóa {selectedIds.size} ảnh
            </button>
          </div>
        </div>
      </div>

      <Lightbox imageUrl={lightboxUrl} createdAt={lightboxCreatedAt} currentIndex={lightboxIndex}
        images={filteredAssets.map(a => ({ url: a.url, createdAt: a.created_at }))}
        onNavigate={(idx) => { const img = filteredAssets[idx]; if (img) { setLightboxIndex(idx); setLightboxUrl(img.url); setLightboxCreatedAt(img.created_at); } }}
        onClose={() => { setLightboxUrl(null); setLightboxCreatedAt(undefined); }} />

      <SaveToAlbumModal assetId={saveAssetId} onClose={() => setSaveAssetId(null)} />
    </div>
  );
}
