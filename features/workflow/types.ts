export type PageState = "idle" | "planning" | "plan_ready" | "executing" | "done";

export type ReasoningModelId = "gemini-2.5-flash" | "gemini-2.5-pro" | "gemini-2.0-flash";

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

export type MessageKind = "user" | "thinking" | "assistant" | "plan" | "executing" | "result" | "error_msg";

export interface ConversationTurn {
  role: "user" | "assistant";
  text: string;
}

export interface LibraryReference {
  id: string;
  title: string;
  image_url: string;
  category: string;
}

export interface ChatMessage {
  id: string;
  kind: MessageKind;
  text?: string;
  images?: Array<{ key: string; url: string; label: string }>;
  plan?: WorkflowPlan;
  steps?: StepData[];
  finalUrl?: string | null;
  error?: string;
  libraryMatches?: LibraryReference[];
}

export interface WorkflowHistory {
  id: string;
  prompt: string;
  status: string;
  estimated_credit: number;
  actual_credit: number | null;
  created_at: string;
}
