import type { StudioImage, TryOnModel, TryOnResolution } from "./types";

export function fileToStudioImage(file: File): StudioImage {
  return { id: Math.random().toString(36).substr(2, 9), url: URL.createObjectURL(file), file };
}

export function urlToStudioImage(url: string): StudioImage {
  return { id: Math.random().toString(36).substr(2, 9), url };
}

export function computeTryOnCost(model: TryOnModel, mode: string, resolution: TryOnResolution): number {
  if (model === "v1.6") return 1;
  const table: Record<string, Record<TryOnResolution, number>> = {
    balanced: { "1k": 2, "2k": 3, "4k": 4 },
    quality:  { "1k": 3, "2k": 4, "4k": 5 },
    speed:    { "1k": 2, "2k": 3, "4k": 4 },
  };
  return table[mode]?.[resolution] ?? 2;
}
