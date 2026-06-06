import { Wand2, Shirt, UserCircle2, Smile, Pencil, UserPlus, Video, Maximize2, Crop } from "lucide-react";
import type { ElementType } from "react";
import { AIToolType, CREDIT_COST } from "@/constants/ai";
import type { TryOnModel, TryOnResolution } from "./types";
import type { TryOnCategory } from "@/features/studio/studioService";

export interface ToolDef {
  id: AIToolType;
  name: string;
  Icon: ElementType;
  credit: number;
}

export const TOOLS: ToolDef[] = [
  { id: AIToolType.PRODUCT_TO_MODEL, name: "Product to Model", Icon: Wand2,        credit: CREDIT_COST[AIToolType.PRODUCT_TO_MODEL] },
  { id: AIToolType.TRY_ON,           name: "Try-On",           Icon: Shirt,         credit: CREDIT_COST[AIToolType.TRY_ON] },
  { id: AIToolType.MODEL_SWAP,       name: "Model Swap",       Icon: UserCircle2,   credit: CREDIT_COST[AIToolType.MODEL_SWAP] },
  { id: AIToolType.FACE_SWAP,        name: "Face Swap",        Icon: Smile,         credit: CREDIT_COST[AIToolType.FACE_SWAP] },
  { id: AIToolType.EDIT,             name: "Edit",             Icon: Pencil,        credit: CREDIT_COST[AIToolType.EDIT] },
  { id: AIToolType.CREATE_MODEL,     name: "Create Model",     Icon: UserPlus,      credit: CREDIT_COST[AIToolType.CREATE_MODEL] },
  { id: AIToolType.IMAGE_TO_VIDEO,   name: "Image to Video",   Icon: Video,         credit: CREDIT_COST[AIToolType.IMAGE_TO_VIDEO] },
  { id: AIToolType.REFRAME,          name: "Reframe",          Icon: Crop,          credit: CREDIT_COST[AIToolType.REFRAME] },
  { id: AIToolType.UPSCALE,          name: "Image Upscale",    Icon: Maximize2,     credit: CREDIT_COST[AIToolType.UPSCALE] },
];

export const TRY_ON_CATEGORIES: { value: TryOnCategory; label: string }[] = [
  { value: "auto",       label: "Tự động" },
  { value: "tops",       label: "Áo / Tops" },
  { value: "bottoms",    label: "Quần / Bottoms" },
  { value: "one-pieces", label: "Liền thân" },
];

export interface TryOnModelDef {
  id: TryOnModel;
  name: string;
  tagline: string;
  speed: string;
  bestFor: string;
}

export const TRY_ON_MODELS: TryOnModelDef[] = [
  {
    id: "v1.6",
    name: "Try-On v1.6",
    tagline: "Nhanh · Ổn định",
    speed: "~5–17 giây",
    bestFor: "Áo/quần, realtime, chi phí thấp",
  },
  {
    id: "max",
    name: "Try-On Max",
    tagline: "Chất lượng cao",
    speed: "~20–60 giây",
    bestFor: "Catalog, portfolio, chất lượng cao",
  },
];

export const TRY_ON_RESOLUTIONS: { value: TryOnResolution; label: string }[] = [
  { value: "1k", label: "1K" },
  { value: "2k", label: "2K" },
  { value: "4k", label: "4K" },
];

export const LOADING_MESSAGES = [
  "Đang tải ảnh lên máy chủ...",
  "Fashn AI đang phân tích trang phục... 🧐",
  "AI đang cật lực render từng pixel một 💪",
  "Xử lý lâu hơn bình thường, nhưng sẽ xứng đáng! ✨",
  "Vẫn đang làm, không bỏ cuộc đâu nhé! Chờ tí... 🙏",
];

export const LOADING_TIMING_MS = [5_000, 10_000, 20_000, 30_000];

/** URL slug → AIToolType (e.g. "try-on" → AIToolType.TRY_ON) */
export const TOOL_SLUG: Record<AIToolType, string> = {
  [AIToolType.PRODUCT_TO_MODEL]: 'product-to-model',
  [AIToolType.TRY_ON]:           'try-on',
  [AIToolType.MODEL_SWAP]:       'model-swap',
  [AIToolType.FACE_SWAP]:        'face-swap',
  [AIToolType.EDIT]:             'edit',
  [AIToolType.CREATE_MODEL]:     'create-model',
  [AIToolType.IMAGE_TO_VIDEO]:   'image-to-video',
  [AIToolType.REFRAME]:          'reframe',
  [AIToolType.UPSCALE]:          'upscale',
};

export const SLUG_TO_TOOL: Record<string, AIToolType> = Object.fromEntries(
  Object.entries(TOOL_SLUG).map(([type, slug]) => [slug, type as AIToolType])
);
