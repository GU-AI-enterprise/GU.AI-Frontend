"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { selectCreditBalance, setBalance } from "@/features/credit/creditSlice";
import {
  Sparkles,
  Upload,
  ImageIcon,
  ClipboardPaste,
  GalleryHorizontal,
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
  Loader2,
  Download,
  RefreshCw,
  AlertCircle,
  FolderHeart,
  ImageIcon as SaveIcon,
} from "lucide-react";
import GuaiLoader from "@/components/shared/guai-loader";
import AiGenerateTest from "@/components/ai-generate-test";
import { Lightbox } from "@/components/shared/lightbox";
import { SaveToAlbumModal } from "@/components/shared/save-to-album-modal";
import { supabase } from "@/lib/supabase";
import { getImages, syncImage } from "@/features/archive/imageService";
import { AIToolType, CREDIT_COST } from "@/constants/ai";
import { toast } from "sonner";
import { tryOn, type TryOnCategory } from "@/features/studio/studioService";
import { useAIJob } from "@/hooks/useAIJob";

interface StudioImage {
  id: string;
  url: string;
  file?: File;
  label?: string;
}

const TOOLS = [
  { id: AIToolType.PRODUCT_TO_MODEL, name: "Product to Model", icon: <Wand2 className="size-4" />, credit: CREDIT_COST[AIToolType.PRODUCT_TO_MODEL] },
  { id: AIToolType.TRY_ON, name: "Try-On", icon: <Shirt className="size-4" />, credit: CREDIT_COST[AIToolType.TRY_ON] },
  { id: AIToolType.MODEL_SWAP, name: "Model Swap", icon: <UserCircle2 className="size-4" />, credit: CREDIT_COST[AIToolType.MODEL_SWAP] },
  { id: AIToolType.FACE_SWAP, name: "Face Swap", icon: <Smile className="size-4" />, credit: CREDIT_COST[AIToolType.FACE_SWAP] },
  { id: AIToolType.EDIT, name: "Edit", icon: <Pencil className="size-4" />, credit: CREDIT_COST[AIToolType.EDIT] },
  { id: AIToolType.CREATE_MODEL, name: "Create Model", icon: <UserPlus className="size-4" />, credit: CREDIT_COST[AIToolType.CREATE_MODEL] },
  { id: AIToolType.IMAGE_TO_VIDEO, name: "Image to Video", icon: <Video className="size-4" />, credit: CREDIT_COST[AIToolType.IMAGE_TO_VIDEO] },
  { id: AIToolType.UPSCALE, name: "Image Upscale", icon: <Maximize2 className="size-4" />, credit: CREDIT_COST[AIToolType.UPSCALE] },
];

const TRY_ON_CATEGORIES: { value: TryOnCategory; label: string }[] = [
  { value: "auto", label: "Tự động" },
  { value: "tops", label: "Áo / Tops" },
  { value: "bottoms", label: "Quần / Bottoms" },
  { value: "one-pieces", label: "Liền thân" },
];

