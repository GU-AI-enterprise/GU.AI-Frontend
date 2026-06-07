export enum AIToolType {
  PRODUCT_TO_MODEL = 'product_to_model',
  TRY_ON = 'try_on',
  MODEL_SWAP = 'model_swap',
  FACE_TO_MODEL = 'face_to_model',
  EDIT = 'edit',
  CREATE_MODEL = 'create_model',
  IMAGE_TO_VIDEO = 'image_to_video',
  REFRAME = 'reframe',
  UPSCALE = 'upscale',
}

export enum AIJobStatus {
  QUEUED = 'queued',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export const CREDIT_COST: Record<AIToolType, number> = {
  [AIToolType.PRODUCT_TO_MODEL]: 4,   // balanced/1k; dynamic in studio
  [AIToolType.TRY_ON]: 2,             // v1.6 fixed: 1 Fashn × 2
  [AIToolType.MODEL_SWAP]: 4,         // balanced/1k no faceRef; dynamic in studio
  [AIToolType.FACE_TO_MODEL]: 2,      // balanced/1k; dynamic in studio
  [AIToolType.EDIT]: 4,               // balanced/1k; dynamic in studio
  [AIToolType.CREATE_MODEL]: 4,       // balanced/1k no faceRef; dynamic in studio
  [AIToolType.IMAGE_TO_VIDEO]: 12,    // 5s/1080p; dynamic in studio
  [AIToolType.REFRAME]: 4,            // balanced/1k; dynamic in studio
  [AIToolType.UPSCALE]: 8,
};
