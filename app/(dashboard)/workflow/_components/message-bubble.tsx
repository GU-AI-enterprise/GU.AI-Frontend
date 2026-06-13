"use client";

import React from "react";
import {
  Sparkles, Check, X, Loader2, AlertCircle, Download,
} from "lucide-react";
import { TOOL_LABELS, TOOL_CREDIT, INPUT_KEY_LABELS, formatInputVal } from "./constants";
import type { ChatMessage, PageState, StepData } from "./types";

// ── Assistant Avatar ───────────────────────────────────────────────────────────

export function AssistantAvatar() {
  return (
    <div className="size-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
      <Sparkles className="size-3.5 text-primary" />
    </div>
  );
}

// ── Status Badge ───────────────────────────────────────────────────────────────

export function StatusBadge({ status }: { status: string }) {
  if (status === "completed")
    return <span className="text-[10px] font-medium text-green-600 bg-green-50 dark:bg-green-950/40 px-1.5 py-0.5 rounded-full">Xong</span>;
  if (status === "failed")
    return <span className="text-[10px] font-medium text-red-500 bg-red-50 dark:bg-red-950/40 px-1.5 py-0.5 rounded-full">Lỗi</span>;
  if (status === "processing")
    return <span className="text-[10px] font-medium text-blue-500 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded-full">Đang chạy</span>;
  return <span className="text-[10px] font-medium text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-full">{status}</span>;
}

// ── Mini Step Row ──────────────────────────────────────────────────────────────

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

interface Props {
  msg: ChatMessage;
  pageState: PageState;
  onConfirm: () => void;
  onReject: () => void;
}

export function MessageBubble({ msg, pageState, onConfirm, onReject }: Props) {
  const [showJson, setShowJson] = React.useState(false);

  if (msg.kind === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] flex flex-col items-end gap-2">
          {msg.images && msg.images.length > 0 && (
            <div className="flex gap-2 flex-wrap justify-end">
              {msg.images.map(({ key, url, label }) => (
                <div key={key} className="relative">
                  <img src={url} alt={label} className="size-16 rounded-xl object-cover border border-border shadow-sm" />
                  <span className="absolute bottom-0 left-0 right-0 text-[9px] text-center bg-black/60 text-white rounded-b-[10px] px-0.5 py-0.5">
                    {label}
                  </span>
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

  if (msg.kind === "assistant") {
    return (
      <div className="flex items-start gap-2">
        <AssistantAvatar />
        <div className="max-w-[85%] bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
        </div>
      </div>
    );
  }

  if (msg.kind === "thinking") {
    return (
      <div className="flex items-start gap-2">
        <AssistantAvatar />
        <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-3">
          <img src="/animation/studio_animation_speedup.gif" alt="" className="size-8 rounded-lg object-cover" />
          <span className="text-sm text-muted-foreground">Đang phân tích và lên kế hoạch…</span>
        </div>
      </div>
    );
  }

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
                  {i < msg.plan!.steps.length - 1 && (
                    <div className="w-0.5 h-6 mt-1 bg-border rounded-full" />
                  )}
                </div>
                <div className="flex-1 pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium">{TOOL_LABELS[step.tool] ?? step.tool}</span>
                    <span className="text-[10px] font-semibold text-primary shrink-0">{TOOL_CREDIT[step.tool] ?? 0} credits</span>
                  </div>
                  {step.reason && <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{step.reason}</p>}
                  {step.params?.prompt != null && (
                    <p className="text-[11px] text-muted-foreground/70 mt-0.5 italic">"{String(step.params.prompt)}"</p>
                  )}
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
                <button
                  onClick={onReject}
                  className="cursor-pointer flex-1 h-9 rounded-xl border border-border text-xs font-medium hover:bg-secondary transition-colors"
                >
                  Làm lại
                </button>
                <button
                  onClick={onConfirm}
                  className="cursor-pointer flex-[2] h-9 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
                >
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

  if (msg.kind === "executing" || msg.kind === "result") {
    const isComplete = msg.kind === "result";
    return (
      <div className="flex items-start gap-2">
        <AssistantAvatar />
        <div className="flex-1 max-w-[90%] bg-card border border-border rounded-2xl rounded-bl-sm overflow-hidden">
          <div className={`px-4 py-2.5 border-b border-border/60 flex items-center gap-2.5 ${isComplete ? "bg-green-500/10" : "bg-primary/5"}`}>
            {isComplete
              ? <Check className="size-3.5 text-green-500" />
              : <img src="/animation/studio_animation_speedup.gif" alt="" className="size-6 rounded object-cover" />}
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
