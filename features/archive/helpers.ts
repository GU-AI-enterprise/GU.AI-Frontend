import type { DBAsset } from "./imageService";

export function formatFileSize(bytes: number): string {
  if (!bytes) return "";
  const k = 1024, sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function groupByDate(assets: DBAsset[]): Record<string, DBAsset[]> {
  return assets.reduce<Record<string, DBAsset[]>>((acc, img) => {
    const date = new Date(img.created_at).toLocaleDateString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(img);
    return acc;
  }, {});
}

export function sortDateKeys(keys: string[]): string[] {
  const toMs = (s: string) => new Date(s.split("/").reverse().join("-")).getTime();
  return [...keys].sort((a, b) => toMs(b) - toMs(a));
}
