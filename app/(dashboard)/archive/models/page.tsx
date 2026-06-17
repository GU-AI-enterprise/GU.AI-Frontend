"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  UserCircle2, Search, Download, Archive,
  Plus, CheckSquare, X, Layers, UploadCloud, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import GuaiLoader from "@/components/shared/guai-loader";
import { Lightbox } from "@/components/shared/lightbox";
import { supabase } from "@/lib/supabase";
import { getImages, archiveImage, bulkArchive, syncImage, uploadFile, type DBAsset } from "@/features/archive/imageService";
import { toast } from "sonner";

const CATEGORY = "model";
const BUCKET   = "models";

export default function ModelsPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<DBAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Lightbox
  const [lightboxUrl, setLightboxUrl]             = useState<string | null>(null);
  const [lightboxCreatedAt, setLightboxCreatedAt] = useState<string | undefined>();
  const [lightboxIndex, setLightboxIndex]         = useState(0);

  // Multi-select
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let isMounted = true;
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!isMounted) return;
      if (error || !session?.user) { router.push("/login"); return; }
      setUserId(session.user.id);
      setAuthLoading(false);
      fetchModels();
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      if (event === "SIGNED_OUT" || !session?.user) router.push("/login");
    });
    return () => { isMounted = false; subscription.unsubscribe(); };
  }, [router]);

  const fetchModels = async () => {
    try {
      setLoading(true);
      setAssets(await getImages(CATEGORY));
    } catch { } finally { setLoading(false); }
  };

  // ── Upload ────────────────────────────────────────────────────────────────

  const handleUpload = async (files: FileList | null) => {
    if (!files) return;
    const list = Array.from(files).filter(f => f.type.startsWith("image/"));
    if (!list.length) return;

    setUploading(true);
    let successCount = 0;
    const newAssets: DBAsset[] = [];

    for (const file of list) {
      try {
        const publicUrl = await uploadFile(file, BUCKET);
        const saved = await syncImage({ fileUrl: publicUrl, fileSize: file.size, type: "image", category: CATEGORY, thumbnailUrl: publicUrl });
        newAssets.push(saved);
        successCount++;
      } catch (err: any) {
        toast.error(`Lỗi upload ${file.name}: ${err.message}`);
      }
    }

    setAssets(prev => [...newAssets, ...prev]);
    if (successCount > 0) toast.success(`Đã tải lên ${successCount} ảnh người mẫu.`);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Archive ───────────────────────────────────────────────────────────────

  const executeArchive = async (id: string) => {
    try {
      await archiveImage(id);
      setAssets(prev => prev.filter(a => a.id !== id));
      toast.success("Đã chuyển vào Archive.", {
        action: { label: "Xem Archive", onClick: () => router.push("/archive/trash") },
      });
    } catch (err: any) { toast.error(err.message); }
  };

  const executeBulkArchive = async () => {
    const ids = Array.from(selectedIds);
    try {
      await bulkArchive(ids);
      setAssets(prev => prev.filter(a => !selectedIds.has(a.id)));
      setSelectedIds(new Set()); setSelectMode(false);
      toast.success(`Đã chuyển ${ids.length} ảnh vào Archive.`);
    } catch (err: any) { toast.error(err.message); }
  };

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "";
    const k = 1024, sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const filtered = assets.filter(a =>
    a.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedByDate = filtered.reduce<Record<string, DBAsset[]>>((acc, img) => {
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
            <h1 className="font-serif text-3xl font-light tracking-tight text-foreground flex items-center gap-3">
              <UserCircle2 className="size-7 text-primary" />
              Người <span className="font-normal italic text-primary">mẫu</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Lưu trữ ảnh người mẫu để sử dụng trong Studio.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={selectMode ? () => { setSelectMode(false); setSelectedIds(new Set()); } : () => setSelectMode(true)} className="rounded-xl text-xs">
              <X className={`size-3.5 mr-1.5 ${selectMode ? "" : "hidden"}`} />
              <Layers className={`size-3.5 mr-1.5 ${selectMode ? "hidden" : ""}`} />
              {selectMode ? "Thoát chọn" : "Chọn nhiều"}
            </Button>
            <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
              {uploading
                ? <><Loader2 className="size-4 mr-2 animate-spin" /> Đang tải...</>
                : <><UploadCloud className="size-4 mr-2" /> Thêm người mẫu</>}
            </Button>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
              onChange={(e) => handleUpload(e.target.files)} />
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input type="text" placeholder="Tìm kiếm người mẫu..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all" />
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <GuaiLoader size="md" text="Đang tải người mẫu..." />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-3xl border border-dashed border-border bg-card">
            <UserCircle2 className="size-12 text-muted-foreground mb-4 opacity-40" />
            <h3 className="text-sm font-semibold text-muted-foreground">Chưa có người mẫu nào</h3>
            <p className="text-xs text-muted-foreground/70 mt-1 max-w-xs text-center">
              Tải lên ảnh người mẫu để dùng nhanh trong Studio mà không cần upload lại.
            </p>
            <Button onClick={() => fileInputRef.current?.click()} className="mt-5 rounded-xl text-xs bg-primary hover:bg-primary">
              <UploadCloud className="size-3.5 mr-1.5" /> Tải lên ngay
            </Button>
          </div>
        ) : (
          <div className="space-y-10">
            {sortedDates.map(date => (
              <div key={date}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-sm font-semibold text-foreground">{date}</h2>
                  <div className="flex-1 h-px bg-border/60" />
                  <span className="text-xs text-muted-foreground">{groupedByDate[date].length} ảnh</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                  {groupedByDate[date].map(img => {
                    const isSelected = selectedIds.has(img.id);
                    return (
                      <motion.div key={img.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className={`group relative rounded-2xl overflow-hidden border bg-card aspect-[3/4] transition-all duration-300 cursor-pointer
                          ${isSelected ? "border-primary ring-2 ring-primary/40" : "border-border hover:border-primary/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.1)]"}`}
                        onClick={() => {
                          if (selectMode) toggleSelect(img.id);
                          else {
                            const idx = filtered.findIndex(a => a.id === img.id);
                            setLightboxIndex(idx); setLightboxUrl(img.url); setLightboxCreatedAt(img.created_at);
                          }
                        }}>
                        <img src={img.url} alt="Model" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />

                        <div className={`absolute top-2 left-2 transition-opacity duration-150 ${selectMode ? "opacity-100" : "opacity-0"}`}>
                          <div className={`size-5 rounded-md border-2 flex items-center justify-center ${isSelected ? "bg-primary border-primary" : "bg-black/40 border-white/60"}`}>
                            <CheckSquare className={`size-3.5 text-white ${isSelected ? "opacity-100" : "opacity-0"}`} />
                          </div>
                        </div>

                        <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent transition-opacity duration-300 p-4 flex flex-col justify-end ${selectMode ? "opacity-0" : "opacity-0 group-hover:opacity-100"}`}>
                          <p className="text-[10px] text-white/60 font-medium">{formatFileSize(img.file_size)}</p>
                          <div className="flex items-center gap-2 mt-3">
                            <a href={img.url} download target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
                              className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all text-white">
                              <Download className="size-3.5" />
                            </a>
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
            <button onClick={executeBulkArchive}
              className="cursor-pointer flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-semibold hover:bg-amber-500/20 transition-colors">
              <Archive className="size-3.5" /> Archive {selectedIds.size} ảnh
            </button>
          </div>
        </div>
      </div>

      <Lightbox imageUrl={lightboxUrl} createdAt={lightboxCreatedAt} currentIndex={lightboxIndex}
        images={filtered.map(a => ({ url: a.url, createdAt: a.created_at }))}
        onNavigate={(idx) => { const img = filtered[idx]; if (img) { setLightboxIndex(idx); setLightboxUrl(img.url); setLightboxCreatedAt(img.created_at); } }}
        onClose={() => { setLightboxUrl(null); setLightboxCreatedAt(undefined); }} />
    </div>
  );
}
