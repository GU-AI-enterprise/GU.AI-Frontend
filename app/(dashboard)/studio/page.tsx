"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  CreditCard,
  AlertTriangle,
  Upload,
  ImageIcon,
  ClipboardPaste,
  GalleryHorizontal,
  Play,
  Shirt,
  UserCircle2,
  Smile,
  Pencil,
  UserPlus,
  Video,
  Maximize2,
  ChevronRight,
  Wand2,
  X,
  Check,
  Loader2
} from "lucide-react";
import GuaiLoader from "@/components/shared/guai-loader";
import AiGenerateTest from "@/components/ai-generate-test";
import { supabase } from "@/lib/supabase";
import { getUserCredit, type UserCredit } from "@/features/studio/studioService";
import { getImages } from "@/features/archive/imageService";
import { AIToolType, CREDIT_COST } from "@/constants/ai";
import { toast } from "sonner";

interface StudioImage {
  id: string;
  url: string;
  file?: File;
}

const TOOLS = [
  { id: AIToolType.PRODUCT_TO_MODEL, name: "Product to Model", icon: <Wand2 className="size-4" />, credit: CREDIT_COST[AIToolType.PRODUCT_TO_MODEL] },
  { id: AIToolType.TRY_ON,           name: "Try-On",           icon: <Shirt className="size-4" />, credit: CREDIT_COST[AIToolType.TRY_ON] },
  { id: AIToolType.MODEL_SWAP,       name: "Model Swap",       icon: <UserCircle2 className="size-4" />, credit: CREDIT_COST[AIToolType.MODEL_SWAP] },
  { id: AIToolType.FACE_SWAP,        name: "Face Swap",        icon: <Smile className="size-4" />, credit: CREDIT_COST[AIToolType.FACE_SWAP] },
  { id: AIToolType.EDIT,             name: "Edit",             icon: <Pencil className="size-4" />, credit: CREDIT_COST[AIToolType.EDIT] },
  { id: AIToolType.CREATE_MODEL,     name: "Create Model",     icon: <UserPlus className="size-4" />, credit: CREDIT_COST[AIToolType.CREATE_MODEL] },
  { id: AIToolType.IMAGE_TO_VIDEO,   name: "Image to Video",   icon: <Video className="size-4" />, credit: CREDIT_COST[AIToolType.IMAGE_TO_VIDEO] },
  { id: AIToolType.UPSCALE,         name: "Image Upscale",    icon: <Maximize2 className="size-4" />, credit: CREDIT_COST[AIToolType.UPSCALE] },
];

