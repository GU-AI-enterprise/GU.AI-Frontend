import { apiFetch } from '@/lib/apiFetch';

export interface UserCredit {
  current_credit: number;
  plan_type: string;
}

export interface GeneratePayload {
  prompt: string;
  aspectRatio: string;
  imageSize: string;
}

export interface GenerateResult {
  imageUrl: string;
  assetId: string;
  jobId: string;
  creditsUsed: number;
  modelUsed: string;
  keyIndex: number;
  textResponse?: string;
}

export async function getUserCredit(): Promise<UserCredit | null> {
  const res = await apiFetch('/api/users/profile');
  const json = await res.json();
  if (json.current_credit === undefined) return null;
  return { current_credit: json.current_credit, plan_type: json.plan_type };
}

export async function generateAI(payload: GeneratePayload): Promise<GenerateResult> {
  const res = await apiFetch('/api/ai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Generate thất bại');
  return json.data as GenerateResult;
}
