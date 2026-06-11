"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Sparkles, Upload, X, Loader2, Check, AlertCircle, ImageIcon,
  Download, FolderHeart, Workflow, Zap, Send, Plus,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  { key: "product_image", label: "Sản phẩm", hint: "Áo, quần, váy..." },
  { key: "model_image",   label: "Người mẫu", hint: "Ảnh người mặc thử" },
  { key: "face_image",    label: "Khuôn mặt", hint: "Tham chiếu mặt" },
];

const INPUT_KEY_LABELS: Record<string, string> = {
  image:            "Ảnh",
  garment_image:    "Trang phục",
  model_image:      "Người mẫu",
  face_image:       "Khuôn mặt",
  product_image:    "Sản phẩm",
  background_image: "Nền",
  target_image:     "Ảnh đích",
  source_image:     "Ảnh nguồn",
};

function formatInputVal(val: string): string {
  if (val === "$product_image") return "ảnh sản phẩm";
  if (val === "$model_image")   return "ảnh người mẫu";
  if (val === "$face_image")    return "ảnh khuôn mặt";
  const m = val.match(/^\$step_(\d+)_output$/);
  if (m) return `kết quả bước ${parseInt(m[1]) + 1}`;
  return val;
}

const EXAMPLE_PROMPTS = [
  "Xóa nền ảnh sản phẩm rồi đặt lên người mẫu AI",
  "Tạo người mẫu từ khuôn mặt rồi mặc thử trang phục",
  "Mặc thử trang phục lên người mẫu đã cung cấp",
  "Đặt sản phẩm lên người mẫu rồi chuyển thành video",
];

// ── Types ──────────────────────────────────────────────────────────────────────

type PageState = "idle" | "planning" | "plan_ready" | "executing" | "done";

