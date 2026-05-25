"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  UploadCloud,
  ImageIcon,
  X
} from "lucide-react";
import GuaiLoader from "@/components/shared/guai-loader";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface UploadingFile {
  id: string;
  file: File;
  name: string;
  size: number;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  errorMessage?: string;
}

export default function UploadPage() {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [uploadFiles, setUploadFiles] = useState<UploadingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

        setUserId(session.user.id);
        setAuthLoading(false);
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => file.type.startsWith("image/"));
    if (validFiles.length === 0) {
      toast.warning("Vui lòng chọn file hình ảnh (PNG, JPG, WEBP).");
      return;
    }

    const newUploads = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: file.size,
      progress: 0,
      status: "pending" as const,
    }));

    setUploadFiles(prev => [...prev, ...newUploads]);
    newUploads.forEach(upload => processUpload(upload));
  };

  const processUpload = async (uploadItem: UploadingFile) => {
    try {
      setUploadFiles(prev =>
        prev.map(item => item.id === uploadItem.id ? { ...item, status: "uploading", progress: 20 } : item)
      );

      const file = uploadItem.file;
      const fileExt = file.name.split(".").pop();
      const uniqueFilename = `${userId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const bucketName = "images";

      // Upload to Supabase Storage
      const { error } = await supabase.storage.from(bucketName).upload(uniqueFilename, file, {
        cacheControl: "3600",
        upsert: false,
      });

      if (error) throw new Error(error.message);

      setUploadFiles(prev =>
        prev.map(item => item.id === uploadItem.id ? { ...item, progress: 70 } : item)
      );

      // Get public URL
      const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(uniqueFilename);

      // Sync with backend
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Phiên hết hạn.");

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/images`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fileUrl: publicUrl,
          fileSize: file.size,
          type: "image",
          category: "reference",
          thumbnailUrl: publicUrl,
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Lỗi đồng bộ.");

      setUploadFiles(prev =>
        prev.map(item => item.id === uploadItem.id ? { ...item, progress: 100, status: "success" } : item)
      );
    } catch (err: any) {
      console.error(err);
      setUploadFiles(prev =>
        prev.map(item => item.id === uploadItem.id ? { ...item, status: "error", progress: 0, errorMessage: err.message } : item)
      );
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (authLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <GuaiLoader size="lg" text="Đang xác thực..." />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-6 py-10 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-3">
            <UploadCloud className="size-7 text-primary" />
            Upload hàng loạt
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kéo thả hoặc chọn nhiều ảnh để tải lên thư viện.
          </p>
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative rounded-3xl border-2 border-dashed p-12 text-center transition-all duration-300 cursor-pointer ${
            isDragging
              ? "border-primary bg-primary/5 shadow-[0_0_35px_rgba(168,85,247,0.15)]"
              : "border-border hover:border-primary/30 hover:bg-card"
          }`}
        >
          <input
            type="file"
            multiple
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-40 rounded-full bg-primary/5 blur-[50px] pointer-events-none" />

          <div className="flex flex-col items-center justify-center relative z-10">
            <div className="p-4 rounded-2xl bg-card border border-border mb-4">
              <UploadCloud className="size-8 text-primary" />
            </div>

            <h3 className="text-base font-bold text-zinc-200">
              Kéo thả hình ảnh vào đây
            </h3>
            <p className="text-xs text-muted-foreground font-light mt-1.5 max-w-sm">
              Hỗ trợ PNG, JPG, WEBP. Tải lên nhiều file cùng lúc.
            </p>
            <p className="text-[10px] text-primary mt-4 font-semibold">
              Hoặc click để chọn file
            </p>
          </div>
        </div>

        {/* Upload List */}
        {uploadFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 rounded-2xl border border-border bg-card p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Danh sách tệp ({uploadFiles.length})
              </h4>
              <button
                onClick={() => setUploadFiles([])}
                className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              >
                Xóa tất cả
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {uploadFiles.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 p-3 rounded-xl bg-background border border-border"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="size-10 rounded-lg overflow-hidden border border-border flex-shrink-0 bg-muted">
                      {item.file.type.startsWith("image/") && (
                        <img
                          src={URL.createObjectURL(item.file)}
                          alt="Preview"
                          className="size-full object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold truncate">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground">{formatFileSize(item.size)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {item.status === "uploading" && (
                      <div className="w-24 bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-primary h-1.5 transition-all duration-300 rounded-full"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    )}

                    <span
                      className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                        item.status === "success"
                          ? "bg-green-500/10 text-green-400 border border-green-500/20"
                          : item.status === "error"
                          ? "bg-red-500/10 text-red-400 border border-red-500/20"
                          : "bg-primary/10 text-primary border border-primary/20"
                      }`}
                    >
                      {item.status === "success" && "Thành công"}
                      {item.status === "error" && "Thất bại"}
                      {item.status === "uploading" && `${item.progress}%`}
                      {item.status === "pending" && "Chờ..."}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
