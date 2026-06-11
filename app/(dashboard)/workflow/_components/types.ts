export type PageState = "idle" | "planning" | "plan_ready" | "executing" | "done";

export interface PlanStep {
  tool: string;
  inputs: Record<string, string>;
  params?: Record<string, unknown>;
  reason?: string;
}

export interface WorkflowPlan {
  goal: string;
  steps: PlanStep[];
  estimatedNote?: string;
  totalEstimatedCredit: number;
}

export interface StepData {
  id: string;
  step_index: number;
  tool_name: string;
  status: "pending" | "processing" | "completed" | "failed";
  output_url?: string | null;
  error_message?: string | null;
}

export type MessageKind = "user" | "thinking" | "plan" | "executing" | "result" | "error_msg";

export interface ChatMessage {
  id: string;
  kind: MessageKind;
  text?: string;
  images?: Array<{ key: string; url: string; label: string }>;
  plan?: WorkflowPlan;
  steps?: StepData[];
  finalUrl?: string | null;
  error?: string;
}

export interface WorkflowHistory {
  id: string;
  prompt: string;
  status: string;
  estimated_credit: number;
  actual_credit: number | null;
  created_at: string;
}
