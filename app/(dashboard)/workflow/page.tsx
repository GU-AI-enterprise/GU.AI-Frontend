"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Sparkles, Upload, X, Loader2, Check,
  AlertCircle, ImageIcon, Download, FolderHeart, ArrowLeft,
  Workflow, Zap,
} from "lucide-react";
import { apiClient } from "@/lib/apiFetch";
import { uploadFile, getImages, type DBAsset } from "@/features/archive/imageService";
import { useAppSelector } from "@/store/hooks";
import { selectCreditBalance } from "@/features/credit/creditSlice";
import { toast } from "sonner";

// ── Constants ──────────────────────────────────────────────────────────────────

const TOOL_LABELS: Record<string, string> = {
  remove_background: "Xóa nền",
  product_to_model:  "Tạo người mẫu",
  try_on:            "Mặc thử",
  try_on_max:        "Mặc thử (Max)",
  edit_image:        "Chỉnh sửa ảnh",
  reframe:           "Đóng khung",
  face_to_model:     "Tạo mẫu từ khuôn mặt",
  model_create:      "Tạo người mẫu AI",
  model_swap:        "Đổi người mẫu",
  image_to_video:    "Ảnh sang Video",
};

const TOOL_CREDIT: Record<string, number> = {
  remove_background: 2,
  product_to_model:  4,
  try_on:            2,
  try_on_max:        10,
  edit_image:        4,
  reframe:           4,
  face_to_model:     4,
  model_create:      4,
  model_swap:        4,
  image_to_video:    12,
};

const IMAGE_SLOTS = [
  { key: "product_image", label: "Sản phẩm / trang phục", hint: "Áo, quần, váy..." },
  { key: "model_image",   label: "Người mẫu", hint: "Ảnh người mặc thử" },
  { key: "face_image",    label: "Khuôn mặt", hint: "Tham chiếu khuôn mặt" },
];

const EXAMPLE_PROMPTS = [
  "Xóa nền ảnh sản phẩm rồi đặt lên người mẫu AI",
  "Tạo người mẫu từ khuôn mặt rồi mặc thử trang phục",
  "Mặc thử trang phục lên người mẫu đã cung cấp",
  "Đặt sản phẩm lên người mẫu rồi chuyển thành video",
];

type PageState = "setup" | "planning" | "plan_ready" | "executing" | "completed" | "failed";

interface PlanStep {
  tool: string;
  inputs: Record<string, string>;
  params?: Record<string, any>;
  reason?: string;
}

interface WorkflowPlan {
  goal: string;
  steps: PlanStep[];
  estimatedNote?: string;
  totalEstimatedCredit: number;
}

interface StepData {
  id: string;
  step_index: number;
  tool_name: string;
  status: "pending" | "processing" | "completed" | "failed";
  output_url?: string | null;
  error_message?: string | null;
}

// ── Gallery Modal — NO portal, renders at page root with position:fixed ────────

