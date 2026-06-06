import type { StudioImage, TryOnModel, TryOnResolution, GenResolution, GenMode } from "./types";

export function fileToStudioImage(file: File): StudioImage {
  return { id: Math.random().toString(36).substr(2, 9), url: URL.createObjectURL(file), file };
}

export function urlToStudioImage(url: string): StudioImage {
  return { id: Math.random().toString(36).substr(2, 9), url };
}

/** Dynamic credit cost for Edit — fast/balanced/quality × 1k/2k/4k × numImages */
export function computeEditCost(
  genMode: GenMode = 'balanced',
  resolution: GenResolution = '1k',
  numImages = 1,
): number {
  const table: Record<GenMode, Record<GenResolution, number>> = {
    fast:     { '1k': 2, '2k': 4, '4k': 6 },
    balanced: { '1k': 4, '2k': 6, '4k': 8 },
    quality:  { '1k': 6, '2k': 8, '4k': 10 },
  };
  return (table[genMode]?.[resolution] ?? 4) * Math.max(1, Math.min(4, numImages));
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
