"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ImageIcon,
  Search,
  Download,
  Trash2,
  FolderHeart,
  Plus,
  ArrowLeft
} from "lucide-react";
import Header from "@/components/shared/header";
import { Button } from "@/components/ui/button";
import GuaiLoader from "@/components/shared/guai-loader";
import { supabase } from "@/lib/supabase";

interface DBAsset {
  id: string;
  url: string;
  thumbnail_url: string;
  type: string;
  category?: string;
  file_size: number;
  created_at: string;
}

export default function GalleryPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<DBAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "input" | "output" | "edit">("all");

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (error || !session?.user) {
          router.push("/login");
          return;
        }

        setAuthLoading(false);
        fetchImages(session.user.id);
      } catch (err) {
        if (isMounted) router.push("/login");
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      if (event === "SIGNED_OUT" || !session?.user) {
        router.push("/login");
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  const fetchImages = async (uid: string) => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const imagesRes = await fetch(`${apiUrl}/api/images`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const imagesJson = await imagesRes.json();
      if (imagesJson.success) setAssets(imagesJson.data);
    } catch (err) {
      console.error("Lỗi lấy ảnh:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa ảnh này?")) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/images/${imageId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();

      if (json.success) {
        setAssets(prev => prev.filter(img => img.id !== imageId));
      }
    } catch (err) {
      console.error("Lỗi xóa ảnh:", err);
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

  // Group by date (newest first)
  const groupedByDate = filteredAssets.reduce<Record<string, DBAsset[]>>((acc, img) => {
    const date = new Date(img.created_at).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(img);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => {
    const dateA = new Date(a.split("/").reverse().join("-"));
    const dateB = new Date(b.split("/").reverse().join("-"));
    return dateB.getTime() - dateA.getTime();
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

        {/* Gallery Grid - Grouped by Date */}
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
            <Button
              onClick={() => router.push("/archive/upload")}
              className="mt-5 rounded-xl text-xs bg-primary hover:bg-primary"
            >
              Tải lên ngay
            </Button>
          </div>
        ) : (
          <div className="space-y-10">
            {sortedDates.map((date) => (
              <div key={date}>
                {/* Date Header */}
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-sm font-semibold text-foreground">{date}</h2>
                  <div className="flex-1 h-px bg-border/60" />
                  <span className="text-xs text-muted-foreground">
                    {groupedByDate[date].length} ảnh
                  </span>
                </div>

                {/* Images for this date */}
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

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end">
                        <p className="text-[10px] text-muted-foreground font-medium">
                          {formatFileSize(img.file_size)}
                        </p>

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
                            onClick={() => router.push(`/archive/collections`)}
                            className="flex-1 py-2 rounded-xl bg-primary hover:bg-primary/90 transition-all text-[11px] font-semibold text-center text-foreground"
                          >
                            Lưu vào Album
                          </button>

                          <button
                            onClick={() => handleDeleteImage(img.id)}
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
    </div>
  );
}
