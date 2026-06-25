import { apiClient } from "@/lib/apiFetch";

export type PlanTier = "free" | "basic" | "pro" | "agency";

export interface AppModel {
  id: string;
  name: string;
  image_url: string;
  gender: "male" | "female" | "unisex" | null;
  tags: string[] | null;
  required_tier: PlanTier;
  display_order: number;
  is_active: boolean;
  unlocked: boolean;
}

export async function getAppModels(): Promise<AppModel[]> {
  const res = await apiClient.get("/api/models");
  if (!res.data.success) throw new Error(res.data.error ?? "Lỗi lấy danh sách người mẫu");
  return res.data.data as AppModel[];
}
