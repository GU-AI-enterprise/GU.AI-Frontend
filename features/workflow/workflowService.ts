import { apiClient } from "@/lib/apiFetch";
import type { WorkflowHistory, WorkflowPlan, StepData, ConversationTurn, ReasoningModelId } from "./types";

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