export default function StudioPage() {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);
  const [credit, setCredit] = useState<UserCredit | null>(null);
  const [selectedTool, setSelectedTool] = useState<AIToolType>(AIToolType.PRODUCT_TO_MODEL);
  const [images, setImages] = useState<StudioImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showGalleryPicker, setShowGalleryPicker] = useState(false);
  const [galleryImages, setGalleryImages] = useState<{id: string; url: string}[]>([]);
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

        setAuthLoading(false);
        fetchCredit();
        fetchGalleryImages();
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

  const fetchCredit = async () => {
    try {
      const credit = await getUserCredit();
      if (credit) setCredit(credit);
    } catch (err) {
      console.error("Lỗi lấy credit:", err);
    }
  };

  const fetchGalleryImages = async () => {
    try {
      const images = await getImages();
      setGalleryImages(images.map(img => ({ id: img.id, url: img.url })));
    } catch (err) {
      console.error("Lỗi lấy gallery:", err);
    }
  };

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
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    if (files.length > 0) {
      addImages(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter(f => f.type.startsWith("image/"));
      addImages(files);
    }
  };

  const addImages = (files: File[]) => {
    const newImages = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(file),
      file
    }));
    setImages(prev => [...prev, ...newImages].slice(0, 5));
  };

  const handlePaste = useCallback(async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imageType = item.types.find(t => t.startsWith("image/"));
        if (imageType) {
          const blob = await item.getType(imageType);
          const file = new File([blob], `pasted-${Date.now()}.png`, { type: imageType });
          addImages([file]);
          return;
        }
      }
      toast.warning("Không tìm thấy ảnh trong clipboard.");
    } catch {
      toast.error("Trình duyệt không hỗ trợ paste ảnh hoặc chưa cấp quyền.");
    }
  }, []);

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleGallerySelect = (url: string) => {
    setImages(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), url }].slice(0, 5));
    setShowGalleryPicker(false);
  };

  const handleRun = async () => {
    if (images.length === 0) {
      toast.warning("Vui lòng thêm ít nhất 1 ảnh.");
      return;
    }
    const tool = TOOLS.find(t => t.id === selectedTool);
    if (!tool) return;

    if (credit && credit.current_credit < tool.credit) {
      toast.warning(`Bạn cần ${tool.credit} credits để sử dụng công cụ này.`);
      return;
    }

    setIsProcessing(true);
    // Simulate processing - replace with actual API call
    setTimeout(() => {
      setIsProcessing(false);
      toast.info("Đang xử lý... Tính năng này sẽ sớm được cập nhật!");
    }, 2000);
  };

  const selectedToolData = TOOLS.find(t => t.id === selectedTool);
  const canRun = images.length > 0 && !isProcessing;

  if (authLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <GuaiLoader size="lg" text="Đang xác thực..." />
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-8 py-5 flex items-center justify-between border-b border-border/40">
        <div>
          <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            Studio
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Công cụ AI tạo và chỉnh sửa ảnh sản phẩm chuyên nghiệp
          </p>
        </div>

        {/* Credit Display */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 bg-secondary/40 border border-border/30 rounded-2xl px-4 py-2.5"
        >
          <CreditCard className="size-4 text-primary" />
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              Credits
            </p>
            <p className="text-base font-serif leading-none">
              {credit ? credit.current_credit.toLocaleString("vi-VN") : "--"}
            </p>
          </div>
          {credit && credit.current_credit < 20 && (
            <AlertTriangle className="size-4 text-amber-400" />
          )}
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto min-h-0 flex flex-col items-center px-6 py-6 relative">
        {/* Drop Zone / Image Preview */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative w-full max-w-2xl transition-all duration-300 ${
            images.length === 0 ? "min-h-[320px]" : ""
          }`}
        >
          {images.length === 0 ? (
            /* Empty State */
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`w-full h-[320px] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                isDragging
                  ? "border-primary bg-primary/5 scale-[1.02]"
                  : "border-border hover:border-primary/30 hover:bg-card"
              }`}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {/* Placeholder images (decorative) */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-14 h-18 rounded-xl bg-gradient-to-br from-orange-200 to-orange-400 shadow-lg -rotate-6" />
                <div className="w-14 h-18 rounded-xl bg-gradient-to-br from-sky-200 to-sky-400 shadow-lg z-10" />
                <div className="w-14 h-18 rounded-xl bg-gradient-to-br from-amber-200 to-amber-400 shadow-lg rotate-6" />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={(e) => { e.stopPropagation(); handlePaste(); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background border border-border text-xs font-medium hover:bg-secondary transition-colors"
                >
                  <ClipboardPaste className="size-3.5" />
                  Paste
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background border border-border text-xs font-medium hover:bg-secondary transition-colors"
                >
                  <Upload className="size-3.5" />
                  Upload
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowGalleryPicker(true); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background border border-border text-xs font-medium hover:bg-secondary transition-colors"
                >
                  <GalleryHorizontal className="size-3.5" />
                  Gallery
                </button>
              </div>

              <p className="text-xs text-muted-foreground">
                or drop an image here
              </p>
            </div>
          ) : (
            /* Image Preview Grid */
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3 flex-wrap">
                {images.map((img, index) => (
                  <motion.div
                    key={img.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative group"
                  >
                    <div className="w-28 h-36 rounded-2xl overflow-hidden border border-border bg-card shadow-md">
                      <img
                        src={img.url}
                        alt="Input"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => removeImage(img.id)}
                      className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <X className="size-3" />
                    </button>
                  </motion.div>
                ))}
                
                {images.length < 5 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-28 h-36 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:border-primary/30 hover:text-foreground transition-all"
                  >
                    <Upload className="size-5 mb-1" />
                    <span className="text-[10px]">Thêm ảnh</span>
                  </button>
                )}
              </div>

              <input
                type="file"
                multiple
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}
        </div>

      </div>

      {/* Bottom Tool Bar */}
      <div className="shrink-0 border-t border-border/40 bg-background/80 backdrop-blur-xl px-6 py-3 pb-4">
        {/* Tool Tabs + Info */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {TOOLS.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setSelectedTool(tool.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedTool === tool.id
                    ? "bg-foreground text-background"
                    : "bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {tool.icon}
                {tool.name}
              </button>
            ))}
            <button className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
              <ChevronRight className="size-4" />
            </button>
          </div>

          {/* Info pills */}
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-muted-foreground shrink-0">
            <span className="flex items-center gap-1">
              <Sparkles className="size-3 text-primary" />
              {selectedToolData?.name}
            </span>
            <span className="text-border">|</span>
            <span>{selectedToolData?.credit} credits</span>
            <span className="text-border">|</span>
            <span>{images.length} ảnh</span>
          </div>
        </div>

        {/* AI Test Generate Panel */}
        <div className="mt-2 pt-2 border-t border-border/30 w-full">
          <AiGenerateTest />
        </div>
      </div>

      {/* Gallery Picker Modal */}
      <AnimatePresence>
        {showGalleryPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            onClick={() => setShowGalleryPicker(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl max-h-[70vh] rounded-3xl border border-border bg-card p-6 shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <GalleryHorizontal className="size-4 text-primary" />
                  Chọn ảnh từ thư viện
                </h3>
                <button
                  onClick={() => setShowGalleryPicker(false)}
                  className="p-1 rounded-lg hover:bg-secondary text-muted-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {galleryImages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <ImageIcon className="size-10 mb-2 opacity-50" />
                    <p className="text-xs">Thư viện trống</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-3">
                    {galleryImages.map((img) => (
                      <button
                        key={img.id}
                        onClick={() => handleGallerySelect(img.url)}
                        className="relative aspect-square rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all group"
                      >
                        <img
                          src={img.url}
                          alt="Gallery"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-colors flex items-center justify-center">
                          <Check className="size-6 text-white opacity-0 group-hover:opacity-100" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
