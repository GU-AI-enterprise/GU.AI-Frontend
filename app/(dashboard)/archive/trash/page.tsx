"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Archive, RotateCcw, AlertTriangle, Clock, X, CheckSquare, Layers, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ActionBar,
  ActionBarClose,
  ActionBarGroup,
  ActionBarItem,
  ActionBarSelection,
  ActionBarSeparator,
} from "@/components/ui/action-bar";
import GuaiLoader from "@/components/shared/guai-loader";
import { supabase } from "@/lib/supabase";
import {
  getArchivedImages, restoreFromArchive, permanentlyDeleteImage,
  emptyArchive, daysUntilExpiry, type DBAsset
} from "@/features/archive/imageService";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/shared/confirm-modal";

export default function ArchivePage() {
  const router = useRouter();
  const [assets, setAssets] = useState<DBAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [emptyConfirm, setEmptyConfirm] = useState(false);

  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!isMounted) return;
        if (error || !session?.user) { router.push("/login"); return; }
        setAuthLoading(false);
        fetchArchive();
      } catch { if (isMounted) router.push("/login"); }
    };
    initAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      if (event === "SIGNED_OUT" || !session?.user) router.push("/login");
    });
    return () => { isMounted = false; subscription.unsubscribe(); };
  }, [router]);

  const fetchArchive = async () => {
    try { setLoading(true); setAssets(await getArchivedImages()); }
    catch { } finally { setLoading(false); }
  };

  const handleRestore = async (id: string) => {
    try {
      await restoreFromArchive(id);
      setAssets(prev => prev.filter(a => a.id !== id));
      toast.success("Đã khôi phục ảnh về thư viện.");
    } catch (err: any) { toast.error(err.message || "Không thể khôi phục ảnh."); }
  };

  const handlePermanentDelete = async () => {
    if (!deleteId) return;
    try {
      await permanentlyDeleteImage(deleteId);
      setAssets(prev => prev.filter(a => a.id !== deleteId));
      toast.success("Đã xóa vĩnh viễn ảnh.");
    } catch (err: any) { toast.error(err.message || "Không thể xóa ảnh."); }
    finally { setDeleteId(null); }
  };

  const handleEmptyArchive = async () => {
    try {
      const result = await emptyArchive();
      setAssets([]);
      toast.success(`Đã dọn sạch Archive (${result.deletedCount} ảnh).`);
    } catch (err: any) { toast.error(err.message || "Không thể dọn Archive."); }
    finally { setEmptyConfirm(false); }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    try {
      await Promise.all(ids.map(id => permanentlyDeleteImage(id)));
      setAssets(prev => prev.filter(a => !selectedIds.has(a.id)));
      setSelectedIds(new Set()); setSelectMode(false);
      toast.success(`Đã xóa vĩnh viễn ${ids.length} ảnh.`);
    } catch (err: any) { toast.error(err.message || "Không thể xóa ảnh."); }
    finally { setBulkDeleteConfirm(false); }
  };

  const handleBulkRestore = async () => {
    const ids = Array.from(selectedIds);
    try {
      await Promise.all(ids.map(id => restoreFromArchive(id)));
      setAssets(prev => prev.filter(a => !selectedIds.has(a.id)));
      setSelectedIds(new Set()); setSelectMode(false);
      toast.success(`Đã khôi phục ${ids.length} ảnh về thư viện.`);
    } catch (err: any) { toast.error(err.message || "Không thể khôi phục ảnh."); }
  };

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const getDaysBadge = (archivedAt?: string | null) => {
    if (!archivedAt) return null;
    const days = daysUntilExpiry(archivedAt);
    if (days === 0) return { label: "Xóa hôm nay", color: "bg-red-600" };
    if (days === 1) return { label: "Còn 1 ngày", color: "bg-orange-500" };
    return { label: `Còn ${days} ngày`, color: "bg-zinc-600" };
  };

  if (authLoading) return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <GuaiLoader size="lg" text="Đang xác thực..." />
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
          <div>
            <h1 className="font-serif text-3xl font-light tracking-tight text-foreground flex items-center gap-3">
              <Archive className="size-7 text-primary" />
              <span className="font-normal italic text-primary">Archive</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Ảnh sẽ bị xóa vĩnh viễn sau 2 ngày nếu không được khôi phục.</p>
          </div>
          <div className="flex items-center gap-2">
            {assets.length > 0 && (
              <>
                <Button variant="outline" onClick={selectMode ? () => { setSelectMode(false); setSelectedIds(new Set()); } : () => setSelectMode(true)} className="rounded-xl text-xs">
                  <X className={`size-3.5 mr-1.5 ${selectMode ? "" : "hidden"}`} />
                  <Layers className={`size-3.5 mr-1.5 ${selectMode ? "hidden" : ""}`} />
                  {selectMode ? "Thoát chọn" : "Chọn nhiều"}
                </Button>
                <Button variant="destructive" onClick={() => setEmptyConfirm(true)} className="rounded-xl text-xs">
                  <Trash2 className="size-3.5 mr-1.5" /> Dọn sạch Archive
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Banner */}
        <div className="flex items-start gap-3 p-4 mb-8 rounded-2xl bg-amber-500/5 border border-amber-500/20">
          <AlertTriangle className="size-4 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Ảnh trong Archive sẽ tự động bị <span className="font-semibold text-foreground">xóa vĩnh viễn sau 2 ngày</span>.
            Bạn có thể khôi phục về thư viện hoặc xóa vĩnh viễn ngay.
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <GuaiLoader size="md" text="Đang tải Archive..." />
          </div>
        ) : assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-3xl border border-dashed border-border bg-card">
            <Archive className="size-12 text-muted-foreground mb-4 opacity-40" />
            <h3 className="text-sm font-semibold text-muted-foreground">Archive trống</h3>
            <p className="text-xs text-muted-foreground/70 mt-1">Không có ảnh nào trong Archive.</p>
            <Button variant="outline" onClick={() => router.push("/archive/gallery")} className="mt-5 rounded-xl text-xs">
              Quay lại thư viện
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            <AnimatePresence>
              {assets.map((img) => {
                const isSelected = selectedIds.has(img.id);
                const badge = getDaysBadge(img.archived_at);
                return (
                  <motion.div key={img.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                    className={`group relative rounded-2xl overflow-hidden border bg-card aspect-[3/4] transition-all duration-300 cursor-pointer ${isSelected ? "border-primary ring-2 ring-primary/40" : "border-border hover:border-primary/40"}`}
                    onClick={() => selectMode && toggleSelect(img.id)}>

                    {img.type === "video"
                      ? <video src={img.url} muted preload="metadata" className="size-full object-cover opacity-70 group-hover:opacity-85 transition-opacity duration-300" />
                      : <img src={img.thumbnail_url || img.url} alt="Archived asset" className="size-full object-cover opacity-70 group-hover:opacity-85 transition-opacity duration-300" loading="lazy" />
                    }

                    {badge && (
                      <div className={`absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white ${badge.color}`}>
                        <Clock className="size-2.5" />{badge.label}
                      </div>
                    )}

                    {selectMode && (
                      <div className="absolute top-2 left-2">
                        <div className={`size-5 rounded-md border-2 flex items-center justify-center ${isSelected ? "bg-primary border-primary" : "bg-black/40 border-white/60"}`}>
                          <CheckSquare className={`size-3.5 text-white ${isSelected ? "opacity-100" : "opacity-0"}`} />
                        </div>
                      </div>
                    )}

                    {!selectMode && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 flex flex-col justify-end">
                        <div className="flex items-center gap-2">
                          <button onClick={(e) => { e.stopPropagation(); handleRestore(img.id); }}
                            className="cursor-pointer flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 transition-all text-[11px] font-semibold text-white flex items-center justify-center gap-1.5">
                            <RotateCcw className="size-3.5" /> Khôi phục
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); setDeleteId(img.id); }}
                            className="cursor-pointer p-2 rounded-xl bg-red-600/80 hover:bg-red-600 transition-all text-white" title="Xóa vĩnh viễn">
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Multi-select bottom bar */}
      <ActionBar open={selectMode && selectedIds.size > 0} onOpenChange={(open) => !open && setSelectedIds(new Set())}>
        <ActionBarSelection>Đã chọn {selectedIds.size} ảnh</ActionBarSelection>
        <ActionBarSeparator />
        <ActionBarGroup>
          <ActionBarItem onSelect={handleBulkRestore} className="bg-emerald-600 text-white hover:bg-emerald-500">
            <RotateCcw className="size-3.5" /> Khôi phục
          </ActionBarItem>
          <ActionBarItem
            onSelect={(e) => { e.preventDefault(); setBulkDeleteConfirm(true); }}
            className="bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20"
          >
            <Trash2 className="size-3.5" /> Xóa vĩnh viễn
          </ActionBarItem>
        </ActionBarGroup>
        <ActionBarClose>
          <X className="size-3.5" />
        </ActionBarClose>
      </ActionBar>

      <ConfirmModal isOpen={deleteId !== null} onClose={() => setDeleteId(null)} onConfirm={handlePermanentDelete}
        title="Xóa vĩnh viễn" description="Ảnh này sẽ bị xóa vĩnh viễn và không thể khôi phục."
        confirmText="Xóa vĩnh viễn" variant="destructive" />

      <ConfirmModal isOpen={emptyConfirm} onClose={() => setEmptyConfirm(false)} onConfirm={handleEmptyArchive}
        title="Dọn sạch Archive" description={`Tất cả ${assets.length} ảnh trong Archive sẽ bị xóa vĩnh viễn.`}
        confirmText="Dọn sạch" variant="destructive" />

      <ConfirmModal isOpen={bulkDeleteConfirm} onClose={() => setBulkDeleteConfirm(false)} onConfirm={handleBulkDelete}
        title={`Xóa vĩnh viễn ${selectedIds.size} ảnh`} description="Những ảnh đã chọn sẽ bị xóa vĩnh viễn."
        confirmText={`Xóa vĩnh viễn ${selectedIds.size} ảnh`} variant="destructive" />
    </div>
  );
}
