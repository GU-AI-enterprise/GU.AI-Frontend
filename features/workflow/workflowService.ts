import { apiClient } from "@/lib/apiFetch";
import { supabase } from "@/lib/supabase";
import type { WorkflowHistory, WorkflowPlan, StepData, ConversationTurn, ReasoningModelId } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function fetchWorkflowHistory(): Promise<WorkflowHistory[]> {
  const res = await apiClient.get("/api/workflow");
  if (!res.data.success) return [];
  return res.data.data ?? [];
}

export async function fetchWorkflowTools(): Promise<Record<string, { label: string; credit: number }>> {
  const res = await apiClient.get("/api/workflow/tools");
  if (!res.data.success) return {};
  const map: Record<string, { label: string; credit: number }> = {};
  for (const t of res.data.data) {
    if (t.tool_key) map[t.tool_key] = { label: t.display_name, credit: t.base_credit };
  }
  return map;
}

export async function chatWithWorkflow(payload: {
  message: string;
  userInputUrls: Record<string, string>;
  model: ReasoningModelId;
  history: ConversationTurn[];
}): Promise<{ message: string; plan: WorkflowPlan | null }> {
  const res = await apiClient.post("/api/workflow/chat", payload);
  if (!res.data.success) throw new Error(res.data.error ?? "Lỗi không xác định");
  return res.data.data as { message: string; plan: WorkflowPlan | null };
}

export type WorkflowStreamEvent =
  | { type: "delta"; text: string }
  | { type: "planning" }
  | { type: "done"; message: string; plan: WorkflowPlan | null; model: string }
  | { type: "error"; error: string };

/**
 * Same as chatWithWorkflow, but consumes the backend's SSE stream so the assistant's
 * prose reply can be rendered token-by-token instead of waiting for the full response.
 * Uses native fetch (not axios) — axios can't expose an incremental ReadableStream in the browser.
 */
export async function chatWithWorkflowStream(
  payload: {
    message: string;
    userInputUrls: Record<string, string>;
    model: ReasoningModelId;
    history: ConversationTurn[];
  },
  onEvent: (event: WorkflowStreamEvent) => void,
): Promise<{ message: string; plan: WorkflowPlan | null }> {
  const { data: { session } } = await supabase.auth.getSession();

  const res = await fetch(`${API_URL}/api/workflow/chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok || !res.body) {
    throw new Error(`Lỗi kết nối stream (HTTP ${res.status})`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let result: { message: string; plan: WorkflowPlan | null } | null = null;
  let streamError: string | null = null;

  outer: while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let sepIdx: number;
    while ((sepIdx = buffer.indexOf("\n\n")) !== -1) {
      const rawEvent = buffer.slice(0, sepIdx).trim();
      buffer = buffer.slice(sepIdx + 2);
      if (!rawEvent.startsWith("data:")) continue;

      const jsonStr = rawEvent.slice(5).trim();
      if (!jsonStr) continue;
      try {
        const event = JSON.parse(jsonStr) as WorkflowStreamEvent;
        onEvent(event);
        if (event.type === "done") {
          result = { message: event.message, plan: event.plan };
        } else if (event.type === "error") {
          streamError = event.error;
        }
      } catch {
        // Ignore malformed/partial SSE chunk
      }
      if (streamError) break outer;
    }
  }

  if (streamError) throw new Error(streamError);
  if (!result) throw new Error("Stream kết thúc không có dữ liệu");
  return result;
}

export async function executeWorkflow(payload: {
  prompt: string;
  plan: WorkflowPlan;
  userInputUrls: Record<string, string>;
}): Promise<{ workflowId: string }> {
  const res = await apiClient.post("/api/workflow/execute", payload);
  if (!res.data.success) throw new Error(res.data.error ?? "Lỗi không xác định");
  return res.data.data as { workflowId: string };
}

export async function getWorkflowStatus(workflowId: string): Promise<{
  workflow: { status: string; error_message?: string };
  steps: StepData[];
}> {
  const res = await apiClient.get(`/api/workflow/${workflowId}`);
  if (!res.data.success) throw new Error("Poll error");
  return res.data.data;
}
