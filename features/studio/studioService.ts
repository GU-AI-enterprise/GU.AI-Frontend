import { apiFetch, apiClient } from '@/lib/apiFetch';

// ─── Types ────────────────────────────────────────────────────────────────────

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

/** Kết quả trả về ngay sau khi submit một AI job (202) */
export interface AIJobStartResult {
  jobId: string;
  status: 'processing';
}

/** Trạng thái job khi polling GET /api/ai/jobs/:jobId */
export interface AIJobStatusResult {
  jobId: string;
  status: 'processing' | 'completed' | 'failed';
  type?: string;
  creditsUsed?: number;
  error?: string | null;
}

export type TryOnCategory = 'auto' | 'tops' | 'bottoms' | 'one-pieces';
export type TryOnMode = 'quality' | 'balanced' | 'speed';

export interface TryOnPayload {
  /** File upload hoặc URL */
  modelImage: File | string;
  garmentImage: File | string;
  category: TryOnCategory;
  mode?: TryOnMode;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toFormData(entries: Record<string, File | string | undefined>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    if (value !== undefined) fd.append(key, value);
  }
  return fd;
}

async function startJob<T = AIJobStartResult>(path: string, formData: FormData): Promise<T> {
  // apiClient interceptor already attaches the Bearer token automatically
  const response = await apiClient.post(path, formData);
  const json = response.data;
  if (!json.success) throw new Error(json.error || 'AI job thất bại');
  return json.data as T;
}

// ─── Credit ───────────────────────────────────────────────────────────────────

export async function getUserCredit(): Promise<UserCredit | null> {
  const res = await apiFetch('/api/users/profile');
  const json = await res.json();
  if (json.current_credit === undefined) return null;
  return { current_credit: json.current_credit, plan_type: json.plan_type };
}

// ─── Legacy generate (text-to-image) ─────────────────────────────────────────

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

// ─── Job status polling ───────────────────────────────────────────────────────

export async function getJobStatus(jobId: string): Promise<AIJobStatusResult> {
  const res = await apiFetch(`/api/ai/jobs/${jobId}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Không thể lấy trạng thái job');
  return json.data as AIJobStatusResult;
}

// ─── AI features ──────────────────────────────────────────────────────────────

export async function tryOn(payload: TryOnPayload): Promise<AIJobStartResult> {
  const fd = new FormData();
  if (payload.modelImage instanceof File) {
    fd.append('modelImage', payload.modelImage);
  } else {
    fd.append('modelImageUrl', payload.modelImage);
  }
  if (payload.garmentImage instanceof File) {
    fd.append('garmentImage', payload.garmentImage);
  } else {
    fd.append('garmentImageUrl', payload.garmentImage);
  }
  fd.append('category', payload.category);
  if (payload.mode) fd.append('mode', payload.mode);

  return startJob('/api/ai/try-on', fd);
}

export async function removeBackground(image: File | string): Promise<AIJobStartResult> {
  const fd = toFormData(
    image instanceof File ? { image } : { imageUrl: image }
  );
  return startJob('/api/ai/remove-background', fd);
}

export async function productToModel(options: {
  productImage: File | string;
  prompt?: string;
  aspectRatio?: string;
  resolution?: '1k' | '2k' | '4k';
  generationMode?: 'fast' | 'balanced' | 'quality';
  faceReferenceUrl?: string;
}): Promise<AIJobStartResult> {
  const fd = new FormData();
  if (options.productImage instanceof File) {
    fd.append('productImage', options.productImage);
  } else {
    fd.append('productImageUrl', options.productImage);
  }
  if (options.prompt) fd.append('prompt', options.prompt);
  if (options.aspectRatio) fd.append('aspectRatio', options.aspectRatio);
  if (options.resolution) fd.append('resolution', options.resolution);
  if (options.generationMode) fd.append('generationMode', options.generationMode);
  if (options.faceReferenceUrl) fd.append('faceReferenceUrl', options.faceReferenceUrl);

  return startJob('/api/ai/product-to-model', fd);
}

export async function reframe(options: {
  image: File | string;
  aspectRatio: string;
  resolution?: '1k' | '2k' | '4k';
}): Promise<AIJobStartResult> {
  const fd = new FormData();
  if (options.image instanceof File) {
    fd.append('image', options.image);
  } else {
    fd.append('imageUrl', options.image);
  }
  fd.append('aspectRatio', options.aspectRatio);
  if (options.resolution) fd.append('resolution', options.resolution);

  return startJob('/api/ai/reframe', fd);
}

export async function editImage(options: {
  image: File | string;
  prompt: string;
  mask?: File | string;
  resolution?: '1k' | '2k' | '4k';
  generationMode?: 'fast' | 'balanced' | 'quality';
}): Promise<AIJobStartResult> {
  const fd = new FormData();
  if (options.image instanceof File) {
    fd.append('image', options.image);
  } else {
    fd.append('imageUrl', options.image);
  }
  fd.append('prompt', options.prompt);
  if (options.mask) {
    if (options.mask instanceof File) {
      fd.append('mask', options.mask);
    } else {
      fd.append('maskUrl', options.mask);
    }
  }
  if (options.resolution) fd.append('resolution', options.resolution);
  if (options.generationMode) fd.append('generationMode', options.generationMode);

  return startJob('/api/ai/edit', fd);
}
