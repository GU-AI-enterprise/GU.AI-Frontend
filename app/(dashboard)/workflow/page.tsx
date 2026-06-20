"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Zap, Send, Plus } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { selectCreditBalance } from "@/features/credit/creditSlice";
import { useSidebar } from "@/contexts/SidebarContext";
import { toast } from "sonner";

import { GalleryModal }  from "@/features/workflow/components/gallery-modal";
import { CompactImageSlot } from "@/features/workflow/components/image-slot";
import { MessageBubble } from "@/features/workflow/components/message-bubble";
import { InputBar, ModelPicker } from "@/features/workflow/components/input-bar";
import { HistoryPanel }  from "@/features/workflow/components/history-panel";
import { IMAGE_SLOTS, EXAMPLE_PROMPTS, DEFAULT_REASONING_MODEL } from "@/features/workflow/constants";
import { buildHistory } from "@/features/workflow/helpers";
import {
  fetchWorkflowHistory, fetchWorkflowTools,
  chatWithWorkflowStream, executeWorkflow, getWorkflowStatus,
} from "@/features/workflow/workflowService";
import type {
  PageState, ChatMessage, WorkflowPlan, StepData, WorkflowHistory,
  ReasoningModelId,
} from "@/features/workflow/types";

export default function WorkflowPage() {
  const { user } = useAppSelector((s) => s.auth);
  const credit    = useAppSelector(selectCreditBalance);
  const { isMobile } = useSidebar();

  const displayName = user?.user_metadata?.full_name
    || user?.user_metadata?.name
    || user?.email?.split("@")[0]
    || "bạn";

  const [pageState, setPageState] = useState<PageState>("idle");
  const [messages, setMessages]   = useState<ChatMessage[]>([]);
  const [images, setImages]       = useState<Record<string, string | null>>({
    product_image: null, model_image: null, face_image: null,
  });
  const [prompt, setPrompt]           = useState("");
  const [gallerySlot, setGallerySlot] = useState<string | null>(null);
  const [model, setModel]             = useState<ReasoningModelId>(DEFAULT_REASONING_MODEL);

  const [history, setHistory]               = useState<WorkflowHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyCollapsed, setHistoryCollapsed] = useState(false);
  const [toolMeta, setToolMeta]             = useState<Record<string, { label: string; credit: number }>>({});

  // Default to fully collapsed on mobile, same as the main sidebar
  useEffect(() => {
    if (isMobile) setHistoryCollapsed(true);
  }, [isMobile]);

  const planRef       = useRef<WorkflowPlan | null>(null);
  const sentImagesRef = useRef<Record<string, string>>({});
  const pollRef       = useRef<ReturnType<typeof setInterval> | null>(null);
  const bottomRef     = useRef<HTMLDivElement>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }, []);

  useEffect(() => () => stopPolling(), [stopPolling]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadHistory = useCallback(async () => {
    try {
      const data = await fetchWorkflowHistory();
      setHistory(data);
    } catch { /* non-critical */ }
    finally { setHistoryLoading(false); }
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  useEffect(() => {
    fetchWorkflowTools().then(setToolMeta).catch(() => { /* fall back to static constants */ });
  }, []);

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
      Object.entries(images).filter(([, url]) => url !== null),
    ) as Record<string, string>;

    sentImagesRef.current = currentImages;

    const attachedImages = Object.entries(images)
      .filter(([, url]) => url !== null)
      .map(([key, url]) => ({
        key, url: url!,
        label: IMAGE_SLOTS.find((s) => s.key === key)?.label ?? key,
      }));

    const conversationHistory = buildHistory(messages);

    appendMessage({ kind: "user", text: currentPrompt, images: attachedImages });
    setPrompt("");
    setPageState("planning");

    const thinkId = appendMessage({ kind: "thinking" });
    let streamedText = "";
    let switchedToAssistant = false;

    try {
      const { message: aiMessage, plan } = await chatWithWorkflowStream(
        {
          message: currentPrompt,
          userInputUrls: currentImages,
          model,
          history: conversationHistory,
        },
        (event) => {
          if (event.type !== "delta") return;
          streamedText += event.text;
          if (!switchedToAssistant) {
            switchedToAssistant = true;
            updateMessage(thinkId, { kind: "assistant", text: streamedText });
          } else {
            updateMessage(thinkId, { text: streamedText });
          }
        },
      );

      if (plan) {
        if (aiMessage) {
          updateMessage(thinkId, { kind: "assistant", text: aiMessage });
          planRef.current = plan;
          appendMessage({ kind: "plan", plan });
        } else {
          updateMessage(thinkId, { kind: "plan", plan });
          planRef.current = plan;
        }
        setPageState("plan_ready");
      } else {
        updateMessage(thinkId, { kind: "assistant", text: aiMessage || streamedText || "…" });
        setPageState("idle");
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      updateMessage(thinkId, { kind: "error_msg", error: errMsg });
      setPageState("idle");
      toast.error("Lỗi: " + errMsg);
    }
  };

  // ── Confirm / Execute ──────────────────────────────────────────────────────

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
      id: String(i), step_index: i, tool_name: s.tool, status: "pending" as const,
    }));
    const execId = appendMessage({ kind: "executing", steps: initialSteps });

    try {
      const { workflowId } = await executeWorkflow({
        prompt: plan.goal,
        plan,
        userInputUrls: sentImagesRef.current,
      });

      pollRef.current = setInterval(async () => {
        try {
          const { workflow, steps: stepsData } = await getWorkflowStatus(workflowId);
          updateMessage(execId, { steps: stepsData });

          if (workflow.status === "completed") {
            stopPolling();
            const last = [...stepsData].reverse().find((s: StepData) => s.output_url);
            updateMessage(execId, { kind: "result", steps: stepsData, finalUrl: last?.output_url ?? null });
            setPageState("idle");
            loadHistory();
            toast.success("Workflow hoàn thành!");
          } else if (workflow.status === "failed") {
            stopPolling();
            updateMessage(execId, { kind: "error_msg", steps: stepsData, error: workflow.error_message ?? "Workflow thất bại" });
            setPageState("idle");
            loadHistory();
          }
        } catch { /* ignore transient poll errors */ }
      }, 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      updateMessage(execId, { kind: "error_msg", error: message });
      setPageState("idle");
      toast.error("Không thể chạy workflow: " + message);
    }
  };

  const handleReject = () => {
    planRef.current = null;
    setPageState("idle");
    appendMessage({ kind: "user", text: "Làm lại từ đầu" });
  };

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
    <div className="flex h-[calc(100vh-56px)]">

      {/* ── Left: Chat area ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {messages.length === 0 ? (
          /* Welcome / idle state */
          <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 overflow-y-auto">
            <div className="w-full max-w-2xl">
              <h1 className="text-3xl font-bold text-foreground leading-tight">
                Xin chào, {displayName}!
              </h1>
              <h2 className="text-3xl font-bold text-foreground/50 mt-0.5 mb-2">
                Bạn muốn tạo gì <span className="text-primary">hôm nay?</span>
              </h2>
              <p className="text-sm text-muted-foreground mb-8">
                Mô tả yêu cầu, AI sẽ tự lên kế hoạch và xử lý ảnh thời trang cho bạn.
              </p>

              {/* Input card */}
              <div className="rounded-2xl border border-border bg-card shadow-sm p-4 mb-5">
                <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] text-muted-foreground">Ảnh đính kèm:</span>
                    {IMAGE_SLOTS.map(({ key, label }) => (
                      <CompactImageSlot
                        key={key}
                        label={label}
                        url={images[key]}
                        disabled={false}
                        onSet={(url) => setImages((prev) => ({ ...prev, [key]: url }))}
                        onClear={() => setImages((prev) => ({ ...prev, [key]: null }))}
                        onOpenGallery={() => setGallerySlot(key)}
                      />
                    ))}
                  </div>
                  <ModelPicker value={model} onChange={setModel} disabled={false} />
                </div>
                <div className="flex gap-2 items-end">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder="Mô tả yêu cầu của bạn… (Enter để gửi)"
                    rows={2}
                    className="flex-1 resize-none bg-transparent text-sm placeholder:text-muted-foreground/50 focus:outline-none leading-relaxed"
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!prompt.trim()}
                    className="cursor-pointer size-10 rounded-xl bg-foreground text-background flex items-center justify-center hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0 self-end"
                  >
                    <Send className="size-4" />
                  </button>
                </div>
              </div>

              {/* Suggested prompts */}
              <div className="grid grid-cols-2 gap-2">
                {EXAMPLE_PROMPTS.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => setPrompt(ex)}
                    className="cursor-pointer text-left text-sm px-4 py-3 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 text-muted-foreground hover:text-foreground transition-all leading-snug"
                  >
                    {ex}
                  </button>
                ))}
              </div>

              {credit !== null && (
                <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <Zap className="size-3.5 text-primary" />
                  <span>Số dư: <span className="font-semibold text-foreground">{credit.toLocaleString()}</span> credits</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Active chat state */
          <>
            <div className="flex items-center justify-between px-4 h-12 border-b border-border shrink-0">
              <div className="flex items-center gap-2">
                {credit !== null && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground ml-2">
                    <Zap className="size-3 text-primary" />
                    {credit.toLocaleString()} credits
                  </span>
                )}
              </div>
              {messages.length > 0 && (
                <button
                  onClick={handleNewWorkflow}
                  className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs font-medium hover:bg-secondary transition-colors"
                >
                  <Plus className="size-3.5" />Workflow mới
                </button>
              )}
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="px-4 py-6 space-y-4 max-w-2xl mx-auto">
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    msg={msg}
                    pageState={pageState}
                    onConfirm={handleConfirm}
                    onReject={handleReject}
                    toolMeta={toolMeta}
                  />
                ))}
                <div ref={bottomRef} />
              </div>
            </div>

            <InputBar
              prompt={prompt}
              setPrompt={setPrompt}
              images={images}
              setImages={setImages}
              isInputDisabled={isInputDisabled}
              pageState={pageState}
              model={model}
              setModel={setModel}
              onSend={handleSend}
              onOpenGallery={(key) => setGallerySlot(key)}
            />
          </>
        )}
      </div>

      {/* ── Right: History panel ── */}
      <HistoryPanel
        history={history}
        loading={historyLoading}
        collapsed={historyCollapsed}
        onToggleCollapse={() => setHistoryCollapsed((v) => !v)}
      />

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
