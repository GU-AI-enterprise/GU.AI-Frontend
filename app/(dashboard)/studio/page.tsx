"use client";

import React, { Suspense, useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { selectCreditBalance, setBalance } from "@/features/credit/creditSlice";
import {
  Sparkles, ImageIcon, GalleryHorizontal,
  ChevronRight, ChevronLeft, Loader2,
  Download, RefreshCw, AlertCircle, FolderHeart,
  BookOpen, Check, X, Maximize2, SplitSquareHorizontal,
} from "lucide-react";
import { ToolGuideModal } from "@/components/shared/tool-guide-modal";
import { TOOL_GUIDES } from "@/constants/toolGuides";
import GuaiLoader from "@/components/shared/guai-loader";
import { ToolContextBar } from "./components/ToolContextBar";
import { Lightbox } from "@/components/shared/lightbox";
import { SaveToAlbumModal } from "@/components/shared/save-to-album-modal";
import { supabase } from "@/lib/supabase";
import { getImages } from "@/features/archive/imageService";
import { AIToolType } from "@/constants/ai";
import { toast } from "sonner";
import {
  tryOn, tryOnMax, productToModel, editImage,
  modelSwap, modelCreate, imageToVideo, reframe,
  type TryOnCategory,
} from "@/features/studio/studioService";
import { useAIJob } from "@/hooks/useAIJob";

import { TOOLS, TOOL_SLUG, SLUG_TO_TOOL } from "./constants";
import { computeTryOnCost, computeEditCost, computeModelCreateCost, computeVideoCost, computeReframeCost } from "./helpers";
import type {
  StudioImage, TryOnModel, TryOnResolution,
  GenResolution, GenMode, FaceRefMode, VideoDuration, VideoResolution,
} from "./types";

import { ProcessingPanel } from "./components/ProcessingPanel";
import { ComparisonSlider } from "./components/ComparisonSlider";
import { TryOnPanel } from "./components/TryOnPanel";
import { ProductToModelPanel } from "./components/ProductToModelPanel";
import { ModelSwapPanel } from "./components/ModelSwapPanel";
import { FaceSwapPanel } from "./components/FaceSwapPanel";
import { EditPanel } from "./components/EditPanel";
import { GenericPanel } from "./components/GenericPanel";

// ─── Inner page (needs Suspense because of useSearchParams) ───────────────────

function StudioPageInner() {
  const router        = useRouter();
  const searchParams  = useSearchParams();
  const dispatch      = useAppDispatch();
  const creditBalance = useAppSelector(selectCreditBalance);
  const [authLoading, setAuthLoading] = useState(true);

  // Derive selectedTool from ?tool= search param
  const toolSlug     = searchParams.get("tool") ?? "try-on";
  const selectedTool: AIToolType = SLUG_TO_TOOL[toolSlug] ?? AIToolType.TRY_ON;

  const switchTool = (id: AIToolType) => router.push(`/studio?tool=${TOOL_SLUG[id]}`);

  // ── Try-On state ──────────────────────────────────────────────────────────
  const [toModelImage,  setToModelImage]  = useState<StudioImage | null>(null);
  const [toGarment,     setToGarment]     = useState<StudioImage | null>(null);
  const [toCategory,    setToCategory]    = useState<TryOnCategory>("auto");
  const [toModel,       setToModel]       = useState<TryOnModel>("v1.6");
  const [toResolution,  setToResolution]  = useState<TryOnResolution>("1k");
  const [toHovered,     setToHovered]     = useState<TryOnModel | null>(null);

  // ── Product to Model state ────────────────────────────────────────────────
  const [p2mProduct,    setP2mProduct]    = useState<StudioImage | null>(null);
  const [p2mPromptImg,  setP2mPromptImg]  = useState<StudioImage | null>(null);
  const [p2mFaceRef,    setP2mFaceRef]    = useState<StudioImage | null>(null);
  const [p2mBgRef,      setP2mBgRef]      = useState<StudioImage | null>(null);
  const [p2mPrompt,     setP2mPrompt]     = useState("");
  const [p2mAspect,     setP2mAspect]     = useState("3:4");
  const [p2mRes,        setP2mRes]        = useState<GenResolution>("1k");
  const [p2mGenMode,    setP2mGenMode]    = useState<GenMode>("balanced");
  const [p2mFaceMode,   setP2mFaceMode]   = useState<FaceRefMode>("match_reference");

  // ── Model Swap state ──────────────────────────────────────────────────────
  const [msImage,       setMsImage]       = useState<StudioImage | null>(null);
  const [msFaceRef,     setMsFaceRef]     = useState<StudioImage | null>(null);
  const [msPrompt,      setMsPrompt]      = useState("");
  const [msRes,         setMsRes]         = useState<GenResolution>("1k");
  const [msGenMode,     setMsGenMode]     = useState<GenMode>("balanced");
  const [msFaceMode,    setMsFaceMode]    = useState<FaceRefMode>("match_reference");

  // ── Face Swap state ───────────────────────────────────────────────────────
  const [fsModelImage,  setFsModelImage]  = useState<StudioImage | null>(null);
  const [fsFaceRef,     setFsFaceRef]     = useState<StudioImage | null>(null);
  const [fsRes,         setFsRes]         = useState<GenResolution>("1k");
  const [fsFaceMode,    setFsFaceMode]    = useState<FaceRefMode>("match_reference");

  // ── Edit state ────────────────────────────────────────────────────────────
  const [editSource,    setEditSource]    = useState<StudioImage | null>(null);
  const [editMask,      setEditMask]      = useState<StudioImage | null>(null);
  const [editContext,   setEditContext]   = useState<StudioImage | null>(null);
  const [editRes,       setEditRes]       = useState<GenResolution>("1k");
  const [editGenMode,   setEditGenMode]   = useState<GenMode>("balanced");
  const [editNumImages, setEditNumImages] = useState(1);
  const [editSeed,      setEditSeed]      = useState("");

  // ── Create Model state ────────────────────────────────────────────────────
  const [createRes,       setCreateRes]       = useState<GenResolution>("1k");
  const [createGenMode,   setCreateGenMode]   = useState<GenMode>("balanced");
  const [createNumImages, setCreateNumImages] = useState(1);
  const [createSeed,      setCreateSeed]      = useState("");

  // ── Reframe state ─────────────────────────────────────────────────────────
  const [reframeAspect,    setReframeAspect]    = useState("1:1");
  const [reframeRes,       setReframeRes]       = useState<GenResolution>("1k");
  const [reframeGenMode,   setReframeGenMode]   = useState<GenMode>("balanced");
  const [reframeNumImages, setReframeNumImages] = useState(1);
  const [reframeSeed,      setReframeSeed]      = useState("");

  // ── Upscale state ──────────────────────────────────────────────────────────
  const [upscaleScale,  setUpscaleScale]  = useState(2);

  // ── Generic state (Create Model / Image to Video) ─────────────────────────
  const [images,        setImages]        = useState<StudioImage[]>([]);
  const [genericPrompt, setGenericPrompt] = useState("");
  const [videoDuration, setVideoDuration] = useState<VideoDuration>(5);
  const [videoRes,      setVideoRes]      = useState<VideoResolution>("720p");

  // ── UI state ──────────────────────────────────────────────────────────────
  const [guideToolId,      setGuideToolId]      = useState<string | null>(null);
  const [showGallery,      setShowGallery]       = useState(false);
  const [galleryImages,    setGalleryImages]     = useState<{ id: string; url: string }[]>([]);
  const [lightboxUrl,      setLightboxUrl]       = useState<string | null>(null);
  const [saveAlbumAssetId, setSaveAlbumAssetId]  = useState<string | null>(null);
  const [isMounted,        setIsMounted]         = useState(false);
  const [isMobile,         setIsMobile]          = useState(false);
  const [canScrollLeft,    setCanScrollLeft]     = useState(false);
  const [canScrollRight,   setCanScrollRight]    = useState(false);
  const [showComparison,   setShowComparison]    = useState(false);

  const galleryCallbackRef = useRef<((url: string) => void) | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // ── AI job ────────────────────────────────────────────────────────────────
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const {
    state: jobState, imageUrl: resultUrl, assetId: resultAssetId,
    error: jobError, isProcessing, reset: resetJob,
  } = useAIJob(activeJobId);

  // ── Auth ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    let alive = true;
    const init = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!alive) return;
        if (error || !session?.user) { router.push("/login"); return; }
        setAuthLoading(false);
        fetchGallery();
      } catch {
        if (alive) router.push("/login");
      }
    };
    init();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!alive) return;
      if (event === "SIGNED_OUT" || !session?.user) router.push("/login");
    });
    return () => { alive = false; subscription.unsubscribe(); };
  }, [router]);

  // ── Mount / mobile ────────────────────────────────────────────────────────
  useEffect(() => {
    setIsMounted(true);
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ── Toolbar scroll ────────────────────────────────────────────────────────
  const checkScroll = useCallback(() => {
    const el = toolbarRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = toolbarRef.current;
    if (!el) return;
    const rafId = requestAnimationFrame(checkScroll);
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => { cancelAnimationFrame(rafId); ro.disconnect(); };
  }, [checkScroll]);

  // Re-check scroll after auth resolves (toolbar mounts after authLoading → false)
  useEffect(() => {
    if (!authLoading) {
      const t = setTimeout(checkScroll, 80);
      return () => clearTimeout(t);
    }
  }, [authLoading, checkScroll]);

  const scrollToolbar = (dir: "left" | "right") => {
    toolbarRef.current?.scrollBy({ left: dir === "left" ? -160 : 160, behavior: "smooth" });
    setTimeout(checkScroll, 320);
  };

  // ── Reset state on tool switch ────────────────────────────────────────────
  useEffect(() => {
    resetJob();
    setActiveJobId(null);
    setToModelImage(null); setToGarment(null);
    setP2mProduct(null); setP2mPromptImg(null); setP2mFaceRef(null); setP2mBgRef(null); setP2mPrompt("");
    setMsImage(null); setMsFaceRef(null); setMsPrompt("");
    setFsModelImage(null); setFsFaceRef(null);
    setEditSource(null); setEditMask(null); setEditContext(null); setEditRes("1k"); setEditGenMode("balanced"); setEditNumImages(1); setEditSeed("");
    setCreateRes("1k"); setCreateGenMode("balanced"); setCreateNumImages(1); setCreateSeed("");
    setReframeAspect("1:1"); setReframeRes("1k"); setReframeGenMode("balanced"); setReframeNumImages(1); setReframeSeed("");
    setUpscaleScale(2);
    setImages([]); setGenericPrompt("");
  }, [selectedTool]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Job status feedback ───────────────────────────────────────────────────
  useEffect(() => {
    if (jobState === "completed") toast.success("Xử lý thành công!");
    else if (jobState === "failed" && jobError) toast.error(jobError);
  }, [jobState, jobError]);

  // ── Gallery ───────────────────────────────────────────────────────────────
  const fetchGallery = async () => {
    try {
      const imgs = await getImages();
      setGalleryImages(imgs.map(i => ({ id: i.id, url: i.url })));
    } catch {}
  };

  const openGallery = useCallback((cb: (url: string) => void) => {
    galleryCallbackRef.current = cb;
    setShowGallery(true);
  }, []);

  const handleGallerySelect = (url: string) => {
    galleryCallbackRef.current?.(url);
    setShowGallery(false);
  };

  // ── Paste ─────────────────────────────────────────────────────────────────
  const handlePaste = useCallback(async (onImage: (file: File) => void) => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imageType = item.types.find(t => t.startsWith("image/"));
        if (imageType) {
          const blob = await item.getType(imageType);
          onImage(new File([blob], `pasted-${Date.now()}.png`, { type: imageType }));
          return;
        }
      }
      toast.warning("Không tìm thấy ảnh trong clipboard.");
    } catch {
      toast.error("Trình duyệt không hỗ trợ paste ảnh.");
    }
  }, []);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleRun = async () => {
    setShowComparison(false);
    if (selectedTool === AIToolType.TRY_ON) {
      if (!toModelImage)  { toast.warning("Vui lòng thêm ảnh người mẫu."); return; }
      if (!toGarment)     { toast.warning("Vui lòng thêm ảnh trang phục."); return; }
      const cost = computeTryOnCost(toModel, toCategory, toResolution);
      if (creditBalance !== null && creditBalance < cost) {
        toast.warning(`Bạn cần ${cost} credits để chạy ${toModel === "max" ? "Try-On Max" : "Try-On v1.6"}.`);
        return;
      }
      resetJob();
      try {
        let jobId: string;
        if (toModel === "max") {
          const r = await tryOnMax({ modelImage: toModelImage.file ?? toModelImage.url, garmentImage: toGarment.file ?? toGarment.url, resolution: toResolution, generationMode: "balanced" });
          jobId = r.jobId;
        } else {
          const r = await tryOn({ modelImage: toModelImage.file ?? toModelImage.url, garmentImage: toGarment.file ?? toGarment.url, category: toCategory, mode: "balanced" });
          jobId = r.jobId;
        }
        setActiveJobId(jobId);
        dispatch(setBalance((creditBalance ?? 0) - cost));
      } catch (err: any) {
        toast.error(err.message ?? "Không thể bắt đầu try-on.");
      }
      return;
    }

    if (creditBalance !== null && creditBalance < currentCost) {
      toast.warning(`Bạn cần ${currentCost} credits.`); return;
    }

    const submit = async (jobPromise: Promise<{ jobId: string }>) => {
      resetJob();
      try {
        const { jobId } = await jobPromise;
        setActiveJobId(jobId);
        dispatch(setBalance((creditBalance ?? 0) - currentCost));
      } catch (err: any) {
        toast.error(err.message ?? "Không thể bắt đầu xử lý.");
      }
    };

    if (selectedTool === AIToolType.PRODUCT_TO_MODEL) {
      if (!p2mProduct) { toast.warning("Vui lòng thêm ảnh sản phẩm."); return; }
      return submit(productToModel({
        productImage:        p2mProduct.file     ?? p2mProduct.url,
        imagePrompt:         p2mPromptImg ? (p2mPromptImg.file ?? p2mPromptImg.url) : undefined,
        faceReference:       p2mFaceRef   ? (p2mFaceRef.file   ?? p2mFaceRef.url)   : undefined,
        faceReferenceMode:   p2mFaceRef ? p2mFaceMode : undefined,
        backgroundReference: p2mBgRef     ? (p2mBgRef.file     ?? p2mBgRef.url)     : undefined,
        prompt: p2mPrompt || undefined, aspectRatio: p2mAspect,
        resolution: p2mRes, generationMode: p2mGenMode,
      }));
    }

    if (selectedTool === AIToolType.MODEL_SWAP) {
      if (!msImage) { toast.warning("Vui lòng thêm ảnh thời trang."); return; }
      return submit(modelSwap({
        modelImage:        msImage.file    ?? msImage.url,
        faceReference:     msFaceRef ? (msFaceRef.file ?? msFaceRef.url) : undefined,
        faceReferenceMode: msFaceRef ? msFaceMode : undefined,
        prompt:            msPrompt || undefined,
        resolution:        msRes,
        generationMode:    msGenMode,
      }));
    }

    if (selectedTool === AIToolType.FACE_SWAP) {
      if (!fsModelImage) { toast.warning("Vui lòng thêm ảnh thời trang."); return; }
      if (!fsFaceRef)    { toast.warning("Vui lòng thêm ảnh khuôn mặt cần swap."); return; }
      return submit(modelSwap({
        modelImage:        fsModelImage.file ?? fsModelImage.url,
        faceReference:     fsFaceRef.file    ?? fsFaceRef.url,
        faceReferenceMode: fsFaceMode,
        resolution:        fsRes,
      }));
    }

    if (selectedTool === AIToolType.EDIT) {
      if (!editSource)           { toast.warning("Vui lòng thêm ảnh cần chỉnh sửa."); return; }
      if (!genericPrompt.trim()) { toast.warning("Vui lòng nhập mô tả thay đổi."); return; }
      const parsedSeed = editSeed.trim() ? parseInt(editSeed.trim()) : undefined;
      return submit(editImage({
        image:          editSource.file ?? editSource.url,
        prompt:         genericPrompt,
        mask:           editMask    ? (editMask.file    ?? editMask.url)    : undefined,
        imageContext:   editContext ? (editContext.file ?? editContext.url) : undefined,
        resolution:     editRes,
        generationMode: editGenMode,
        numImages:      editNumImages,
        seed:           parsedSeed,
      }));
    }

    const img0   = images[0];
    const imgSrc = img0?.file ?? img0?.url ?? "";

    if (selectedTool === AIToolType.CREATE_MODEL) {
      if (!genericPrompt.trim()) { toast.warning("Vui lòng nhập mô tả model muốn tạo."); return; }
      const parsedCreateSeed = createSeed.trim() ? parseInt(createSeed.trim()) : undefined;
      return submit(modelCreate({
        prompt: genericPrompt,
        imageReference: imgSrc || undefined,
        resolution: createRes,
        generationMode: createGenMode,
        numImages: createNumImages,
        seed: parsedCreateSeed,
      }));
    }

    if (selectedTool === AIToolType.IMAGE_TO_VIDEO) {
      if (!imgSrc) { toast.warning("Vui lòng thêm ảnh nguồn."); return; }
      return submit(imageToVideo({ image: img0.file ?? img0.url, prompt: genericPrompt || undefined, duration: videoDuration, resolution: videoRes }));
    }

    if (selectedTool === AIToolType.REFRAME) {
      if (!imgSrc) { toast.warning("Vui lòng thêm ảnh nguồn."); return; }
      const parsedReframeSeed = reframeSeed.trim() ? parseInt(reframeSeed.trim()) : undefined;
      return submit(reframe({
        image:          img0.file ?? img0.url,
        aspectRatio:    reframeAspect,
        resolution:     reframeRes,
        generationMode: reframeGenMode,
        numImages:      reframeNumImages,
        seed:           parsedReframeSeed,
      }));
    }

    const toolData = TOOLS.find(t => t.id === selectedTool);
    toast.info(`${toolData?.name ?? selectedTool} sẽ sớm được cập nhật!`);
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const isTryOn = selectedTool === AIToolType.TRY_ON;
  const isP2M   = selectedTool === AIToolType.PRODUCT_TO_MODEL;
  const isMS    = selectedTool === AIToolType.MODEL_SWAP;
  const isFS    = selectedTool === AIToolType.FACE_SWAP;
  const isEdit  = selectedTool === AIToolType.EDIT;
  const isVideo = selectedTool === AIToolType.IMAGE_TO_VIDEO;

  // "before" image for the comparison slider
  const beforeUrl = (() => {
    if (isVideo || !resultUrl) return null;
    switch (selectedTool) {
      case AIToolType.TRY_ON:           return toModelImage?.url  ?? null;
      case AIToolType.PRODUCT_TO_MODEL: return p2mProduct?.url    ?? null;
      case AIToolType.MODEL_SWAP:       return msImage?.url       ?? null;
      case AIToolType.FACE_SWAP:        return fsModelImage?.url  ?? null;
      case AIToolType.EDIT:             return editSource?.url     ?? null;
      default:                          return images[0]?.url     ?? null;
    }
  })();

  const showPanel = isProcessing || jobState === "completed" || jobState === "failed";
  const toolData  = TOOLS.find(t => t.id === selectedTool);
  const isCreateModel = selectedTool === AIToolType.CREATE_MODEL;
  const isReframe     = selectedTool === AIToolType.REFRAME;
  const currentCost = isTryOn
    ? computeTryOnCost(toModel, toCategory, toResolution)
    : isEdit
    ? computeEditCost(editGenMode, editRes, editNumImages)
    : isCreateModel
    ? computeModelCreateCost(createGenMode, createRes, createNumImages)
    : isVideo
    ? computeVideoCost(videoDuration, videoRes)
    : isReframe
    ? computeReframeCost(reframeGenMode, reframeRes, reframeNumImages)
    : (toolData?.credit ?? 0);

  const canRun = isProcessing ? false
    : isTryOn ? (!!toModelImage && !!toGarment)
    : isP2M   ? !!p2mProduct
    : isMS    ? !!msImage
    : isFS    ? (!!fsModelImage && !!fsFaceRef)
    : isEdit  ? (!!editSource && !!genericPrompt.trim())
    : selectedTool === AIToolType.CREATE_MODEL ? !!genericPrompt.trim()
    : images.length > 0;

  const leftW  = showPanel ? (isMobile ? "0%"   : "50%") : "100%";
  const rightW = showPanel ? (isMobile ? "100%" : "50%") : "0%";

  if (authLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <GuaiLoader size="lg" text="Đang xác thực..." />
      </div>
    );
  }

  return (
    <div className="w-full h-[100%] bg-background text-foreground flex flex-col overflow-hidden">

      {/* ── Content area ── */}
      <div className="flex-1 min-h-0 flex items-center justify-center px-3 py-3 sm:px-6 sm:py-4">
        <div className="w-full max-w-5xl h-full flex min-h-0">

          {/* LEFT — Input */}
          <motion.div
            initial={false}
            animate={{ width: leftW }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="shrink-0 h-full flex flex-col min-h-0 overflow-hidden"
            style={{ paddingRight: showPanel && !isMobile ? 12 : 0 }}
          >
            {isTryOn ? (
              <TryOnPanel
                modelImage={toModelImage} garmentImage={toGarment}
                onModelImageChange={setToModelImage} onGarmentImageChange={setToGarment}
                onPaste={handlePaste} openGallery={openGallery}
              />
            ) : isP2M ? (
              <ProductToModelPanel
                product={p2mProduct} imagePrompt={p2mPromptImg}
                faceRef={p2mFaceRef} bgRef={p2mBgRef}
                onProductChange={setP2mProduct} onImagePromptChange={setP2mPromptImg}
                onFaceRefChange={setP2mFaceRef} onBgRefChange={setP2mBgRef}
                onPaste={handlePaste} openGallery={openGallery}
              />
            ) : isMS ? (
              <ModelSwapPanel
                modelImage={msImage} faceRef={msFaceRef}
                onModelImageChange={setMsImage} onFaceRefChange={setMsFaceRef}
                onPaste={handlePaste} openGallery={openGallery}
              />
            ) : isFS ? (
              <FaceSwapPanel
                modelImage={fsModelImage} faceRef={fsFaceRef}
                onModelImageChange={setFsModelImage} onFaceRefChange={setFsFaceRef}
                onPaste={handlePaste} openGallery={openGallery}
              />
            ) : isEdit ? (
              <EditPanel
                source={editSource} mask={editMask} imageContext={editContext}
                onSourceChange={setEditSource} onMaskChange={setEditMask} onImageContextChange={setEditContext}
                onPaste={handlePaste} openGallery={openGallery}
              />
            ) : (
              <GenericPanel
                images={images}
                onImagesChange={setImages}
                onPaste={handlePaste} openGallery={openGallery}
              />
            )}
          </motion.div>

          {/* RIGHT — Result */}
          <motion.div
            initial={false}
            animate={{ width: rightW, opacity: showPanel ? 1 : 0, paddingLeft: showPanel && !isMobile ? 12 : 0 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="shrink-0 h-full flex flex-col min-h-0 overflow-hidden"
          >
            <div className="relative flex-1 min-h-0 w-full">

              <div className={`absolute inset-0 transition-opacity duration-200 ${isProcessing ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
                <ProcessingPanel active={isProcessing} />
              </div>

              <div className={`absolute inset-0 transition-opacity duration-200 ${jobState === "completed" && resultUrl ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
                <div className="flex flex-col h-full min-h-0 rounded-3xl border border-border bg-card overflow-hidden shadow-lg">
                  <div className="flex-1 min-h-0 bg-muted/20 overflow-hidden relative">
                    {resultUrl && (
                      showComparison && beforeUrl
                        ? <ComparisonSlider beforeUrl={beforeUrl} afterUrl={resultUrl} />
                        : <div
                            className={`w-full h-full flex items-center justify-center ${isVideo ? "" : "cursor-zoom-in"}`}
                            onClick={() => !isVideo && resultUrl && setLightboxUrl(resultUrl)}
                          >
                            {isVideo
                              ? <video src={resultUrl} controls className="w-full h-full object-contain" />
                              : <img src={resultUrl} alt="Kết quả AI" className="w-full h-full object-contain" />
                            }
                          </div>
                    )}
                    {/* Download icon — top right of image */}
                    {resultUrl && (
                      <button
                        onClick={() => { const a = document.createElement("a"); a.href = resultUrl!; a.download = `guai_result_${Date.now()}.${isVideo ? "mp4" : "png"}`; a.click(); }}
                        className="cursor-pointer absolute top-3 right-3 flex items-center justify-center size-8 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-sm hover:bg-background transition-colors"
                        title="Tải xuống"
                      >
                        <Download className="size-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 p-3 border-t border-border shrink-0 flex-wrap">
                    {isMobile && (
                      <button onClick={() => { resetJob(); setActiveJobId(null); }} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary text-foreground text-xs font-medium hover:bg-secondary/70 transition-colors">
                        <ChevronLeft className="size-3.5" /> Nhập ảnh
                      </button>
                    )}
                    {!isVideo && beforeUrl && (
                      <button
                        onClick={() => setShowComparison(v => !v)}
                        className={`cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                          showComparison
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "bg-secondary text-foreground hover:bg-secondary/70"
                        }`}
                      >
                        <SplitSquareHorizontal className="size-3.5" /> So sánh
                      </button>
                    )}
                    <button
                      onClick={() => resultAssetId && setSaveAlbumAssetId(resultAssetId)}
                      disabled={!resultAssetId}
                      title={resultAssetId ? "Lưu vào album" : "Đang lưu vào thư viện..."}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary text-foreground text-xs font-medium hover:bg-secondary/70 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <FolderHeart className="size-3.5" />
                      {resultAssetId ? "Lưu vào Album" : "Đang lưu..."}
                    </button>
                    {!isMobile && (
                      <button onClick={() => { resetJob(); setActiveJobId(null); }} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary text-foreground text-xs font-medium hover:bg-secondary/70 transition-colors ml-auto">
                        <RefreshCw className="size-3.5" /> Thử lại
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className={`absolute inset-0 transition-opacity duration-200 flex items-start pt-4 ${jobState === "failed" ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
                <div className="flex items-center gap-3 w-full rounded-3xl border border-destructive/30 bg-destructive/5 p-5">
                  <AlertCircle className="size-5 text-destructive shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-destructive">Xử lý thất bại</p>
                    <p className="text-xs text-muted-foreground truncate">{jobError}</p>
                  </div>
                  <button onClick={() => { resetJob(); setActiveJobId(null); }} className="text-xs underline text-muted-foreground hover:text-foreground">Thử lại</button>
                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </div>

      {/* ── Bottom Tool Bar ── */}
      <div className="shrink-0 border-t border-border/40 bg-background/80 backdrop-blur-xl px-3 py-2.5 sm:px-6 sm:py-3 sm:pb-4">
        <div className="flex items-center justify-between gap-4">

          <button
            onClick={() => scrollToolbar("left")}
            className={`shrink-0 flex items-center justify-center size-7 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-all ${canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            <ChevronLeft className="size-3.5" />
          </button>

          <div
            ref={toolbarRef}
            onScroll={checkScroll}
            className="flex-1 flex items-center gap-1 overflow-x-auto"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
          >
            {TOOLS.map((tool) => (
              <button
                key={tool.id}
                onClick={() => switchTool(tool.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedTool === tool.id
                    ? "bg-foreground text-background"
                    : "bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <tool.Icon className="size-4" />
                {tool.name}
              </button>
            ))}
          </div>

          <button
            onClick={() => scrollToolbar("right")}
            className={`shrink-0 flex items-center justify-center size-7 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-all ${canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            <ChevronRight className="size-3.5" />
          </button>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Sparkles className="size-3 text-primary" />
                {isTryOn ? (toModel === "max" ? "Try-On Max" : "Try-On v1.6") : toolData?.name}
              </span>
              <span className="text-border">|</span>
              <span className="font-semibold text-foreground">{currentCost} credit{currentCost > 1 ? "s" : ""}</span>
            </div>

            <button
              onClick={() => setGuideToolId(selectedTool)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary/60 text-muted-foreground text-xs font-medium hover:text-foreground hover:bg-secondary transition-colors"
              title="Xem hướng dẫn"
            >
              <BookOpen className="size-3.5" /> Hướng dẫn
            </button>

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

        <div className="mt-2 pt-2 border-t border-border/30 w-full">
          <ToolContextBar
            selectedTool={selectedTool}
            toCategory={toCategory} toModel={toModel} toResolution={toResolution} toHovered={toHovered}
            onToCategoryChange={setToCategory} onToModelChange={setToModel}
            onToResolutionChange={setToResolution} onToHoveredChange={setToHovered}
            p2mPrompt={p2mPrompt} p2mAspect={p2mAspect} p2mRes={p2mRes}
            p2mGenMode={p2mGenMode} p2mFaceMode={p2mFaceMode} p2mHasFaceRef={!!p2mFaceRef}
            onP2mPromptChange={setP2mPrompt} onP2mAspectChange={setP2mAspect}
            onP2mResChange={setP2mRes} onP2mGenModeChange={setP2mGenMode}
            onP2mFaceModeChange={setP2mFaceMode}
            msPrompt={msPrompt} msRes={msRes} msGenMode={msGenMode}
            msFaceMode={msFaceMode} msHasFaceRef={!!msFaceRef}
            onMsPromptChange={setMsPrompt} onMsResChange={setMsRes}
            onMsGenModeChange={setMsGenMode} onMsFaceModeChange={setMsFaceMode}
            fsRes={fsRes} fsFaceMode={fsFaceMode}
            onFsResChange={setFsRes} onFsFaceModeChange={setFsFaceMode}
            editRes={editRes} editGenMode={editGenMode} editNumImages={editNumImages} editSeed={editSeed}
            onEditResChange={setEditRes} onEditGenModeChange={setEditGenMode}
            onEditNumImagesChange={setEditNumImages} onEditSeedChange={setEditSeed}
            createRes={createRes} createGenMode={createGenMode} createNumImages={createNumImages} createSeed={createSeed}
            onCreateResChange={setCreateRes} onCreateGenModeChange={setCreateGenMode}
            onCreateNumImagesChange={setCreateNumImages} onCreateSeedChange={setCreateSeed}
            genericPrompt={genericPrompt} videoDuration={videoDuration} videoRes={videoRes}
            onGenericPromptChange={setGenericPrompt}
            onVideoDurationChange={setVideoDuration} onVideoResChange={setVideoRes}
            reframeAspect={reframeAspect} reframeRes={reframeRes} reframeGenMode={reframeGenMode}
            reframeNumImages={reframeNumImages} reframeSeed={reframeSeed}
            onReframeAspectChange={setReframeAspect} onReframeResChange={setReframeRes}
            onReframeGenModeChange={setReframeGenMode} onReframeNumImagesChange={setReframeNumImages}
            onReframeSeedChange={setReframeSeed}
            upscaleScale={upscaleScale} onUpscaleScaleChange={setUpscaleScale}
          />
        </div>
      </div>

      {/* ── Modals & overlays ── */}
      <Lightbox imageUrl={lightboxUrl} onClose={() => setLightboxUrl(null)} />
      <SaveToAlbumModal assetId={saveAlbumAssetId} onClose={() => setSaveAlbumAssetId(null)} />
      <ToolGuideModal
        guide={guideToolId ? (TOOL_GUIDES[guideToolId] ?? null) : null}
        onClose={() => setGuideToolId(null)}
      />

      {isMounted && showGallery && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          onClick={() => setShowGallery(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl max-h-[70vh] rounded-3xl border border-border bg-card p-6 shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <GalleryHorizontal className="size-4 text-primary" /> Chọn ảnh từ thư viện
              </h3>
              <button onClick={() => setShowGallery(false)} className="p-1 rounded-lg hover:bg-secondary text-muted-foreground">
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

// ─── Page export (wraps inner in Suspense for useSearchParams) ────────────────

export default function StudioPage() {
  return (
    <Suspense>
      <StudioPageInner />
    </Suspense>
  );
}