export default function StudioPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const creditBalance = useAppSelector(selectCreditBalance);
  const [authLoading, setAuthLoading] = useState(true);
  const [selectedTool, setSelectedTool] = useState<AIToolType>(AIToolType.TRY_ON);

  // Try-On specific state
  const [modelImage, setModelImage] = useState<StudioImage | null>(null);
  const [garmentImage, setGarmentImage] = useState<StudioImage | null>(null);
  const [tryOnCategory, setTryOnCategory] = useState<TryOnCategory>("auto");

  // Generic image upload (other tools)
  const [images, setImages] = useState<StudioImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const [showGalleryPicker, setShowGalleryPicker] = useState(false);
  const [galleryTarget, setGalleryTarget] = useState<"model" | "garment" | "generic">("generic");
  const [galleryImages, setGalleryImages] = useState<{ id: string; url: string }[]>([]);

  // AI job tracking
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const { state: jobState, imageUrl: resultUrl, error: jobError, isProcessing, reset: resetJob } = useAIJob(activeJobId);

  // Result actions
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [saveAlbumAssetId, setSaveAlbumAssetId] = useState<string | null>(null);
  const [resultAssetId, setResultAssetId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { setIsMounted(true); }, []);

  const modelFileRef = useRef<HTMLInputElement>(null);
  const garmentFileRef = useRef<HTMLInputElement>(null);
  const genericFileRef = useRef<HTMLInputElement>(null);

  // Auth init
  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!isMounted) return;
        if (error || !session?.user) { router.push("/login"); return; }
        setAuthLoading(false);
        fetchGalleryImages();
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

  // Reset job + inputs when switching tool
  useEffect(() => {
    resetJob();
    setActiveJobId(null);
    setModelImage(null);
    setGarmentImage(null);
    setImages([]);
  }, [selectedTool]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync credit after job completes (backend deducts, socket balance update may come via notification)
  useEffect(() => {
    if (jobState === "completed") {
      toast.success("Xử lý thành công!");
    } else if (jobState === "failed" && jobError) {
      toast.error(jobError);
    }
  }, [jobState, jobError]);

  const fetchGalleryImages = async () => {
    try {
      const imgs = await getImages();
      setGalleryImages(imgs.map(img => ({ id: img.id, url: img.url })));
    } catch {}
  };

  // ── Image helpers ─────────────────────────────────────────────────────────

  const fileToStudioImage = (file: File): StudioImage => ({
    id: Math.random().toString(36).substr(2, 9),
    url: URL.createObjectURL(file),
    file,
  });

  const handlePaste = useCallback(async (target: "model" | "garment" | "generic") => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imageType = item.types.find(t => t.startsWith("image/"));
        if (imageType) {
          const blob = await item.getType(imageType);
          const file = new File([blob], `pasted-${Date.now()}.png`, { type: imageType });
          const img = fileToStudioImage(file);
          if (target === "model") setModelImage(img);
          else if (target === "garment") setGarmentImage(img);
          else setImages(prev => [...prev, img].slice(0, 5));
          return;
        }
      }
      toast.warning("Không tìm thấy ảnh trong clipboard.");
    } catch {
      toast.error("Trình duyệt không hỗ trợ paste ảnh.");
    }
  }, []);

  const openGallery = (target: "model" | "garment" | "generic") => {
    setGalleryTarget(target);
    setShowGalleryPicker(true);
  };

  const handleGallerySelect = (url: string) => {
    const img: StudioImage = { id: Math.random().toString(36).substr(2, 9), url };
    if (galleryTarget === "model") setModelImage(img);
    else if (galleryTarget === "garment") setGarmentImage(img);
    else setImages(prev => [...prev, img].slice(0, 5));
    setShowGalleryPicker(false);
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleRun = async () => {
    const tool = TOOLS.find(t => t.id === selectedTool)!;

    if (creditBalance !== null && creditBalance < tool.credit) {
      toast.warning(`Bạn cần ${tool.credit} credits để sử dụng công cụ này.`);
      return;
    }

    if (selectedTool === AIToolType.TRY_ON) {
      if (!modelImage) { toast.warning("Vui lòng thêm ảnh người mẫu."); return; }
      if (!garmentImage) { toast.warning("Vui lòng thêm ảnh trang phục."); return; }

      try {
        resetJob();
        const { jobId } = await tryOn({
          modelImage: modelImage.file ?? modelImage.url,
          garmentImage: garmentImage.file ?? garmentImage.url,
          category: tryOnCategory,
          mode: "balanced",
        });
        setActiveJobId(jobId);
        dispatch(setBalance((creditBalance ?? 0) - tool.credit));
      } catch (err: any) {
        toast.error(err.message ?? "Không thể bắt đầu try-on.");
      }
      return;
    }

    // Other tools — currently not wired up
    toast.info(`${tool.name} sẽ sớm được cập nhật!`);
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `guai_result_${Date.now()}.png`;
    a.click();
  };

  const handleNewJob = () => {
    resetJob();
    setActiveJobId(null);
    setResultAssetId(null);
  };

  const handleSaveToArchive = async () => {
    if (!resultUrl || isSyncing) return;
    if (resultAssetId) {
      // already synced — open album picker directly
      setSaveAlbumAssetId(resultAssetId);
      return;
    }
    setIsSyncing(true);
    try {
      const asset = await syncImage({
        fileUrl: resultUrl,
        fileSize: 0,
        type: "output",
        category: "try-on",
        thumbnailUrl: resultUrl,
      });
      setResultAssetId(asset.id);
      toast.success("Đã lưu vào thư viện!");
    } catch {
      toast.error("Không thể lưu ảnh vào thư viện.");
    } finally {
      setIsSyncing(false);
    }
  };

  const selectedToolData = TOOLS.find(t => t.id === selectedTool);
  const isTryOn = selectedTool === AIToolType.TRY_ON;
  const showPanel = isProcessing || jobState === "completed" || jobState === "failed";
  const canRun = isTryOn
    ? !!modelImage && !!garmentImage && !isProcessing && jobState !== "completed"
    : images.length > 0 && !isProcessing;

  if (authLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <GuaiLoader size="lg" text="Đang xác thực..." />
      </div>
    );
  }

  return (
    <div className="w-full h-[100%] bg-background text-foreground flex flex-col overflow-hidden">
      {/* Content area: fixed height, no scroll — everything lives inside this box */}
      <div className="flex-1 min-h-0 flex items-center justify-center px-6 py-4">
        <div className="w-full max-w-5xl h-full flex min-h-0">

          {/* LEFT — Input, animates to 50% width when result is active */}
          <motion.div
            initial={false}
            animate={{ width: showPanel ? "50%" : "100%" }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="shrink-0 h-full flex flex-col min-h-0 overflow-hidden"
            style={{ paddingRight: showPanel ? 12 : 0 }}
          >
            {isTryOn ? (
              <div className="flex flex-col gap-3 h-full min-h-0">
                {/* Image grid fills all remaining height */}
                <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
                  <ImageSlot
                    label="Ảnh người mẫu"
                    sublabel="Người đứng thẳng"
                    image={modelImage}
                    onClear={() => setModelImage(null)}
                    onFileChange={(file) => setModelImage(fileToStudioImage(file))}
                    onPaste={() => handlePaste("model")}
                    onGallery={() => openGallery("model")}
                    fileRef={modelFileRef}
                  />
                  <ImageSlot
                    label="Ảnh trang phục"
                    sublabel="Sản phẩm rõ nét"
                    image={garmentImage}
                    onClear={() => setGarmentImage(null)}
                    onFileChange={(file) => setGarmentImage(fileToStudioImage(file))}
                    onPaste={() => handlePaste("garment")}
                    onGallery={() => openGallery("garment")}
                    fileRef={garmentFileRef}
                  />
                </div>
                {/* Category selector — fixed size at bottom */}
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  <span className="text-xs text-muted-foreground">Loại:</span>
                  {TRY_ON_CATEGORIES.map(c => (
                    <button
                      key={c.value}
                      onClick={() => setTryOnCategory(c.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        tryOnCategory === c.value
                          ? "bg-foreground text-background"
                          : "bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div
                className="h-full flex flex-col min-h-0"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
                  setImages(prev => [...prev, ...files.map(fileToStudioImage)].slice(0, 5));
                }}
              >
                {images.length === 0 ? (
                  <div
                    onClick={() => genericFileRef.current?.click()}
                    className="flex-1 min-h-0 rounded-3xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/30 hover:bg-card transition-all"
                  >
                    <input type="file" multiple accept="image/*" ref={genericFileRef} onChange={(e) => { if (e.target.files) { const files = Array.from(e.target.files).filter(f => f.type.startsWith("image/")); setImages(prev => [...prev, ...files.map(fileToStudioImage)].slice(0, 5)); } }} className="hidden" />
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <div className="w-14 h-18 rounded-xl bg-gradient-to-br from-orange-200 to-orange-400 shadow-lg -rotate-6" />
                      <div className="w-14 h-18 rounded-xl bg-gradient-to-br from-sky-200 to-sky-400 shadow-lg z-10" />
                      <div className="w-14 h-18 rounded-xl bg-gradient-to-br from-amber-200 to-amber-400 shadow-lg rotate-6" />
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <button onClick={(e) => { e.stopPropagation(); handlePaste("generic"); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background border border-border text-xs font-medium hover:bg-secondary transition-colors"><ClipboardPaste className="size-3.5" /> Paste</button>
                      <button onClick={(e) => { e.stopPropagation(); genericFileRef.current?.click(); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background border border-border text-xs font-medium hover:bg-secondary transition-colors"><Upload className="size-3.5" /> Upload</button>
                      <button onClick={(e) => { e.stopPropagation(); openGallery("generic"); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background border border-border text-xs font-medium hover:bg-secondary transition-colors"><GalleryHorizontal className="size-3.5" /> Gallery</button>
                    </div>
                    <p className="text-xs text-muted-foreground">or drop an image here</p>
                  </div>
                ) : (
                  <div className="flex-1 min-h-0 flex items-center justify-center gap-3 flex-wrap overflow-hidden">
                    {images.map((img, index) => (
                      <motion.div key={img.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }} className="relative group">
                        <div className="w-28 h-36 rounded-2xl overflow-hidden border border-border bg-card shadow-md">
                          <img src={img.url} alt="Input" className="w-full h-full object-cover" />
                        </div>
                        <button onClick={() => setImages(prev => prev.filter(i => i.id !== img.id))} className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"><X className="size-3" /></button>
                      </motion.div>
                    ))}
                    {images.length < 5 && (
                      <button onClick={() => genericFileRef.current?.click()} className="w-28 h-36 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:border-primary/30 hover:text-foreground transition-all">
                        <Upload className="size-5 mb-1" /><span className="text-[10px]">Thêm ảnh</span>
                      </button>
                    )}
                    <input type="file" multiple accept="image/*" ref={genericFileRef} onChange={(e) => { if (e.target.files) { const files = Array.from(e.target.files).filter(f => f.type.startsWith("image/")); setImages(prev => [...prev, ...files.map(fileToStudioImage)].slice(0, 5)); } }} className="hidden" />
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* RIGHT — Result, always in DOM, animates in */}
          <motion.div
            initial={false}
            animate={{
              width: showPanel ? "50%" : "0%",
              opacity: showPanel ? 1 : 0,
              paddingLeft: showPanel ? 12 : 0,
            }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="shrink-0 h-full flex flex-col min-h-0 overflow-hidden"
          >
            {/*
              ALL three panels stay in the DOM at all times — no mount/unmount ever.
              Shown/hidden via opacity + pointer-events only, stacked via absolute.
              This eliminates insertBefore entirely (no DOM insertion on state change).
            */}
            <div className="relative flex-1 min-h-0 w-full">

              {/* Processing */}
              <div className={`absolute inset-0 transition-opacity duration-200 ${isProcessing ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
                <ProcessingPanel active={isProcessing} />
              </div>

              {/* Completed */}
              <div className={`absolute inset-0 transition-opacity duration-200 ${jobState === "completed" && resultUrl ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
                <div className="flex flex-col h-full min-h-0 rounded-3xl border border-border bg-card overflow-hidden shadow-lg">
                  <div
                    className="flex-1 min-h-0 flex items-center justify-center bg-muted/20 overflow-hidden cursor-zoom-in"
                    onClick={() => resultUrl && setLightboxUrl(resultUrl)}
                  >
                    {resultUrl && <img src={resultUrl} alt="Kết quả AI" className="w-full h-full object-contain" />}
                  </div>
                  <div className="flex items-center gap-2 p-3 border-t border-border shrink-0 flex-wrap">
                    <button onClick={handleDownload} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-foreground text-background text-xs font-medium hover:opacity-90 transition-opacity">
                      <Download className="size-3.5" /> Tải xuống
                    </button>
                    <button onClick={() => resultUrl && setLightboxUrl(resultUrl)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary text-foreground text-xs font-medium hover:bg-secondary/70 transition-colors">
                      <Maximize2 className="size-3.5" /> Phóng to
                    </button>
                    <button onClick={handleSaveToArchive} disabled={isSyncing} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary text-foreground text-xs font-medium hover:bg-secondary/70 transition-colors disabled:opacity-50">
                      {isSyncing ? <Loader2 className="size-3.5 animate-spin" /> : <SaveIcon className="size-3.5" />}
                      {resultAssetId ? "Đã lưu" : "Lưu"}
                    </button>
                    <button onClick={() => resultAssetId && setSaveAlbumAssetId(resultAssetId)} disabled={!resultAssetId} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary text-foreground text-xs font-medium hover:bg-secondary/70 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                      <FolderHeart className="size-3.5" /> Album
                    </button>
                    <button onClick={handleNewJob} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary text-foreground text-xs font-medium hover:bg-secondary/70 transition-colors ml-auto">
                      <RefreshCw className="size-3.5" /> Thử lại
                    </button>
                  </div>
                </div>
              </div>

              {/* Failed */}
              <div className={`absolute inset-0 transition-opacity duration-200 flex items-start pt-4 ${jobState === "failed" ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
                <div className="flex items-center gap-3 w-full rounded-3xl border border-destructive/30 bg-destructive/5 p-5">
                  <AlertCircle className="size-5 text-destructive shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-destructive">Xử lý thất bại</p>
                    <p className="text-xs text-muted-foreground truncate">{jobError}</p>
                  </div>
                  <button onClick={handleNewJob} className="text-xs underline text-muted-foreground hover:text-foreground">Thử lại</button>
                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </div>

      {/* ── Bottom Tool Bar ── */}
      <div className="shrink-0 border-t border-border/40 bg-background/80 backdrop-blur-xl px-6 py-3 pb-4">
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

          <div className="flex items-center gap-3 shrink-0">
            {/* Info pills */}
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Sparkles className="size-3 text-primary" />
                {selectedToolData?.name}
              </span>
              <span className="text-border">|</span>
              <span>{selectedToolData?.credit} credits</span>
            </div>

            {/* Run button */}
            <button
              onClick={handleRun}
              disabled={!canRun}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground text-background text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-all"
            >
              <Loader2 className={`size-4 animate-spin ${isProcessing ? "" : "hidden"}`} />
              <Sparkles className={`size-4 ${isProcessing ? "hidden" : ""}`} />
              {isProcessing ? "Đang xử lý" : "Chạy"}
            </button>
          </div>
        </div>

        {/* AI Test Generate Panel */}
        <div className="mt-2 pt-2 border-t border-border/30 w-full">
          <AiGenerateTest />
        </div>
      </div>

      {/* ── Lightbox ── */}
      <Lightbox imageUrl={lightboxUrl} onClose={() => setLightboxUrl(null)} />

      {/* ── Save to Album Modal ── */}
      <SaveToAlbumModal assetId={saveAlbumAssetId} onClose={() => setSaveAlbumAssetId(null)} />

      {/* ── Gallery Picker Modal — rendered via portal to avoid insertBefore conflicts ── */}
      {isMounted && showGalleryPicker && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={() => setShowGalleryPicker(false)}>
          <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-2xl max-h-[70vh] rounded-3xl border border-border bg-card p-6 shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold flex items-center gap-2"><GalleryHorizontal className="size-4 text-primary" /> Chọn ảnh từ thư viện</h3>
              <button onClick={() => setShowGalleryPicker(false)} className="p-1 rounded-lg hover:bg-secondary text-muted-foreground"><X className="size-4" /></button>
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
                    <button key={img.id} onClick={() => handleGallerySelect(img.url)} className="relative aspect-square rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all group">
                      <img src={img.url} alt="Gallery" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-colors flex items-center justify-center">
                        <Check className="size-6 text-white opacity-0 group-hover:opacity-100" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// ─── ProcessingPanel component ───────────────────────────────────────────────

// 5 messages, đổi tại giây 5 / 10 / 20 / 30
const LOADING_MESSAGES = [
  "Đang tải ảnh lên máy chủ...",
  "Fashn AI đang phân tích trang phục... 🧐",
  "AI đang cật lực render từng pixel một 💪",
  "Xử lý lâu hơn bình thường, nhưng sẽ xứng đáng! ✨",
  "Vẫn đang làm, không bỏ cuộc đâu nhé! Chờ tí... 🙏",
];
const TIMING_MS = [5_000, 10_000, 20_000, 30_000];

function ProcessingPanel({ active }: { active: boolean }) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (!active) {
      setMsgIndex(0);
      return;
    }
    const timers = TIMING_MS.map((delay, i) =>
      setTimeout(() => setMsgIndex(i + 1), delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [active]);

  return (
    <div className="flex flex-col items-center justify-center gap-6 rounded-3xl border border-border bg-card h-full min-h-0">
      <GuaiLoader size="lg" />
      {/* Roll-down ticker: old text exits downward, new text enters from above */}
      <div className="overflow-hidden" style={{ height: "1.4rem" }}>
        <AnimatePresence mode="wait">
          <motion.p
            key={msgIndex}
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            className="text-sm font-medium text-center whitespace-nowrap px-6"
          >
            {LOADING_MESSAGES[msgIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── ImageSlot component ──────────────────────────────────────────────────────

interface ImageSlotProps {
  label: string;
  sublabel: string;
  image: StudioImage | null;
  onClear: () => void;
  onFileChange: (file: File) => void;
  onPaste: () => void;
  onGallery: () => void;
  fileRef: React.RefObject<HTMLInputElement | null>;
}

function ImageSlot({ label, sublabel, image, onClear, onFileChange, onPaste, onGallery, fileRef }: ImageSlotProps) {
  return (
    <div className="flex flex-col gap-2 min-h-0 h-full">
      <div className="flex items-center justify-between shrink-0">
        <span className="text-xs font-semibold">{label}</span>
        <span className="text-[10px] text-muted-foreground">{sublabel}</span>
      </div>

      {/* Both panels always in DOM — toggled via opacity/pointer-events, never mounted/unmounted */}
      <div className="relative flex-1 min-h-0 group">

        {/* Image display — border hugs the image's natural aspect ratio */}
        <div className={`absolute inset-0 flex items-center justify-center p-2 transition-opacity duration-150 ${image ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
          <img
            src={image?.url ?? undefined}
            alt={label}
            className="max-w-full max-h-full rounded-2xl border border-border shadow-md"
          />
          <button
            onClick={onClear}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-background/80 backdrop-blur-sm text-foreground opacity-0 group-hover:opacity-100 transition-opacity shadow"
          >
            <X className="size-3.5" />
          </button>
        </div>

        {/* Upload area */}
        <div
          onClick={() => fileRef.current?.click()}
          className={`absolute inset-0 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/30 hover:bg-card transition-all gap-2 ${image ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"}`}
        >
          <input
            type="file" accept="image/*"
            ref={fileRef}
            onChange={(e) => { if (e.target.files?.[0]) onFileChange(e.target.files[0]); }}
            className="hidden"
          />
          <Upload className="size-5 text-muted-foreground" />
          <div className="flex items-center gap-1.5">
            <button onClick={(e) => { e.stopPropagation(); onPaste(); }} className="px-2 py-1 rounded-md bg-background border border-border text-[10px] hover:bg-secondary transition-colors">
              <ClipboardPaste className="size-3 inline mr-1" />Paste
            </button>
            <button onClick={(e) => { e.stopPropagation(); onGallery(); }} className="px-2 py-1 rounded-md bg-background border border-border text-[10px] hover:bg-secondary transition-colors">
              <GalleryHorizontal className="size-3 inline mr-1" />Gallery
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