interface PlanStep {
  tool: string;
  inputs: Record<string, string>;
  params?: Record<string, unknown>;
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

type MessageKind = "user" | "thinking" | "plan" | "executing" | "result" | "error_msg";

interface ChatMessage {
  id: string;
  kind: MessageKind;
  text?: string;
  images?: Array<{ key: string; url: string; label: string }>;
  plan?: WorkflowPlan;
  steps?: StepData[];
  finalUrl?: string | null;
  error?: string;
}

// ── Gallery Modal ──────────────────────────────────────────────────────────────

function GalleryModal({ onSelect, onClose }: { onSelect: (url: string) => void; onClose: () => void }) {
  const [galleryImages, setGalleryImages] = useState<DBAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getImages()
      .then(setGalleryImages)
      .catch(() => toast.error("Không thể tải thư viện ảnh"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[70vh] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border shrink-0">
          <span className="font-semibold text-sm">Chọn từ thư viện</span>
          <button onClick={onClose} className="cursor-pointer p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <X className="size-4" />
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-3">
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
                <button key={img.id} onClick={() => onSelect(img.url)} className="cursor-pointer aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-primary transition-all group">
                  <img src={img.thumbnail_url || img.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                </button>
              ))}
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Compact Image Slot (chat input bar) ───────────────────────────────────────

function CompactImageSlot({
  label, url, disabled, onSet, onClear, onOpenGallery,
}: {
  label: string; url: string | null; disabled: boolean;
  onSet: (url: string) => void; onClear: () => void; onOpenGallery: () => void;
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
    <div className="shrink-0">
      {/* Upload slot — always mounted, inline style display để tránh mọi insertBefore */}
      <div style={{ display: url ? "none" : undefined }}>
        <div className={`flex flex-col items-center gap-1 ${disabled ? "opacity-40 pointer-events-none" : ""}`}>
          <div className="flex gap-0.5">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="cursor-pointer flex items-center gap-0.5 px-2 py-1 rounded-lg border border-dashed border-border bg-secondary/40 text-[11px] text-muted-foreground hover:border-primary/50 hover:text-foreground transition-all"
            >
              {/* Icon luôn mount — tránh insertBefore khi swap Loader2 ↔ Upload */}
              <span style={{ display: uploading ? "inline-flex" : "none" }}><Loader2 className="size-3 animate-spin" /></span>
              <span style={{ display: uploading ? "none" : "inline-flex" }}><Upload className="size-3" /></span>
              {label}
            </button>
            <button
              type="button"
              onClick={onOpenGallery}
              className="cursor-pointer p-1 rounded-lg border border-dashed border-border bg-secondary/40 hover:border-primary/50 transition-all"
              title="Chọn từ thư viện"
            >
              <FolderHeart className="size-3 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
      {/* Preview slot — always mounted */}
      <div style={{ display: url ? undefined : "none" }}>
        <div className="relative group">
          <img src={url ?? undefined} alt={label} className="size-12 rounded-xl object-cover border-2 border-primary/40" />
          <span className="absolute bottom-0 left-0 right-0 text-[9px] text-center bg-black/60 text-white rounded-b-[10px] px-0.5 py-0.5 truncate">{label}</span>
          <button onClick={onClear} style={{ display: disabled ? "none" : undefined }} className="cursor-pointer absolute -top-1.5 -right-1.5 size-4 rounded-full bg-background border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
            <X className="size-2.5" />
          </button>
        </div>
      </div>
      <input type="file" accept="image/*" ref={fileRef} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
    </div>
  );
}

// ── Assistant Avatar ───────────────────────────────────────────────────────────

function AssistantAvatar() {
  return (
    <div className="size-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
      <Sparkles className="size-3.5 text-primary" />
    </div>
  );
}

// ── Mini Step Row (inside chat bubble) ────────────────────────────────────────

function MiniStepRow({ step, index, total }: { step: StepData; index: number; total: number }) {
  const isActive = step.status === "processing";
  const isDone   = step.status === "completed";
  const isFailed = step.status === "failed";

  return (
    <div className={`flex gap-2.5 items-start transition-opacity duration-300 ${step.status === "pending" ? "opacity-40" : "opacity-100"}`}>
      <div className="flex flex-col items-center shrink-0">
        <div className={`size-5 rounded-full flex items-center justify-center border transition-all duration-300 ${
          isDone   ? "bg-green-500/20 border-green-500 text-green-500" :
          isFailed ? "bg-red-500/20 border-red-500 text-red-500" :
          isActive ? "bg-primary/20 border-primary text-primary" :
                     "bg-secondary border-border text-muted-foreground"
        }`}>
          {isDone   ? <Check className="size-2.5" /> :
           isFailed ? <X className="size-2.5" /> :
           isActive ? <Loader2 className="size-2.5 animate-spin" /> :
           <span className="text-[9px] font-bold">{index + 1}</span>}
        </div>
        {index < total - 1 && (
          <div className={`w-0.5 h-5 mt-0.5 rounded-full ${isDone ? "bg-green-500/40" : "bg-border"}`} />
        )}
      </div>

      <div className="flex-1 min-w-0 pb-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium">{TOOL_LABELS[step.tool_name] ?? step.tool_name}</span>
          <span className="text-[10px] text-muted-foreground shrink-0">{TOOL_CREDIT[step.tool_name] ?? 0} credits</span>
        </div>
        {isFailed && step.error_message && (
          <p className="text-[11px] text-red-500 mt-0.5">{step.error_message}</p>
        )}
        {isDone && step.output_url && (
          <div className="mt-1.5">
            <img src={step.output_url} alt={`Kết quả bước ${index + 1}`} className="max-h-28 rounded-lg border border-border shadow-sm" />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Message Bubble ─────────────────────────────────────────────────────────────

function MessageBubble({
  msg, pageState, onConfirm, onReject,
}: {
  msg: ChatMessage;
  pageState: PageState;
  onConfirm: () => void;
  onReject: () => void;
}) {
  const [showJson, setShowJson] = React.useState(false);
  // User bubble
  if (msg.kind === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] flex flex-col items-end gap-2">
          {msg.images && msg.images.length > 0 && (
            <div className="flex gap-2 flex-wrap justify-end">
              {msg.images.map(({ key, url, label }) => (
                <div key={key} className="relative">
                  <img src={url} alt={label} className="size-16 rounded-xl object-cover border border-border shadow-sm" />
                  <span className="absolute bottom-0 left-0 right-0 text-[9px] text-center bg-black/60 text-white rounded-b-[10px] px-0.5 py-0.5">{label}</span>
                </div>
              ))}
            </div>
          )}
          {msg.text && (
            <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-4 py-2.5 text-sm leading-relaxed">
              {msg.text}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Thinking bubble
  if (msg.kind === "thinking") {
    return (
      <div className="flex items-start gap-2">
        <AssistantAvatar />
        <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" />
          Đang phân tích và lên kế hoạch…
        </div>
      </div>
    );
  }

  // Plan bubble
  if (msg.kind === "plan" && msg.plan) {
    const canAct = pageState === "plan_ready";
    return (
      <div className="flex items-start gap-2">
        <AssistantAvatar />
        <div className="flex-1 max-w-[90%] bg-card border border-border rounded-2xl rounded-bl-sm overflow-hidden">
          <div className="px-4 py-3 bg-primary/5 border-b border-border/60">
            <div className="flex items-center gap-2 mb-0.5">
              <Sparkles className="size-3.5 text-primary" />
              <span className="text-sm font-semibold">Kế hoạch AI đề xuất</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{msg.plan.goal}</p>
          </div>

          <div className="p-4">
            {msg.plan.steps.map((step, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="flex flex-col items-center shrink-0">
                  <div className="size-5 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-[10px] font-bold text-primary">
                    {i + 1}
                  </div>
                  {i < msg.plan!.steps.length - 1 && <div className="w-0.5 h-6 mt-1 bg-border rounded-full" />}
                </div>
                <div className="flex-1 pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium">{TOOL_LABELS[step.tool] ?? step.tool}</span>
                    <span className="text-[10px] font-semibold text-primary shrink-0">{TOOL_CREDIT[step.tool] ?? 0} credits</span>
                  </div>
                  {step.reason && <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{step.reason}</p>}
                  {step.params?.prompt ? (
                    <p className="text-[11px] text-muted-foreground/70 mt-0.5 italic">"{String(step.params.prompt)}"</p>
                  ) : null}
                  {Object.keys(step.inputs ?? {}).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {Object.entries(step.inputs).map(([k, v]) => (
                        <span key={k} className="inline-flex items-center gap-1 text-[10px] bg-secondary/60 border border-border/60 px-1.5 py-0.5 rounded-md text-muted-foreground">
                          <span className="text-foreground/70">{INPUT_KEY_LABELS[k] ?? k}</span>
                          <span className="text-border">→</span>
                          {formatInputVal(v)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Raw JSON toggle */}
          <div className="border-t border-border/40">
            <button
              onClick={() => setShowJson((v) => !v)}
              className="cursor-pointer w-full flex items-center justify-between px-4 py-2 text-[11px] text-muted-foreground hover:text-foreground hover:bg-secondary/30 transition-colors"
            >
              <span>Raw JSON</span>
              <span className="font-mono text-[10px]">{showJson ? "▲" : "▼"}</span>
            </button>
            {showJson && (
              <div className="px-4 pb-3">
                <pre className="text-[10px] leading-relaxed bg-secondary/40 border border-border/60 rounded-xl p-3 overflow-x-auto text-muted-foreground whitespace-pre-wrap break-all">
                  {JSON.stringify(msg.plan, null, 2)}
                </pre>
              </div>
            )}
          </div>

          <div className="px-4 pb-4 pt-1 border-t border-border/40">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">Tổng ước tính</span>
              <span className="text-sm font-bold">{msg.plan.totalEstimatedCredit} credits</span>
            </div>
            {msg.plan.estimatedNote && (
              <p className="text-[11px] text-muted-foreground mb-3">{msg.plan.estimatedNote}</p>
            )}
            {canAct && (
              <div className="flex gap-2">
                <button onClick={onReject} className="cursor-pointer flex-1 h-9 rounded-xl border border-border text-xs font-medium hover:bg-secondary transition-colors">
                  Làm lại
                </button>
                <button onClick={onConfirm} className="cursor-pointer flex-[2] h-9 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-1.5">
                  <Sparkles className="size-3" />
                  Xác nhận & Chạy ({msg.plan.totalEstimatedCredit} credits)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Executing / result bubble
  if (msg.kind === "executing" || msg.kind === "result") {
    const isComplete = msg.kind === "result";
    return (
      <div className="flex items-start gap-2">
        <AssistantAvatar />
        <div className="flex-1 max-w-[90%] bg-card border border-border rounded-2xl rounded-bl-sm overflow-hidden">
          <div className={`px-4 py-2.5 border-b border-border/60 flex items-center gap-2 ${isComplete ? "bg-green-500/10" : "bg-primary/5"}`}>
            {isComplete
              ? <Check className="size-3.5 text-green-500" />
              : <Loader2 className="size-3.5 animate-spin text-primary" />}
            <span className="text-xs font-semibold">
              {isComplete ? "Workflow hoàn thành!" : "Đang xử lý workflow…"}
            </span>
          </div>

          <div className="p-4">
            {(msg.steps ?? []).map((step, i) => (
              <MiniStepRow key={step.step_index} step={step} index={i} total={(msg.steps ?? []).length} />
            ))}
          </div>

          {isComplete && msg.finalUrl && (
            <div className="px-4 pb-4 space-y-2.5">
              <div className="rounded-xl overflow-hidden border border-border">
                {msg.finalUrl.match(/\.(mp4|webm|mov)$/i) ? (
                  <video src={msg.finalUrl} controls className="w-full max-h-80" />
                ) : (
                  <img src={msg.finalUrl} alt="Kết quả cuối" className="w-full" />
                )}
              </div>
              <a
                href={msg.finalUrl}
                download
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 h-9 rounded-xl bg-foreground text-background text-xs font-medium hover:opacity-90 transition-opacity"
              >
                <Download className="size-3.5" />Tải về
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Error bubble
  if (msg.kind === "error_msg") {
    return (
      <div className="flex items-start gap-2">
        <AssistantAvatar />
        <div className="flex-1 max-w-[90%] bg-card border border-red-500/20 rounded-2xl rounded-bl-sm overflow-hidden">
          {msg.steps && msg.steps.length > 0 && (
            <>
              <div className="px-4 py-2.5 bg-red-500/10 border-b border-border/60 flex items-center gap-2">
                <AlertCircle className="size-3.5 text-red-500" />
                <span className="text-xs font-semibold text-red-500">Workflow thất bại</span>
              </div>
              <div className="p-4">
                {msg.steps.map((step, i) => (
                  <MiniStepRow key={step.step_index} step={step} index={i} total={msg.steps!.length} />
                ))}
              </div>
            </>
          )}
          {msg.error && (
            <div className="flex items-start gap-2 px-4 py-3 text-red-500 text-xs">
              <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
              {msg.error}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function WorkflowPage() {
  const credit = useAppSelector(selectCreditBalance);

  const [pageState, setPageState] = useState<PageState>("idle");
  const [messages, setMessages]   = useState<ChatMessage[]>([]);
  const [images, setImages]       = useState<Record<string, string | null>>({
    product_image: null, model_image: null, face_image: null,
  });
  const [prompt, setPrompt]       = useState("");
  const [gallerySlot, setGallerySlot] = useState<string | null>(null);

  const planRef        = useRef<WorkflowPlan | null>(null);
  const sentPromptRef  = useRef<string>("");
  const sentImagesRef  = useRef<Record<string, string>>({});
  const pollRef        = useRef<ReturnType<typeof setInterval> | null>(null);
  const bottomRef      = useRef<HTMLDivElement>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }, []);

  useEffect(() => () => stopPolling(), [stopPolling]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const appendMessage = (msg: Omit<ChatMessage, "id">): string => {
    const id = crypto.randomUUID();
    setMessages((prev) => [...prev, { ...msg, id }]);
    return id;
  };

  const updateMessage = (id: string, updates: Partial<ChatMessage>) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  // ── Send ───────────────────────────────────────────────────────────────────

  const handleSend = async () => {
    if (!prompt.trim() || pageState !== "idle") return;

    const currentPrompt = prompt.trim();
    const currentImages = Object.fromEntries(
      Object.entries(images).filter(([, url]) => url !== null)
    ) as Record<string, string>;

    // Store for execute call later
    sentPromptRef.current  = currentPrompt;
    sentImagesRef.current  = currentImages;

    const attachedImages = Object.entries(images)
      .filter(([, url]) => url !== null)
      .map(([key, url]) => ({
        key,
        url: url!,
        label: IMAGE_SLOTS.find((s) => s.key === key)?.label ?? key,
      }));

    appendMessage({ kind: "user", text: currentPrompt, images: attachedImages });
    setPrompt("");
    setPageState("planning");

    const thinkId = appendMessage({ kind: "thinking" });

    try {
      const res = await apiClient.post("/api/workflow/plan", {
        prompt: currentPrompt,
        userInputUrls: currentImages,
      });
      if (!res.data.success) throw new Error(res.data.error ?? "Lỗi không xác định");

      const plan: WorkflowPlan = res.data.data.plan;
      planRef.current = plan;
      updateMessage(thinkId, { kind: "plan", plan });
      setPageState("plan_ready");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      updateMessage(thinkId, { kind: "error_msg", error: message });
      setPageState("idle");
      toast.error("Không thể lên kế hoạch: " + message);
    }
  };

  // ── Confirm plan ──────────────────────────────────────────────────────────

  const handleConfirm = async () => {
    const plan = planRef.current;
    if (!plan) return;

    const totalCredit = plan.totalEstimatedCredit;
    if (credit !== null && credit < totalCredit) {
      toast.error(`Không đủ credits. Cần ${totalCredit}, hiện có ${credit}.`);
      return;
    }

    appendMessage({ kind: "user", text: `Xác nhận chạy (${totalCredit} credits)` });
    setPageState("executing");

    const initialSteps: StepData[] = plan.steps.map((s, i) => ({
      id: String(i),
      step_index: i,
      tool_name: s.tool,
      status: "pending" as const,
    }));
    const execId = appendMessage({ kind: "executing", steps: initialSteps });

    try {
      const res = await apiClient.post("/api/workflow/execute", {
        prompt: sentPromptRef.current,
        plan,
        userInputUrls: sentImagesRef.current,
      });
      if (!res.data.success) throw new Error(res.data.error ?? "Lỗi không xác định");

      const workflowId: string = res.data.data.workflowId;

      pollRef.current = setInterval(async () => {
        try {
          const r = await apiClient.get(`/api/workflow/${workflowId}`);
          if (!r.data.success) return;
          const { workflow, steps: stepsData } = r.data.data;

          updateMessage(execId, { steps: stepsData });

          if (workflow.status === "completed") {
            stopPolling();
            const last = [...stepsData].reverse().find((s: StepData) => s.output_url);
            updateMessage(execId, { kind: "result", steps: stepsData, finalUrl: last?.output_url ?? null });
            setPageState("done");
            toast.success("Workflow hoàn thành!");
          } else if (workflow.status === "failed") {
            stopPolling();
            updateMessage(execId, {
              kind: "error_msg",
              steps: stepsData,
              error: workflow.error_message ?? "Workflow thất bại",
            });
            setPageState("done");
          }
        } catch { /* ignore transient poll errors */ }
      }, 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      updateMessage(execId, { kind: "error_msg", error: message });
      setPageState("done");
      toast.error("Không thể chạy workflow: " + message);
    }
  };

  // ── Reject plan ───────────────────────────────────────────────────────────

  const handleReject = () => {
    planRef.current = null;
    setPageState("idle");
    appendMessage({ kind: "user", text: "Làm lại từ đầu" });
  };

  // ── New workflow ──────────────────────────────────────────────────────────

  const handleNewWorkflow = () => {
    stopPolling();
    setMessages([]);
    setImages({ product_image: null, model_image: null, face_image: null });
    setPrompt("");
    planRef.current = null;
    setPageState("idle");
  };

  const isInputDisabled = pageState !== "idle";

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
        <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <Workflow className="size-4 text-primary" />
        </div>
        <div>
          <h1 className="text-base font-bold leading-tight">AI Workflow</h1>
          <p className="text-xs text-muted-foreground">Kết hợp nhiều AI tool trong 1 lần chạy</p>
        </div>
        {credit !== null && (
          <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/60 text-sm">
            <Zap className="size-3.5 text-primary" />
            <span className="font-semibold">{credit.toLocaleString()}</span>
            <span className="text-muted-foreground text-xs">credits</span>
          </div>
        )}
      </div>

      {/* Chat area */}
      <ScrollArea className="flex-1 min-h-0">
      <div className="px-4 py-6 space-y-4">

        {/* Welcome / empty state */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-5 text-center">
            <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="size-7 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-base mb-1.5">Chào mừng đến AI Workflow!</p>
              <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                Mô tả yêu cầu của bạn và AI sẽ tự động lên kế hoạch rồi chạy các bước xử lý ảnh.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-sm">
              {EXAMPLE_PROMPTS.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setPrompt(ex)}
                  className="cursor-pointer text-left text-sm px-4 py-2.5 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 text-muted-foreground hover:text-foreground transition-all"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            pageState={pageState}
            onConfirm={handleConfirm}
            onReject={handleReject}
          />
        ))}

        {/* New workflow button */}
        {pageState === "done" && (
          <div className="flex justify-center pt-2">
            <button
              onClick={handleNewWorkflow}
              className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors"
            >
              <Plus className="size-3.5" />Workflow mới
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
      </ScrollArea>

      {/* Input area */}
      <div className="border-t border-border bg-card/80 backdrop-blur-sm px-4 pt-3 pb-4 space-y-2.5 shrink-0">

        {/* Image attachment row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-muted-foreground mr-0.5">Ảnh đính kèm:</span>
          {IMAGE_SLOTS.map(({ key, label }) => (
            <CompactImageSlot
              key={key}
              label={label}
              url={images[key]}
              disabled={isInputDisabled}
              onSet={(url) => setImages((prev) => ({ ...prev, [key]: url }))}
              onClear={() => setImages((prev) => ({ ...prev, [key]: null }))}
              onOpenGallery={() => setGallerySlot(key)}
            />
          ))}
        </div>

        {/* Text input + send button */}
        <div className="flex gap-2 items-end">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={isInputDisabled ? "Đang xử lý…" : "Mô tả yêu cầu… (Enter để gửi, Shift+Enter xuống dòng)"}
            rows={2}
            disabled={isInputDisabled}
            className="flex-1 resize-none rounded-xl border border-border bg-secondary/30 px-3.5 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/60 focus:bg-card transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!prompt.trim() || isInputDisabled}
            className="cursor-pointer size-10 rounded-xl bg-foreground text-background flex items-center justify-center hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 self-end"
          >
            {pageState === "planning"
              ? <Loader2 className="size-4 animate-spin" />
              : <Send className="size-4" />}
          </button>
        </div>
      </div>

      {/* Gallery modal */}
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
