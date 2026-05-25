"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image as ImageIcon,
  FolderHeart,
  UploadCloud,
  History as HistoryIcon,
  Trash2,
  Download,
  FolderPlus,
  Search,
  Plus,
  X,
  ChevronRight,
  Folder,
  Loader2,
  Sparkles,
  DollarSign,
  User,
  ArrowLeft
} from "lucide-react";
import Header from "@/components/shared/header";
import { Button } from "@/components/ui/button";
import GuaiLoader from "@/components/shared/guai-loader";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/shared/confirm-modal";

// Interfaces
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
  cover_asset_id: string | null;
  created_at: string;
  cover_asset?: {
    url: string;
    thumbnail_url: string;
  };
}

interface AIJob {
  id: string;
  type: string;
  status: "queued" | "processing" | "completed" | "failed" | "cancelled";
  credit_cost: number;
  created_at: string;
  result_url?: string;
}

interface Transaction {
  id: string;
  amount: number;
  provider: string;
  status: string;
  created_at: string;
  package?: {
    name: string;
    credits: number;
  };
}

interface UploadingFile {
  id: string;
  file: File;
  name: string;
  size: number;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  errorMessage?: string;
}

export default function ArchivePage() {
  const router = useRouter();

  // State quản lý tab & bộ lọc
  const [activeTab, setActiveTab] = useState<"gallery" | "collections" | "upload" | "history">("gallery");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "input" | "output" | "edit">("all");

  // State dữ liệu
  const [assets, setAssets] = useState<DBAsset[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [history, setHistory] = useState<{ aiJobs: AIJob[]; transactions: Transaction[] }>({
    aiJobs: [],
    transactions: [],
  });

  // Trạng thái tải dữ liệu
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Kéo thả & Upload
  const [uploadFiles, setUploadFiles] = useState<UploadingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Bộ sưu tập
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [collectionAssets, setCollectionAssets] = useState<DBAsset[]>([]);
  const [colImagesLoading, setColImagesLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [isCreatingCol, setIsCreatingCol] = useState(false);
  const [activeImageForCollection, setActiveImageForCollection] = useState<string | null>(null);
  const [isAddToColOpen, setIsAddToColOpen] = useState(false);

  // States cho confirm modals
  const [deleteImageId, setDeleteImageId] = useState<string | null>(null);
  const [deleteCollectionId, setDeleteCollectionId] = useState<string | null>(null);

  // Đăng nhập xác thực
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
        fetchData(session.user.id);
      } catch (err) {
        if (isMounted) router.push("/login");
      }
    };

    initAuth();

    // Lắng nghe thay đổi trạng thái đăng nhập
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

  const fetchData = async (uid: string) => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      // 1. Fetch images
      const imagesRes = await fetch(`${apiUrl}/api/images`, { headers });
      const imagesJson = await imagesRes.json();
      if (imagesJson.success) setAssets(imagesJson.data);

      // 2. Fetch collections
      const collectionsRes = await fetch(`${apiUrl}/api/collections`, { headers });
      const collectionsJson = await collectionsRes.json();
      if (collectionsJson.success) setCollections(collectionsJson.data);

      // 3. Fetch history
      const historyRes = await fetch(`${apiUrl}/api/history`, { headers });
      const historyJson = await historyRes.json();
      if (historyJson.success) {
        setHistory({
          aiJobs: historyJson.data.aiJobs,
          transactions: historyJson.data.transactions,
        });
      }
    } catch (err) {
      console.error("Lỗi lấy dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  };

  // Lấy chi tiết ảnh trong bộ sưu tập
  const fetchCollectionImages = async (colId: string) => {
    try {
      setColImagesLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/collections/${colId}/items`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setCollectionAssets(json.data);
      }
    } catch (err) {
      console.error("Lỗi lấy ảnh bộ sưu tập:", err);
    } finally {
      setColImagesLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCollectionId) {
      fetchCollectionImages(selectedCollectionId);
    }
  }, [selectedCollectionId]);

  // Trigger mở confirm modal xóa ảnh
  const handleDeleteImageTrigger = (imageId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDeleteImageId(imageId);
  };

  // Thực thi xóa ảnh khi bấm confirm
  const executeDeleteImage = async () => {
    if (!deleteImageId) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/images/${deleteImageId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();

      if (json.success) {
        setAssets(prev => prev.filter(img => img.id !== deleteImageId));
        if (selectedCollectionId) {
          setCollectionAssets(prev => prev.filter(img => img.id !== deleteImageId));
        }
        toast.success("Xóa ảnh thành công!");
      } else {
        toast.error(json.error || "Không thể xóa ảnh.");
      }
    } catch (err) {
      console.error("Lỗi xóa ảnh:", err);
      toast.error("Có lỗi xảy ra khi xóa ảnh.");
    } finally {
      setDeleteImageId(null);
    }
  };

  // Tạo bộ sưu tập mới
  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;

    try {
      setIsCreatingCol(true);
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/collections`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newCollectionName }),
      });
      const json = await res.json();

      if (json.success) {
        setCollections(prev => [json.data, ...prev]);
        setNewCollectionName("");
        setIsCreateModalOpen(false);
      }
    } catch (err) {
      console.error("Lỗi tạo bộ sưu tập:", err);
    } finally {
      setIsCreatingCol(false);
    }
  };

  // Thêm ảnh vào bộ sưu tập
  const handleAddImageToCollection = async (colId: string) => {
    if (!activeImageForCollection) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/collections/${colId}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ assetId: activeImageForCollection }),
      });
      const json = await res.json();

      if (json.success) {
        toast.success("Thêm ảnh vào bộ sưu tập thành công!");
        setIsAddToColOpen(false);
        setActiveImageForCollection(null);
        setCollections(prev => prev.map(col => {
          if (col.id === colId) {
            return {
              ...col,
              cover_asset: col.cover_asset ? col.cover_asset : assets.find(img => img.id === activeImageForCollection)
            };
          }
          return col;
        }));
      } else {
        toast.error(json.error || "Có lỗi xảy ra");
      }
    } catch (err: any) {
      toast.error("Ảnh đã tồn tại hoặc có lỗi xảy ra");
    }
  };

  // Trigger mở confirm modal xóa bộ sưu tập
  const handleDeleteCollectionTrigger = (colId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteCollectionId(colId);
  };

  // Thực thi xóa bộ sưu tập
  const executeDeleteCollection = async () => {
    if (!deleteCollectionId) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/collections/${deleteCollectionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();

      if (json.success) {
        setCollections(prev => prev.filter(col => col.id !== deleteCollectionId));
        if (selectedCollectionId === deleteCollectionId) setSelectedCollectionId(null);
        toast.success("Xóa bộ sưu tập thành công!");
      } else {
        toast.error(json.error || "Không thể xóa bộ sưu tập.");
      }
    } catch (err) {
      console.error("Lỗi xóa bộ sưu tập:", err);
      toast.error("Có lỗi xảy ra khi xóa bộ sưu tập.");
    } finally {
      setDeleteCollectionId(null);
    }
  };

  // Đổi đơn vị size ảnh
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Đọc kéo thả tệp tin
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
      handleFilesSelected(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFilesSelected(Array.from(e.target.files));
    }
  };

  const handleFilesSelected = (files: File[]) => {
    const validImageFiles = files.filter(file => file.type.startsWith("image/"));
    if (validImageFiles.length === 0) {
      toast.warning("Vui lòng kéo thả file hình ảnh hợp lệ (PNG, JPG, WEBP).");
      return;
    }

    const newUploads = validImageFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: file.size,
      progress: 0,
      status: "pending" as const,
    }));

    setUploadFiles(prev => [...prev, ...newUploads]);

    // Kích hoạt upload từng tệp tin
    newUploads.forEach(upload => uploadSingleFile(upload));
  };

  const uploadSingleFile = async (uploadItem: UploadingFile) => {
    try {
      setUploadFiles(prev =>
        prev.map(item => (item.id === uploadItem.id ? { ...item, status: "uploading", progress: 20 } : item))
      );

      const file = uploadItem.file;
      const fileExt = file.name.split(".").pop();
      const uniqueFilename = `${userId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const bucketName = "images";

      // 1. Upload lên Supabase Storage
      const { data, error } = await supabase.storage.from(bucketName).upload(uniqueFilename, file, {
        cacheControl: "3600",
        upsert: false,
      });

      if (error) {
        throw new Error(
          error.message.includes("Bucket not found")
            ? "Hãy tạo bucket công khai tên 'images' trên Supabase Dashboard -> Storage trước."
            : error.message
        );
      }

      setUploadFiles(prev =>
        prev.map(item => (item.id === uploadItem.id ? { ...item, progress: 70 } : item))
      );

      // 2. Lấy public url
      const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(uniqueFilename);

      // 3. Đồng bộ với database qua Backend API
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Phiên hoạt động đã hết hạn.");

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
      if (!json.success) throw new Error(json.error || "Lỗi đồng bộ cơ sở dữ liệu.");

      // Cập nhật trạng thái thành công
      setUploadFiles(prev =>
        prev.map(item => (item.id === uploadItem.id ? { ...item, progress: 100, status: "success" } : item))
      );

      // Reload ảnh
      if (userId) fetchData(userId);

    } catch (err: any) {
      console.error(err);
      setUploadFiles(prev =>
        prev.map(item => (
          item.id === uploadItem.id
            ? { ...item, status: "error", progress: 0, errorMessage: err.message || "Lỗi không xác định" }
            : item
        ))
      );
    }
  };

  // Lọc ảnh
  const filteredAssets = (selectedCollectionId ? collectionAssets : assets).filter(img => {
    const matchesSearch = img.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || img.type === filterType;
    return matchesSearch && matchesFilter;
  });

  if (authLoading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-background text-foreground">
        <GuaiLoader size="lg" text="Đang xác thực tài khoản..." />
      </div>
    );
  }

  return (
    <div className="w-full text-foreground selection:bg-primary/20 selection:text-primary min-h-screen">
      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        {/* Header đơn giản, tập trung nghiệp vụ */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Lưu trữ & Thư viện
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Quản lý tài sản số, tải lên ảnh mới và theo dõi lịch sử hệ thống.
            </p>
          </div>

          <Button
            onClick={() => setActiveTab("upload")}
            className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
          >
            <Plus className="size-4 mr-2" /> Tải lên ảnh mới
          </Button>
        </div>

        {/* Bảng điều hướng Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6 mb-8">
          <div className="flex p-1 rounded-lg border border-border bg-muted/30">
            <button
              onClick={() => { setActiveTab("gallery"); setSelectedCollectionId(null); }}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-md transition-all duration-200 ${activeTab === "gallery" && !selectedCollectionId
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
            >
              <ImageIcon className="size-4" />
              Tất cả ảnh
            </button>
            <button
              onClick={() => setActiveTab("collections")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-md transition-all duration-200 ${activeTab === "collections" || selectedCollectionId
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
            >
              <FolderHeart className="size-4" />
              Bộ sưu tập
            </button>
            <button
              onClick={() => setActiveTab("upload")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-md transition-all duration-200 ${activeTab === "upload"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
            >
              <UploadCloud className="size-4" />
              Upload hàng loạt
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-md transition-all duration-200 ${activeTab === "history"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
            >
              <HistoryIcon className="size-4" />
              Lịch sử tác vụ
            </button>
          </div>

          {/* Công cụ tìm kiếm & lọc (Chỉ hiện khi ở tab Gallery hoặc xem trong bộ sưu tập) */}
          {(activeTab === "gallery" || selectedCollectionId) && (
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-md bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder:text-muted-foreground"
                />
              </div>

              <select
                value={filterType}
                onChange={(e: any) => setFilterType(e.target.value)}
                className="px-3.5 py-2 text-xs rounded-md bg-background border border-border focus:border-primary focus:outline-none transition-all cursor-pointer text-foreground"
              >
                <option value="all">Tất cả định dạng</option>
                <option value="input">Ảnh đầu vào (Input)</option>
                <option value="output">Ảnh kết quả (Output)</option>
                <option value="edit">Ảnh chỉnh sửa (Edit)</option>
              </select>
            </div>
          )}
        </div>

        {/* Nội dung các TAB */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <GuaiLoader size="md" text="Đang đồng bộ hóa thư viện..." />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* 1. TAB GALLERY (Hoặc xem chi tiết Collection) */}
            {(activeTab === "gallery" || selectedCollectionId) && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Thanh điều hướng quay lại nếu đang xem chi tiết collection */}
                {selectedCollectionId && (
                  <div className="flex items-center justify-between bg-card border border-border rounded-2xl px-5 py-4">
                    <button
                      onClick={() => { setSelectedCollectionId(null); setActiveTab("collections"); }}
                      className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ArrowLeft className="size-4" />
                      Quay lại Bộ sưu tập
                    </button>
                    <span className="text-xs font-semibold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
                      {collections.find(c => c.id === selectedCollectionId)?.name}
                    </span>
                  </div>
                )}

                {filteredAssets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 rounded-3xl border border-dashed border-border bg-card">
                    <ImageIcon className="size-12 text-zinc-700 mb-4" />
                    <h3 className="text-sm font-semibold text-muted-foreground">Không tìm thấy hình ảnh nào</h3>
                    <p className="text-xs text-zinc-600 mt-1 max-w-xs text-center font-light">
                      {selectedCollectionId
                        ? "Bộ sưu tập này chưa có ảnh. Hãy thêm ảnh từ Thư viện chính hoặc Upload tệp mới."
                        : "Thư viện của bạn hiện đang trống. Hãy kéo thả tải lên hình ảnh mẫu của bạn ngay."}
                    </p>
                    {selectedCollectionId && (
                      <Button
                        onClick={() => setSelectedCollectionId(null)}
                        variant="outline"
                        className="mt-5 rounded-xl text-xs border-border hover:bg-card"
                      >
                        Về thư viện chính
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredAssets.map((img) => (
                      <motion.div
                        key={img.id}
                        layoutId={img.id}
                        className="group relative rounded-2xl overflow-hidden border border-border bg-card aspect-square transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.1)]"
                      >
                        <img
                          src={img.url}
                          alt="GU.AI Asset"
                          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />

                        {/* Định dạng Type Badge */}
                        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md border border-border px-2.5 py-1 rounded-lg text-[9px] font-semibold tracking-wider uppercase text-primary">
                          {img.type}
                        </div>

                        {/* Overlay khi hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end">
                          <p className="text-[10px] text-muted-foreground">
                            Ngày tải: {new Date(img.created_at).toLocaleDateString("vi-VN")}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                            Dung lượng: {formatFileSize(img.file_size)}
                          </p>

                          <div className="flex items-center gap-2 mt-3.5">
                            {/* Nút tải về */}
                            <a
                              href={img.url}
                              download={`guai_${img.id}.jpg`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 rounded-xl bg-card border border-border hover:bg-card hover:text-primary transition-all text-foreground"
                              title="Tải ảnh về máy"
                            >
                              <Download className="size-3.5" />
                            </a>

                            {/* Nút thêm vào bộ sưu tập */}
                            <button
                              onClick={() => {
                                setActiveImageForCollection(img.id);
                                setIsAddToColOpen(true);
                              }}
                              className="flex-1 py-2 rounded-xl bg-primary hover:bg-primary transition-all text-[11px] font-semibold text-center text-foreground"
                            >
                              Lưu vào Album
                            </button>

                            {/* Nút xóa */}
                            <button
                              onClick={(e) => handleDeleteImageTrigger(img.id, e)}
                              className="p-2 rounded-xl bg-red-950/40 border border-red-500/20 hover:bg-red-500/20 hover:text-red-400 transition-all text-red-500"
                              title="Xóa ảnh"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* 2. TAB COLLECTIONS */}
            {activeTab === "collections" && !selectedCollectionId && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Nút tác vụ tạo bộ sưu tập */}
                <div className="flex justify-end">
                  <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    variant="outline"
                    className="rounded-2xl border-border hover:bg-card px-4 py-5 text-xs font-semibold text-foreground hover:text-foreground"
                  >
                    <FolderPlus className="size-4 mr-2 text-primary" />
                    Tạo Album mới
                  </Button>
                </div>

                {collections.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 rounded-3xl border border-dashed border-border bg-card">
                    <Folder className="size-12 text-zinc-700 mb-4" />
                    <h3 className="text-sm font-semibold text-muted-foreground">Chưa có bộ sưu tập nào</h3>
                    <p className="text-xs text-zinc-600 mt-1 max-w-xs text-center font-light">
                      Tạo Album riêng của bạn để nhóm ảnh sản phẩm, ảnh chụp người mẫu, pose mẫu gọn gàng và khoa học.
                    </p>
                    <Button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="mt-5 rounded-xl text-xs bg-primary hover:bg-primary"
                    >
                      Khởi tạo Album ngay
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {collections.map((col) => (
                      <div
                        key={col.id}
                        onClick={() => setSelectedCollectionId(col.id)}
                        className="group relative rounded-2xl overflow-hidden border border-border bg-card p-4 transition-all duration-300 hover:border-primary/40 hover:bg-card cursor-pointer"
                      >
                        {/* Ảnh bìa collection */}
                        <div className="aspect-[4/3] rounded-xl overflow-hidden bg-muted border border-border relative">
                          {col.cover_asset ? (
                            <img
                              src={col.cover_asset.thumbnail_url || col.cover_asset.url}
                              alt={col.name}
                              className="size-full object-cover transition-transform duration-500 group-hover:scale-102"
                            />
                          ) : (
                            <div className="size-full bg-gradient-to-br from-primary/20 via-zinc-950 to-indigo-950/20 flex flex-col items-center justify-center">
                              <Folder className="size-10 text-zinc-700" />
                              <span className="text-[10px] text-zinc-600 mt-2 font-light">Album trống</span>
                            </div>
                          )}
                        </div>

                        {/* Tiêu đề & Thông tin */}
                        <div className="flex items-center justify-between mt-4">
                          <div>
                            <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">
                              {col.name}
                            </h3>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              Tạo ngày: {new Date(col.created_at).toLocaleDateString("vi-VN")}
                            </p>
                          </div>

                          <button
                            onClick={(e) => handleDeleteCollectionTrigger(col.id, e)}
                            className="p-2 rounded-xl bg-red-950/30 border border-red-500/10 hover:bg-red-500/20 hover:text-red-400 text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-300"
                            title="Xóa bộ sưu tập"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* 3. TAB UPLOAD HÀNG LOẠT (DRAG-DROP) */}
            {activeTab === "upload" && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Vùng kéo thả */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative rounded-3xl border-2 border-dashed p-12 text-center transition-all duration-300 cursor-pointer ${isDragging
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
                      Kéo thả hình ảnh của bạn vào đây
                    </h3>
                    <p className="text-xs text-muted-foreground font-light mt-1.5 max-w-sm">
                      Hỗ trợ upload hàng loạt tệp tin ảnh sản phẩm, pose mẫu hoặc gương mặt làm đầu vào. Hỗ trợ định dạng PNG, JPG, WEBP.
                    </p>
                    <p className="text-[10px] text-primary mt-4 font-semibold">
                      Hoặc click để duyệt tệp tin cục bộ
                    </p>
                  </div>
                </div>

                {/* Danh sách tệp đang tải */}
                {uploadFiles.length > 0 && (
                  <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between border-b border-border pb-3 mb-2">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Danh sách tệp tải lên ({uploadFiles.length})
                      </h4>
                      <button
                        onClick={() => setUploadFiles([])}
                        className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Xóa tất cả
                      </button>
                    </div>

                    <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
                      {uploadFiles.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-4 p-3 rounded-xl bg-card border border-border"
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
                              <p className="text-xs font-semibold text-zinc-200 truncate">{item.name}</p>
                              <p className="text-[10px] text-muted-foreground font-light mt-0.5">
                                Size: {formatFileSize(item.size)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 flex-shrink-0">
                            {/* Thanh tiến trình */}
                            {item.status === "uploading" && (
                              <div className="w-24 bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-primary h-1.5 transition-all duration-300 rounded-full"
                                  style={{ width: `${item.progress}%` }}
                                />
                              </div>
                            )}

                            {/* Trạng thái chữ */}
                            <span
                              className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${item.status === "success"
                                  ? "bg-green-500/10 border border-green-500/20 text-green-400"
                                  : item.status === "error"
                                    ? "bg-red-500/10 border border-red-500/20 text-red-400"
                                    : "bg-primary/10 border border-primary/20 text-primary"
                                }`}
                            >
                              {item.status === "success" && "Thành công"}
                              {item.status === "error" && "Thất bại"}
                              {item.status === "uploading" && `Đang tải ${item.progress}%`}
                              {item.status === "pending" && "Chờ duyệt..."}
                            </span>

                            {/* Tooltip lỗi nếu có */}
                            {item.errorMessage && (
                              <p className="text-[9px] text-red-400 max-w-xs block mt-1">
                                {item.errorMessage}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* 4. TAB HISTORY */}
            {activeTab === "history" && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
              >
                {/* Cột 1: Lịch sử AI Jobs */}
                <div className="rounded-3xl border border-border bg-card p-6 lg:p-8 space-y-6">
                  <h3 className="text-base font-bold flex items-center gap-2 border-b border-border pb-4">
                    <Sparkles className="size-5 text-primary animate-pulse" />
                    Lịch sử tác vụ AI Generation
                  </h3>

                  {history.aiJobs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
                      <Sparkles className="size-10 mb-2" />
                      <p className="text-xs font-light">Chưa thực hiện tác vụ AI nào.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                      {history.aiJobs.map((job) => (
                        <div
                          key={job.id}
                          className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between gap-4"
                        >
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-primary">
                              Tác vụ: {job.type}
                            </span>
                            <p className="text-xs text-foreground font-semibold mt-1">
                              ID: {job.id.substr(0, 8)}...
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {new Date(job.created_at).toLocaleString("vi-VN")}
                            </p>
                          </div>

                          <div className="flex flex-col items-end gap-1.5">
                            <span
                              className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${job.status === "completed"
                                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                  : job.status === "failed"
                                    ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                    : "bg-primary/10 text-primary border border-primary/20"
                                }`}
                            >
                              {job.status}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              Tiêu hao: {job.credit_cost} Credits
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Cột 2: Lịch sử Giao dịch */}
                <div className="rounded-3xl border border-border bg-card p-6 lg:p-8 space-y-6">
                  <h3 className="text-base font-bold flex items-center gap-2 border-b border-border pb-4">
                    <DollarSign className="size-5 text-emerald-400" />
                    Lịch sử thanh toán & Giao dịch
                  </h3>

                  {history.transactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
                      <DollarSign className="size-10 mb-2" />
                      <p className="text-xs font-light">Chưa có giao dịch nạp tiền nào.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                      {history.transactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between gap-4"
                        >
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                              {tx.package?.name || "Gói nạp Credit"}
                            </span>
                            <p className="text-xs text-foreground font-semibold mt-1">
                              Giá: {tx.amount.toLocaleString("vi-VN")} VNĐ
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {new Date(tx.created_at).toLocaleString("vi-VN")} (Cổng: {tx.provider})
                            </p>
                          </div>

                          <div className="flex flex-col items-end gap-1.5">
                            <span
                              className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${tx.status === "success"
                                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                  : "bg-zinc-800 text-muted-foreground"
                                }`}
                            >
                              {tx.status === "success" ? "Thành công" : tx.status}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              + {tx.package?.credits || 0} Credits
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* ----------------- MODALS ----------------- */}

      {/* 1. Modal tạo bộ sưu tập */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Background overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Content modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 lg:p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-10 text-foreground"
            >
              <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                  <FolderPlus className="size-4 text-primary" />
                  Khởi tạo Album mới
                </h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-card text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={handleCreateCollection} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Tên bộ sưu tập / Album
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Bộ sưu tập Xuân 2026..."
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-card border border-border focus:border-primary focus:outline-none text-xs transition-all"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <Button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    variant="ghost"
                    className="rounded-xl text-xs hover:bg-card"
                  >
                    Hủy bỏ
                  </Button>
                  <Button
                    type="submit"
                    disabled={isCreatingCol}
                    className="rounded-xl text-xs bg-primary hover:bg-primary"
                  >
                    {isCreatingCol ? "Đang xử lý..." : "Khởi tạo"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Modal lưu vào bộ sưu tập */}
      <AnimatePresence>
        {isAddToColOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsAddToColOpen(false); setActiveImageForCollection(null); }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 lg:p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-10 text-foreground"
            >
              <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                  <FolderHeart className="size-4 text-primary" />
                  Lưu vào Album / Bộ sưu tập
                </h3>
                <button
                  onClick={() => { setIsAddToColOpen(false); setActiveImageForCollection(null); }}
                  className="p-1 rounded-lg hover:bg-card text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>

              {collections.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-xs text-muted-foreground mb-4">Bạn chưa tạo Album nào để lưu.</p>
                  <Button
                    onClick={() => { setIsAddToColOpen(false); setIsCreateModalOpen(true); }}
                    className="rounded-xl text-xs bg-primary hover:bg-primary"
                  >
                    Tạo Album mới
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Chọn Album để lưu ảnh:
                  </p>
                  {collections.map((col) => (
                    <button
                      key={col.id}
                      onClick={() => handleAddImageToCollection(col.id)}
                      className="w-full flex items-center justify-between p-3.5 rounded-xl bg-card border border-border hover:bg-primary/10 hover:border-primary/30 transition-all text-left text-xs font-semibold"
                    >
                      <span className="flex items-center gap-2 text-zinc-200">
                        <Folder className="size-4 text-primary" />
                        {col.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirm modal xóa ảnh */}
      <ConfirmModal
        isOpen={deleteImageId !== null}
        onClose={() => setDeleteImageId(null)}
        onConfirm={executeDeleteImage}
        title="Xóa ảnh khỏi thư viện"
        description="Bạn có chắc chắn muốn xóa ảnh này khỏi thư viện? Hành động này không thể hoàn tác."
        confirmText="Xóa ảnh"
        variant="destructive"
      />

      {/* Confirm modal xóa album */}
      <ConfirmModal
        isOpen={deleteCollectionId !== null}
        onClose={() => setDeleteCollectionId(null)}
        onConfirm={executeDeleteCollection}
        title="Xóa bộ sưu tập (Album)"
        description="Bạn có chắc chắn muốn xóa bộ sưu tập này? Các ảnh bên trong sẽ không bị xóa khỏi thư viện chính."
        confirmText="Xóa Album"
        variant="destructive"
      />
    </div>
  );
}

