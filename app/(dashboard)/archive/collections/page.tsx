"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderHeart, FolderPlus, Folder, Trash2, X, Pencil, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import GuaiLoader from "@/components/shared/guai-loader";
import { supabase } from "@/lib/supabase";
import {
  getCollections, createCollection, deleteCollection, updateCollection,
  type Collection,
} from "@/features/archive/collectionService";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/shared/confirm-modal";

export default function CollectionsPage() {
  const router = useRouter();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);

  // Create
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Delete
  const [deleteCollectionId, setDeleteCollectionId] = useState<string | null>(null);

  // Rename
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!isMounted) return;
        if (error || !session?.user) { router.push("/login"); return; }
        setAuthLoading(false);
        fetchCollections();
      } catch { if (isMounted) router.push("/login"); }
    };
    initAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      if (event === "SIGNED_OUT" || !session?.user) router.push("/login");
    });
    return () => { isMounted = false; subscription.unsubscribe(); };
  }, [router]);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      setCollections(await getCollections());
    } catch { } finally { setLoading(false); }
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    try {
      setIsCreating(true);
      const col = await createCollection(newCollectionName.trim());
      setCollections(prev => [col, ...prev]);
      setNewCollectionName("");
      setIsCreateModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Không thể tạo album.");
    } finally {
      setIsCreating(false);
    }
  };

  const executeDeleteCollection = async () => {
    if (!deleteCollectionId) return;
    try {
      await deleteCollection(deleteCollectionId);
      setCollections(prev => prev.filter(c => c.id !== deleteCollectionId));
      toast.success("Xóa bộ sưu tập thành công!");
    } catch (err: any) {
      toast.error(err.message || "Không thể xóa bộ sưu tập.");
    } finally {
      setDeleteCollectionId(null);
    }
  };

  const startRename = (col: Collection, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingId(col.id);
    setRenameValue(col.name);
    setTimeout(() => renameInputRef.current?.focus(), 50);
  };

  const commitRename = async (id: string) => {
    const trimmed = renameValue.trim();
    if (!trimmed) { setRenamingId(null); return; }
    const col = collections.find(c => c.id === id);
    if (col && trimmed === col.name) { setRenamingId(null); return; }
    try {
      const updated = await updateCollection(id, trimmed);
      setCollections(prev => prev.map(c => c.id === id ? { ...c, name: updated.name } : c));
      toast.success("Đã đổi tên album.");
    } catch (err: any) {
      toast.error(err.message || "Không thể đổi tên.");
    } finally {
      setRenamingId(null);
    }
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-3">
              <FolderHeart className="size-7 text-primary" />
              Bộ sưu tập
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Tổ chức ảnh của bạn thành các album riêng biệt.
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)} variant="outline" className="rounded-xl border-border hover:bg-card">
            <FolderPlus className="size-4 mr-2 text-primary" />
            Tạo Album mới
          </Button>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <GuaiLoader size="md" text="Đang tải..." />
          </div>
        ) : collections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-3xl border border-dashed border-border bg-card">
            <Folder className="size-12 text-muted-foreground mb-4" />
            <h3 className="text-sm font-semibold text-muted-foreground">Chưa có bộ sưu tập nào</h3>
            <p className="text-xs text-muted-foreground/70 mt-1 max-w-xs text-center">
              Tạo Album riêng để nhóm ảnh sản phẩm, người mẫu gọn gàng và khoa học.
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)} className="mt-5 rounded-xl text-xs bg-primary hover:bg-primary">
              Khởi tạo Album ngay
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((col) => (
              <motion.div
                key={col.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => renamingId !== col.id && router.push(`/archive/collections/${col.id}`)}
                className="group relative rounded-2xl overflow-hidden border border-border bg-card p-4 transition-all duration-300 hover:border-primary/40 cursor-pointer"
              >
                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-muted border border-border relative">
                  {col.cover_asset ? (
                    <img
                      src={col.cover_asset.thumbnail_url || col.cover_asset.url}
                      alt={col.name}
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="size-full bg-gradient-to-br from-primary/20 via-zinc-950 to-indigo-950/20 flex flex-col items-center justify-center">
                      <Folder className="size-10 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground mt-2">Album trống</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4 gap-2">
                  <div className="flex-1 min-w-0">
                    {renamingId === col.id ? (
                      <input
                        ref={renameInputRef}
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={() => commitRename(col.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") { e.preventDefault(); commitRename(col.id); }
                          if (e.key === "Escape") setRenamingId(null);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full text-sm font-semibold bg-transparent border-b border-primary outline-none pb-0.5 text-foreground"
                      />
                    ) : (
                      <h3 className="text-sm font-semibold group-hover:text-primary transition-colors truncate">
                        {col.name}
                      </h3>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {new Date(col.created_at).toLocaleDateString("vi-VN")}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                    {renamingId === col.id ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); commitRename(col.id); }}
                        className="cursor-pointer p-2 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary transition-all"
                        title="Lưu tên"
                      >
                        <Check className="size-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => startRename(col, e)}
                        className="cursor-pointer p-2 rounded-xl bg-secondary border border-border hover:bg-accent text-muted-foreground hover:text-foreground transition-all"
                        title="Đổi tên"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteCollectionId(col.id); }}
                      className="cursor-pointer p-2 rounded-xl bg-red-950/30 border border-red-500/10 hover:bg-red-500/20 hover:text-red-400 text-red-500 transition-all"
                      title="Xóa album"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div key="create-collection-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 lg:p-8 shadow-2xl z-10"
            >
              <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                  <FolderPlus className="size-4 text-primary" />
                  Tạo Album mới
                </h3>
                <button onClick={() => setIsCreateModalOpen(false)} className="cursor-pointer p-1 rounded-lg hover:bg-secondary text-muted-foreground">
                  <X className="size-4" />
                </button>
              </div>
              <form onSubmit={handleCreateCollection} className="space-y-4">
                <input
                  type="text" required
                  placeholder="Tên bộ sưu tập..."
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:outline-none text-sm transition-all"
                />
                <div className="flex gap-3 justify-end pt-4">
                  <Button type="button" onClick={() => setIsCreateModalOpen(false)} variant="ghost" className="rounded-xl text-xs">Hủy</Button>
                  <Button type="submit" disabled={isCreating} className="rounded-xl text-xs bg-primary hover:bg-primary">
                    {isCreating ? "Đang tạo..." : "Tạo"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={deleteCollectionId !== null}
        onClose={() => setDeleteCollectionId(null)}
        onConfirm={executeDeleteCollection}
        title="Xóa bộ sưu tập (Album)"
        description="Bạn có chắc chắn muốn xóa bộ sưu tập này? Các ảnh bên trong sẽ không bị ảnh hưởng."
        confirmText="Xóa Album"
        variant="destructive"
      />
    </div>
  );
}