function GalleryModal({
  onSelect,
  onClose,
}: {
  onSelect: (url: string) => void;
  onClose: () => void;
}) {
  const [galleryImages, setGalleryImages] = useState<DBAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getImages()
      .then(setGalleryImages)
      .catch(() => toast.error("Không thể tải thư viện ảnh"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[70vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border shrink-0">
          <span className="font-semibold text-sm">Chọn từ thư viện</span>
          <button
            onClick={onClose}
            className="cursor-pointer p-1.5 rounded-lg hover:bg-secondary transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : galleryImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground">
              <ImageIcon className="size-8" />
              <span className="text-sm">Thư viện trống</span>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {galleryImages.map((img) => (
                <button
                  key={img.id}
                  onClick={() => onSelect(img.url)}
                  className="cursor-pointer aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-primary transition-all group"
                >
                  <img
                    src={img.thumbnail_url || img.url}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Image Input Slot — gallery state is owned by parent (WorkflowPage) ────────

function ImageInputSlot({
  label,
  hint,
  url,
  onSet,
  onClear,
  onOpenGallery,
}: {
  label: string;
  hint: string;
  url: string | null;
  onSet: (url: string) => void;
  onClear: () => void;
  onOpenGallery: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = (file: File) => {
    setUploading(true);
    uploadFile(file)
      .then(onSet)
      .catch((err) => toast.error(`Upload thất bại: ${err.message}`))
      .finally(() => setUploading(false));
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>

      <div className="relative aspect-square rounded-xl border-2 border-dashed border-border bg-secondary/20 hover:border-primary/40 transition-colors">

        {/* Loaded image */}
        <div className={`absolute inset-0 group transition-opacity duration-150 ${url ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
          {url && <img src={url} alt={label} className="w-full h-full object-cover rounded-[10px]" />}
          <button
            onClick={onClear}
            className="cursor-pointer absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="size-3" />
          </button>
        </div>

        {/* Uploading spinner */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-150 ${uploading && !url ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>

        {/* Empty state */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center gap-1.5 p-2 transition-opacity duration-150 ${!url && !uploading ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
          <ImageIcon className="size-5 text-muted-foreground/50" />
          <span className="text-[10px] text-muted-foreground text-center leading-tight">{hint}</span>
          <div className="flex gap-1 mt-0.5">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="cursor-pointer flex items-center gap-1 px-2 py-1 rounded-md bg-secondary text-xs font-medium hover:bg-secondary/80 transition-colors"
            >
              <Upload className="size-3" />Upload
            </button>
            <button
              type="button"
              onClick={onOpenGallery}
              className="cursor-pointer flex items-center gap-1 px-2 py-1 rounded-md bg-secondary text-xs font-medium hover:bg-secondary/80 transition-colors"
            >
              <FolderHeart className="size-3" />Thư viện
            </button>
          </div>
        </div>

        <input
          type="file"
          accept="image/*"
          ref={fileRef}
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </div>
    </div>
  );
}

// ── Step Row ───────────────────────────────────────────────────────────────────

function StepRow({
  step,
  index,
  total,
  plan,
}: {
  step: StepData;
  index: number;
  total: number;
  plan: WorkflowPlan | null;
}) {
  const planStep = plan?.steps[index];
  const credit   = TOOL_CREDIT[step.tool_name] ?? 0;
  const isActive = step.status === "processing";
  const isDone   = step.status === "completed";
  const isFailed = step.status === "failed";

  return (
    <div className={`flex gap-3 items-start transition-opacity duration-300 ${step.status === "pending" ? "opacity-40" : "opacity-100"}`}>
      <div className="flex flex-col items-center shrink-0">
        <div className={`size-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
          isDone   ? "bg-green-500/20 border-green-500 text-green-500" :
          isFailed ? "bg-red-500/20 border-red-500 text-red-500" :
          isActive ? "bg-primary/20 border-primary text-primary" :
                     "bg-secondary border-border text-muted-foreground"
        }`}>
          {isDone   ? <Check className="size-3.5" /> :
           isFailed ? <X className="size-3.5" /> :
           isActive ? <Loader2 className="size-3.5 animate-spin" /> :
           <span>{index + 1}</span>}
        </div>
        <div className={`w-0.5 mt-1 rounded-full transition-colors duration-300 ${isDone ? "bg-green-500/40" : "bg-border"}`}
          style={{ height: index < total - 1 ? "2rem" : "0" }} />
      </div>

      <div className="flex-1 min-w-0 pb-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium">{TOOL_LABELS[step.tool_name] ?? step.tool_name}</span>
          <span className="text-[11px] text-muted-foreground shrink-0">{credit} credits</span>
        </div>
        {planStep?.reason && (
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{planStep.reason}</p>
        )}
        {isFailed && step.error_message && (
          <p className="text-xs text-red-500 mt-1">{step.error_message}</p>
        )}
        {isDone && step.output_url && (
          <div className="mt-2">
            <img
              src={step.output_url}
              alt={`Kết quả bước ${index + 1}`}
              className="max-h-36 rounded-lg border border-border shadow-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function WorkflowPage() {
  const credit = useAppSelector(selectCreditBalance);

  const [state, setState]           = useState<PageState>("setup");
  const [images, setImages]         = useState<Record<string, string | null>>({
    product_image: null, model_image: null, face_image: null,
  });
  const [prompt, setPrompt]         = useState("");
  const [plan, setPlan]             = useState<WorkflowPlan | null>(null);
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [steps, setSteps]           = useState<StepData[]>([]);
  const [finalUrl, setFinalUrl]     = useState<string | null>(null);
  const [error, setError]           = useState<string | null>(null);

  // Gallery state lives here — GalleryModal is rendered at page root, never inside conditionals
  const [gallerySlot, setGallerySlot] = useState<string | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }, []);

  useEffect(() => () => stopPolling(), [stopPolling]);

  const userInputUrls = Object.fromEntries(
    Object.entries(images).filter(([, url]) => url !== null)
  ) as Record<string, string>;

  // ── Handlers ──────────────────────────────────────────────────────────────────

  const handleAnalyze = async () => {
    if (!prompt.trim()) { toast.error("Hãy nhập mô tả yêu cầu trước."); return; }
    setState("planning");
    setError(null);
    setPlan(null);
    try {
      const res = await apiClient.post("/api/workflow/plan", { prompt: prompt.trim(), userInputUrls });
      if (!res.data.success) throw new Error(res.data.error ?? "Lỗi không xác định");
      setPlan(res.data.data.plan);
      setState("plan_ready");
    } catch (err: any) {
      setError(err.message);
      setState("setup");
      toast.error("Không thể lên kế hoạch: " + err.message);
    }
  };

  const handleExecute = async () => {
    if (!plan) return;
    const totalCredit = plan.totalEstimatedCredit;
    if (credit !== null && credit < totalCredit) {
      toast.error(`Không đủ credits. Cần ${totalCredit}, hiện có ${credit}.`);
      return;
    }
    setError(null);
    try {
      const res = await apiClient.post("/api/workflow/execute", { prompt: prompt.trim(), plan, userInputUrls });
      if (!res.data.success) throw new Error(res.data.error ?? "Lỗi không xác định");

      const id: string = res.data.data.workflowId;
      const initialSteps: StepData[] = plan.steps.map((s, i) => ({
        id:         String(i),
        step_index: i,
        tool_name:  s.tool,
        status:     "pending" as const,
      }));

      // Batch all state updates together before starting poll
      setWorkflowId(id);
      setSteps(initialSteps);
      setState("executing");

      pollRef.current = setInterval(async () => {
        try {
          const r = await apiClient.get(`/api/workflow/${id}`);
          if (!r.data.success) return;
          const { workflow, steps: stepsData } = r.data.data;
          setSteps(stepsData);
          if (workflow.status === "completed") {
            stopPolling();
            const last = [...stepsData].reverse().find((s: StepData) => s.output_url);
            setFinalUrl(last?.output_url ?? null);
            setState("completed");
            toast.success("Workflow hoàn thành!");
          } else if (workflow.status === "failed") {
            stopPolling();
            setError(workflow.error_message ?? "Workflow thất bại");
            setState("failed");
          }
        } catch { /* ignore transient poll errors */ }
      }, 3000);
    } catch (err: any) {
      setError(err.message);
      toast.error("Không thể chạy workflow: " + err.message);
    }
  };

  const handleReset = () => {
    stopPolling();
    setState("setup");
    setPlan(null);
    setWorkflowId(null);
    setSteps([]);
    setFinalUrl(null);
    setError(null);
  };

  const handleNewWorkflow = () => {
    handleReset();
    setImages({ product_image: null, model_image: null, face_image: null });
    setPrompt("");
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Workflow className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold">AI Workflow</h1>
          <p className="text-sm text-muted-foreground">Kết hợp nhiều AI tool trong 1 lần chạy</p>
        </div>
        {credit !== null && (
          <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/60 text-sm">
            <Zap className="size-3.5 text-primary" />
            <span className="font-semibold">{credit.toLocaleString()}</span>
            <span className="text-muted-foreground text-xs">credits</span>
          </div>
        )}
      </div>

      {/* ── SETUP / PLANNING ── */}
      {(state === "setup" || state === "planning") && (
        <>
          <div className="rounded-2xl border border-border bg-card p-4 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Ảnh đầu vào</span>
              <span className="text-xs text-muted-foreground">(không bắt buộc — AI suy luận từ prompt)</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {IMAGE_SLOTS.map(({ key, label, hint }) => (
                <ImageInputSlot
                  key={key}
                  label={label}
                  hint={hint}
                  url={images[key]}
                  onSet={(url) => setImages((prev) => ({ ...prev, [key]: url }))}
                  onClear={() => setImages((prev) => ({ ...prev, [key]: null }))}
                  onOpenGallery={() => setGallerySlot(key)}
                />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <span className="text-sm font-semibold">Mô tả yêu cầu</span>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ví dụ: Xóa nền ảnh sản phẩm rồi đặt lên người mẫu AI đẹp..."
              rows={3}
              className="w-full resize-none rounded-xl border border-border bg-secondary/30 px-3 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/60 focus:bg-card transition-colors"
            />
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => setPrompt(ex)}
                  className="cursor-pointer text-[11px] px-2.5 py-1 rounded-full border border-border hover:border-primary/40 hover:bg-primary/5 text-muted-foreground hover:text-foreground transition-all"
                >
                  {ex.length > 42 ? ex.slice(0, 40) + "…" : ex}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={!prompt.trim() || state === "planning"}
              className="cursor-pointer w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-foreground text-background text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {state === "planning"
                ? <><Loader2 className="size-4 animate-spin" />Đang phân tích…</>
                : <><Sparkles className="size-4" />Phân tích & lên kế hoạch</>}
            </button>
          </div>

          {error && (
            <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}
        </>
      )}

      {/* ── PLAN READY ── */}
      {state === "plan_ready" && plan && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border/60 bg-primary/5">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="size-4 text-primary" />
              <span className="font-semibold text-sm">Kế hoạch AI đề xuất</span>
            </div>
            <p className="text-sm text-muted-foreground">{plan.goal}</p>
          </div>

          <div className="p-5">
            {plan.steps.map((step, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="flex flex-col items-center shrink-0">
                  <div className="size-6 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-[11px] font-bold text-primary">
                    {i + 1}
                  </div>
                  {i < plan.steps.length - 1 && (
                    <div className="w-0.5 h-8 mt-1 bg-border rounded-full" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{TOOL_LABELS[step.tool] ?? step.tool}</span>
                    <span className="text-[11px] font-semibold text-primary">
                      {TOOL_CREDIT[step.tool] ?? 0} credits
                    </span>
                  </div>
                  {step.reason && (
                    <p className="text-xs text-muted-foreground mt-0.5">{step.reason}</p>
                  )}
                  {step.params?.prompt && (
                    <p className="text-xs text-muted-foreground/70 mt-0.5 italic">"{step.params.prompt}"</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="px-5 pb-5 pt-1 border-t border-border/40">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Tổng ước tính</span>
              <span className="text-base font-bold">{plan.totalEstimatedCredit} credits</span>
            </div>
            {plan.estimatedNote && (
              <p className="text-xs text-muted-foreground mb-3">{plan.estimatedNote}</p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="cursor-pointer flex-1 h-10 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="size-3.5" />Làm lại
              </button>
              <button
                type="button"
                onClick={handleExecute}
                className="cursor-pointer flex-[2] h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
              >
                <Sparkles className="size-4" />
                Xác nhận & Chạy ({plan.totalEstimatedCredit} credits)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EXECUTING / COMPLETED / FAILED ── */}
      {(state === "executing" || state === "completed" || state === "failed") && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className={`px-5 py-3.5 border-b border-border/60 ${
            state === "completed" ? "bg-green-500/10" :
            state === "failed"    ? "bg-red-500/10"   : "bg-primary/5"
          }`}>
            <div className="flex items-center gap-2">
              {state === "executing" && <Loader2 className="size-4 animate-spin text-primary" />}
              {state === "completed" && <Check className="size-4 text-green-500" />}
              {state === "failed"    && <AlertCircle className="size-4 text-red-500" />}
              <span className="font-semibold text-sm">
                {state === "executing" ? "Đang xử lý workflow…"
                 : state === "completed" ? "Workflow hoàn thành!"
                 : "Workflow thất bại"}
              </span>
            </div>
          </div>

          <div className="p-5">
            {steps.map((step, i) => (
              <StepRow
                key={step.step_index}
                step={step}
                index={i}
                total={steps.length}
                plan={plan}
              />
            ))}
          </div>

          {state === "completed" && finalUrl && (
            <div className="px-5 pb-5 space-y-3">
              <div className="rounded-xl overflow-hidden border border-border">
                {finalUrl.match(/\.(mp4|webm|mov)$/i) ? (
                  <video src={finalUrl} controls className="w-full max-h-96" />
                ) : (
                  <img src={finalUrl} alt="Kết quả cuối" className="w-full" />
                )}
              </div>
              <div className="flex gap-2">
                <a
                  href={finalUrl}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <Download className="size-4" />Tải về
                </a>
                <button
                  type="button"
                  onClick={handleNewWorkflow}
                  className="cursor-pointer flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors"
                >
                  <Sparkles className="size-3.5" />Workflow mới
                </button>
              </div>
            </div>
          )}

          {state === "failed" && (
            <div className="px-5 pb-5 space-y-3">
              {error && (
                <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  {error}
                </div>
              )}
              <button
                type="button"
                onClick={handleNewWorkflow}
                className="cursor-pointer w-full flex items-center justify-center gap-1.5 h-10 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors"
              >
                <ArrowLeft className="size-3.5" />Thử lại từ đầu
              </button>
            </div>
          )}
        </div>
      )}

      {/* Gallery modal — rendered at page root, outside all conditional sections.
          No createPortal needed: position:fixed escapes layout flow naturally. */}
      {gallerySlot !== null && (
        <GalleryModal
          onSelect={(url) => {
            setImages((prev) => ({ ...prev, [gallerySlot]: url }));
            setGallerySlot(null);
          }}
          onClose={() => setGallerySlot(null)}
        />
      )}
    </div>
  );
}
