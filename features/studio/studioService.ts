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
  imageUrl?: string;
  assetId?: string;
}

export type TryOnCategory = 'auto' | 'tops' | 'bottoms' | 'one-pieces';
export type TryOnMode = 'quality' | 'balanced' | 'performance';

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
  // Công cụ debug nội bộ — khoá cứng ở production, dù localStorage có bị set thủ công cũng không có tác dụng.
  if (
    process.env.NODE_ENV !== 'production' &&
    typeof window !== 'undefined' &&
    localStorage.getItem('fake-ai-call') === 'true'
  ) {
    // Generate a unique fake job ID
    const jobId = `fake-job-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Try to extract an input image to return as result
    let inputImageUrl = '';
    const fileOrUrl = formData.get('modelImage') || 
                      formData.get('productImage') || 
                      formData.get('image') || 
                      formData.get('faceImage') ||
                      formData.get('imageUrl') ||
                      formData.get('productImageUrl') ||
                      formData.get('modelImageUrl') ||
                      formData.get('faceImageUrl');

    if (fileOrUrl) {
      if (fileOrUrl instanceof File) {
        inputImageUrl = URL.createObjectURL(fileOrUrl);
      } else if (typeof fileOrUrl === 'string') {
        inputImageUrl = fileOrUrl;
      }
    }

    // Save mapping in localStorage so it is accessible in status polls
    const fakeJobs = JSON.parse(localStorage.getItem('fake-jobs') || '{}');
    fakeJobs[jobId] = {
      imageUrl: inputImageUrl || '/images/after.jpg',
      startTime: Date.now()
    };
    localStorage.setItem('fake-jobs', JSON.stringify(fakeJobs));

    return { jobId, status: 'processing' } as unknown as T;
  }

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
  if (jobId.startsWith('fake-job-')) {
    const fakeJobs = JSON.parse(localStorage.getItem('fake-jobs') || '{}');
    const jobInfo = fakeJobs[jobId] || { startTime: Date.now(), imageUrl: '/images/after.jpg' };
    
    const elapsed = Date.now() - jobInfo.startTime;
    if (elapsed < 6000) { // Simulate 6 seconds of processing time
      return {
        jobId,
        status: 'processing'
      };
    } else {
      return {
        jobId,
        status: 'completed',
        imageUrl: jobInfo.imageUrl,
        assetId: `fake-asset-${Date.now()}`,
        creditsUsed: 0
      };
    }
  }

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

export interface TryOnMaxPayload {
  modelImage: File | string;
  /** garment / product image */
  garmentImage: File | string;
  resolution?: '1k' | '2k' | '4k';
  generationMode?: 'balanced' | 'quality';
  numImages?: number;
  prompt?: string;
}

export async function tryOnMax(payload: TryOnMaxPayload): Promise<AIJobStartResult> {
  const fd = new FormData();
  if (payload.modelImage instanceof File) {
    fd.append('modelImage', payload.modelImage);
  } else {
    fd.append('modelImageUrl', payload.modelImage);
  }
  if (payload.garmentImage instanceof File) {
    fd.append('productImage', payload.garmentImage);
  } else {
    fd.append('productImageUrl', payload.garmentImage);
  }
  if (payload.resolution) fd.append('resolution', payload.resolution);
  if (payload.generationMode) fd.append('generationMode', payload.generationMode);
  if (payload.numImages) fd.append('numImages', String(payload.numImages));
  if (payload.prompt) fd.append('prompt', payload.prompt);
  return startJob('/api/ai/try-on-max', fd);
}

export async function removeBackground(image: File | string): Promise<AIJobStartResult> {
  const fd = toFormData(
    image instanceof File ? { image } : { imageUrl: image }
  );
  return startJob('/api/ai/remove-background', fd);
}

export async function productToModel(options: {
  productImage: File | string;
  imagePrompt?: File | string;
  faceReference?: File | string;
  faceReferenceMode?: 'match_base' | 'match_reference';
  backgroundReference?: File | string;
  prompt?: string;
  aspectRatio?: string;
  resolution?: '1k' | '2k' | '4k';
  generationMode?: 'fast' | 'balanced' | 'quality';
  numImages?: number;
  seed?: number;
}): Promise<AIJobStartResult> {
  const fd = new FormData();

  const appendImg = (key: string, val: File | string | undefined, urlKey: string) => {
    if (!val) return;
    if (val instanceof File) fd.append(key, val); else fd.append(urlKey, val);
  };

  appendImg('productImage',        options.productImage,        'productImageUrl');
  appendImg('imagePrompt',         options.imagePrompt,         'imagePromptUrl');
  appendImg('faceReference',       options.faceReference,       'faceReferenceUrl');
  appendImg('backgroundReference', options.backgroundReference, 'backgroundReferenceUrl');

  if (options.prompt)              fd.append('prompt',              options.prompt);
  if (options.faceReferenceMode)   fd.append('faceReferenceMode',   options.faceReferenceMode);
  if (options.aspectRatio)         fd.append('aspectRatio',         options.aspectRatio);
  if (options.resolution)          fd.append('resolution',          options.resolution);
  if (options.generationMode)      fd.append('generationMode',      options.generationMode);
  if (options.numImages)           fd.append('numImages',           String(options.numImages));
  if (options.seed !== undefined)  fd.append('seed',                String(options.seed));

  return startJob('/api/ai/product-to-model', fd);
}

export async function reframe(options: {
  image: File | string;
  aspectRatio: string;
  resolution?: '1k' | '2k' | '4k';
  generationMode?: 'fast' | 'balanced' | 'quality';
  numImages?: number;
  seed?: number;
}): Promise<AIJobStartResult> {
  const fd = new FormData();
  if (options.image instanceof File) {
    fd.append('image', options.image);
  } else {
    fd.append('imageUrl', options.image);
  }
  fd.append('aspectRatio', options.aspectRatio);
  if (options.resolution)      fd.append('resolution',     options.resolution);
  if (options.generationMode)  fd.append('generationMode', options.generationMode);
  if (options.numImages && options.numImages > 1) fd.append('numImages', String(options.numImages));
  if (options.seed !== undefined) fd.append('seed',        String(options.seed));

  return startJob('/api/ai/reframe', fd);
}

export async function editImage(options: {
  image: File | string;
  prompt: string;
  mask?: File | string;
  /** Reference image providing visual context the prompt alone can't describe */
  imageContext?: File | string;
  resolution?: '1k' | '2k' | '4k';
  generationMode?: 'fast' | 'balanced' | 'quality';
  numImages?: number;
  seed?: number;
}): Promise<AIJobStartResult> {
  const fd = new FormData();

  if (options.image instanceof File) fd.append('image', options.image);
  else fd.append('imageUrl', options.image);

  fd.append('prompt', options.prompt);

  if (options.mask) {
    if (options.mask instanceof File) fd.append('mask', options.mask);
    else fd.append('maskUrl', options.mask);
  }
  if (options.imageContext) {
    if (options.imageContext instanceof File) fd.append('imageContext', options.imageContext);
    else fd.append('imageContextUrl', options.imageContext);
  }
  if (options.resolution)      fd.append('resolution',     options.resolution);
  if (options.generationMode)  fd.append('generationMode', options.generationMode);
  if (options.numImages && options.numImages > 1) fd.append('numImages', String(options.numImages));
  if (options.seed !== undefined) fd.append('seed', String(options.seed));

  return startJob('/api/ai/edit', fd);
}

export async function faceToModel(options: {
  faceImage: File | string;
  prompt?: string;
  aspectRatio?: string;
  resolution?: '1k' | '2k' | '4k';
  generationMode?: 'fast' | 'balanced' | 'quality';
  numImages?: number;
  seed?: number;
}): Promise<AIJobStartResult> {
  const fd = new FormData();
  if (options.faceImage instanceof File) {
    fd.append('faceImage', options.faceImage);
  } else {
    fd.append('faceImageUrl', options.faceImage);
  }
  if (options.prompt)          fd.append('prompt',          options.prompt);
  if (options.aspectRatio)     fd.append('aspectRatio',     options.aspectRatio);
  if (options.resolution)      fd.append('resolution',      options.resolution);
  if (options.generationMode)  fd.append('generationMode',  options.generationMode);
  if (options.numImages && options.numImages > 1) fd.append('numImages', String(options.numImages));
  if (options.seed !== undefined) fd.append('seed',         String(options.seed));
  return startJob('/api/ai/face-to-model', fd);
}

export async function modelCreate(options: {
  prompt: string;
  imageReference?: File | string;
  faceReference?: File | string;
  faceReferenceMode?: 'match_base' | 'match_reference';
  aspectRatio?: string;
  resolution?: '1k' | '2k' | '4k';
  generationMode?: 'fast' | 'balanced' | 'quality';
  numImages?: number;
  seed?: number;
}): Promise<AIJobStartResult> {
  const fd = new FormData();
  fd.append('prompt', options.prompt);
  if (options.imageReference) {
    if (options.imageReference instanceof File) fd.append('imageReference', options.imageReference);
    else fd.append('imageReferenceUrl', options.imageReference);
  }
  if (options.faceReference) {
    if (options.faceReference instanceof File) fd.append('faceReference', options.faceReference);
    else fd.append('faceReferenceUrl', options.faceReference);
  }
  if (options.faceReferenceMode) fd.append('faceReferenceMode', options.faceReferenceMode);
  if (options.aspectRatio)       fd.append('aspectRatio',       options.aspectRatio);
  if (options.resolution)        fd.append('resolution',        options.resolution);
  if (options.generationMode)    fd.append('generationMode',    options.generationMode);
  if (options.numImages)         fd.append('numImages',         String(options.numImages));
  if (options.seed !== undefined) fd.append('seed',             String(options.seed));
  return startJob('/api/ai/model-create', fd);
}

export async function modelSwap(options: {
  modelImage: File | string;
  faceReference?: File | string;
  faceReferenceMode?: 'match_base' | 'match_reference';
  prompt?: string;
  resolution?: '1k' | '2k' | '4k';
  generationMode?: 'fast' | 'balanced' | 'quality';
  numImages?: number;
  seed?: number;
}): Promise<AIJobStartResult> {
  const fd = new FormData();
  if (options.modelImage instanceof File) fd.append('modelImage', options.modelImage);
  else fd.append('modelImageUrl', options.modelImage);
  if (options.faceReference) {
    if (options.faceReference instanceof File) fd.append('faceReference', options.faceReference);
    else fd.append('faceReferenceUrl', options.faceReference);
  }
  if (options.faceReferenceMode) fd.append('faceReferenceMode', options.faceReferenceMode);
  if (options.prompt)       fd.append('prompt',         options.prompt);
  if (options.resolution)   fd.append('resolution',     options.resolution);
  if (options.generationMode) fd.append('generationMode', options.generationMode);
  if (options.numImages)    fd.append('numImages',      String(options.numImages));
  if (options.seed !== undefined) fd.append('seed',     String(options.seed));
  return startJob('/api/ai/model-swap', fd);
}

// ─── Tác vụ phụ (gợi ý prompt / verify ảnh) ───────────────────────────────────
// Không trừ credit, không phải job (trả về ngay, không cần polling).

/** `image` tuỳ chọn (file hoặc URL) — giúp AI gợi ý prompt bám sát nội dung ảnh thực tế hơn. */
export async function suggestPrompt(tool: string, userHint: string, image?: File | string): Promise<string> {
  const fd = new FormData();
  fd.append('tool', tool);
  fd.append('userHint', userHint);
  if (image instanceof File) fd.append('image', image);
  else if (image) fd.append('imageUrl', image);

  const response = await apiClient.post('/api/ai/suggest-prompt', fd);
  const json = response.data;
  if (!json.success) throw new Error(json.error || 'Gợi ý prompt thất bại');
  return json.data.prompt as string;
}

export type VerifyImageType = 'face' | 'product' | 'model' | 'background';

export interface VerifyImageResult {
  ok: boolean;
  issues: string[];
}

export async function verifyImage(image: File | string, expectedType: VerifyImageType): Promise<VerifyImageResult> {
  const fd = new FormData();
  if (image instanceof File) fd.append('image', image);
  else fd.append('imageUrl', image);
  fd.append('expectedType', expectedType);

  const response = await apiClient.post('/api/ai/verify-image', fd);
  const json = response.data;
  if (!json.success) throw new Error(json.error || 'Verify ảnh thất bại');
  return json.data as VerifyImageResult;
}

export async function imageToVideo(options: {
  image: File | string;
  prompt?: string;
  duration?: 5 | 10;
  resolution?: '480p' | '720p' | '1080p';
  /** Only sent when resolution is '1080p' */
  endImage?: File | string;
}): Promise<AIJobStartResult> {
  const fd = new FormData();
  if (options.image instanceof File) {
    fd.append('image', options.image);
  } else {
    fd.append('imageUrl', options.image);
  }
  if (options.prompt)    fd.append('prompt',    options.prompt);
  if (options.duration)  fd.append('duration',  String(options.duration));
  if (options.resolution) fd.append('resolution', options.resolution);
  if (options.endImage && options.resolution === '1080p') {
    if (options.endImage instanceof File) fd.append('endImage', options.endImage);
    else fd.append('endImageUrl', options.endImage);
  }
  return startJob('/api/ai/image-to-video', fd);
}
