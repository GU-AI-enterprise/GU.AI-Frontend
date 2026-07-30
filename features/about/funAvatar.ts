import { createAvatar } from "@dicebear/core";
import { avataaars, bottts } from "@dicebear/collection";

// Avatar hài hước sinh cục bộ (SVG, không gọi network, không phải ảnh AI giả làm người thật) —
// dùng cho trang About thay cho ảnh model AI. Cùng 1 seed + options luôn ra cùng 1 avatar.

// "Light" trong bảng màu gốc avataaars — da sáng, ánh vàng ấm, khớp mô tả "da sáng vàng" (đồng bộ cả 6 người).
const SKIN_COLOR = ["edb98a"];
const HAIR_COLOR = ["2c1b18"]; // đen/nâu sẫm

export interface PersonAvatarOptions {
  /** Kiểu tóc (enum của avataaars) — quyết định avatar trông nam/nữ. Mặc định: tóc ngắn nam. */
  top?: string[];
  /** true = có đeo kính (gọng prescription/round, không phải kính râm). */
  glasses?: boolean;
}

/** Đầu người hoạt hình kiểu avataaars — tùy chỉnh được tóc/kính, dùng cho avatar thành viên team. */
export function personAvatar(seed: string, options: PersonAvatarOptions = {}): string {
  return createAvatar(avataaars, {
    seed,
    radius: 20,
    skinColor: SKIN_COLOR,
    hairColor: HAIR_COLOR,
    facialHairProbability: 0,
    accessoriesProbability: options.glasses ? 100 : 0,
    ...(options.top ? { top: options.top } : {}),
    ...(options.glasses ? { accessories: ["prescription02"] } : {}),
  } as Parameters<typeof createAvatar>[1]).toDataUri();
}

/** Robot vui nhộn — dùng cho minh họa mang tính "AI" nhưng rõ ràng không phải ảnh người thật. */
export function botttsAvatar(seed: string): string {
  return createAvatar(bottts, { seed, radius: 20, backgroundType: ["gradientLinear"] }).toDataUri();
}
