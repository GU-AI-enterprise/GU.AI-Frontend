export enum AIToolType {
  PRODUCT_TO_MODEL = 'product_to_model',
  TRY_ON = 'try_on',
  MODEL_SWAP = 'model_swap',
  FACE_SWAP = 'face_swap',
  EDIT = 'edit',
  CREATE_MODEL = 'create_model',
  IMAGE_TO_VIDEO = 'image_to_video',
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
  [AIToolType.PRODUCT_TO_MODEL]: 15,
  [AIToolType.TRY_ON]: 10,
  [AIToolType.MODEL_SWAP]: 12,
  [AIToolType.FACE_SWAP]: 8,
  [AIToolType.EDIT]: 5,
  [AIToolType.CREATE_MODEL]: 20,
  [AIToolType.IMAGE_TO_VIDEO]: 25,
  [AIToolType.UPSCALE]: 8,
};
