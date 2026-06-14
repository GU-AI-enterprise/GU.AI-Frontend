import type { ReasoningModelId } from "./types";
export { timeAgo } from "@/lib/utils";

export const REASONING_MODELS: Array<{
  id: ReasoningModelId;
  label: string;
  badge: string;
  description: string;
}> = [
  {
    id: "gemini-2.5-flash",
    label: "2.5 Flash",
    badge: "Nhanh",
    description: "Phân tích nhanh · Tiết kiệm",
  },
  {
    id: "gemini-2.5-pro",
    label: "2.5 Pro",
    badge: "Tốt nhất",
    description: "Suy luận sâu · Chính xác cao",
  },
  {
    id: "gemini-2.0-flash",
    label: "2.0 Flash",
    badge: "Ổn định",
    description: "Tốc độ cao · Ổn định",
  },
];

export const DEFAULT_REASONING_MODEL: ReasoningModelId = "gemini-2.5-flash";

export const TOOL_LABELS: Record<string, string> = {
  remove_background: "Xóa nền",
  product_to_model:  "Tạo người mẫu",
  try_on:            "Mặc thử",
  try_on_max:        "Mặc thử (Max)",
  edit_image:        "Chỉnh sửa ảnh",
  reframe:           "Đóng khung",
  face_to_model:     "Tạo mẫu từ khuôn mặt",
  model_create:      "Tạo người mẫu AI",
  model_swap:        "Đổi người mẫu",
  image_to_video:    "Ảnh sang Video",
};

export const TOOL_CREDIT: Record<string, number> = {
  remove_background: 2,
  product_to_model:  4,
  try_on:            2,
  try_on_max:        10,
  edit_image:        4,
  reframe:           4,
  face_to_model:     4,
  model_create:      4,
  model_swap:        4,
  image_to_video:    12,
};

export const IMAGE_SLOTS = [
  { key: "product_image", label: "Sản phẩm", hint: "Áo, quần, váy..." },
  { key: "model_image",   label: "Người mẫu", hint: "Ảnh người mặc thử" },
  { key: "face_image",    label: "Khuôn mặt", hint: "Tham chiếu mặt" },
];

export const EXAMPLE_PROMPTS = [
  "Xóa nền ảnh sản phẩm rồi đặt lên người mẫu AI",
  "Tạo người mẫu từ khuôn mặt rồi mặc thử trang phục",
  "Mặc thử trang phục lên người mẫu đã cung cấp",
  "Đặt sản phẩm lên người mẫu rồi chuyển thành video",
];

export const INPUT_KEY_LABELS: Record<string, string> = {
  image:            "Ảnh",
  garment_image:    "Trang phục",
  model_image:      "Người mẫu",
  face_image:       "Khuôn mặt",
  product_image:    "Sản phẩm",
  background_image: "Nền",
  target_image:     "Ảnh đích",
  source_image:     "Ảnh nguồn",
};

export function formatInputVal(val: string): string {
  if (val === "$product_image") return "ảnh sản phẩm";
  if (val === "$model_image")   return "ảnh người mẫu";
  if (val === "$face_image")    return "ảnh khuôn mặt";
  const m = val.match(/^\$step_(\d+)_output$/);
  if (m) return `kết quả bước ${parseInt(m[1]) + 1}`;
  return val;
}
