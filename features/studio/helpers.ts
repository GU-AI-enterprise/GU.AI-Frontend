import type { StudioImage, TryOnModel, TryOnResolution, GenResolution, GenMode } from "./types";

export function fileToStudioImage(file: File): StudioImage {
  return { id: Math.random().toString(36).substr(2, 9), url: URL.createObjectURL(file), file };
}

export function urlToStudioImage(url: string): StudioImage {
  return { id: Math.random().toString(36).substr(2, 9), url };
}

export function computeEditCost(
  genMode: GenMode = 'balanced',
  resolution: GenResolution = '1k',
  numImages = 1,
): number {
  const table: Record<GenMode, Record<GenResolution, number>> = {
    fast:     { '1k': 1, '2k': 2, '4k': 3 },
    balanced: { '1k': 2, '2k': 3, '4k': 4 },
    quality:  { '1k': 3, '2k': 4, '4k': 5 },
  };
  return (table[genMode]?.[resolution] ?? 4) * Math.max(1, Math.min(4, numImages));
}

export function computeModelCreateCost(
  genMode: GenMode = 'balanced',
  resolution: GenResolution = '1k',
  numImages = 1,
  hasFaceRef = false,
): number {
  const table: Record<GenMode, Record<GenResolution, number>> = {
    fast:     { '1k': 1, '2k': 2, '4k': 3 },
    balanced: { '1k': 2, '2k': 3, '4k': 4 },
    quality:  { '1k': 3, '2k': 4, '4k': 5 },
  };
  const base = table[genMode]?.[resolution] ?? 4;
  return (base + (hasFaceRef ? 6 : 0)) * Math.max(1, Math.min(4, numImages));
}

export function computeVideoCost(duration: 5 | 10 = 5, resolution: string = '720p'): number {
  const table: Record<number, Record<string, number>> = {
    5:  { '480p': 1, '720p': 3,  '1080p': 6 },
    10: { '480p': 2, '720p': 6, '1080p': 12 },
  };
  return table[duration]?.[resolution] ?? 6;
}

export function computeReframeCost(
  genMode: GenMode = 'balanced',
  resolution: GenResolution = '1k',
  numImages = 1,
): number {
  const table: Record<GenMode, Record<GenResolution, number>> = {
    fast:     { '1k': 1, '2k': 4, '4k': 6 },
    balanced: { '1k': 2, '2k': 3, '4k': 4 },
    quality:  { '1k': 3, '2k': 4, '4k': 5 },
  };
  return (table[genMode]?.[resolution] ?? 4) * Math.max(1, Math.min(4, numImages));
}

export function computeVariableCost(
  genMode: GenMode | 'fast' = 'balanced',
  resolution: GenResolution = '1k',
  numImages = 1,
  hasFaceRef = false,
): number {
  const table: Record<string, Record<GenResolution, number>> = {
    fast:     { '1k': 1, '2k': 2, '4k': 3 },
    balanced: { '1k': 2, '2k': 3, '4k': 4 },
    quality:  { '1k': 3, '2k': 4, '4k': 5 },
  };
  const base = table[genMode]?.[resolution] ?? 4;
  return (base + (hasFaceRef ? 6 : 0)) * Math.max(1, Math.min(4, numImages));
}

export function computeTryOnCost(model: TryOnModel, mode: string, resolution: TryOnResolution): number {
  if (model === "v1.6") return 1;
  const table: Record<string, Record<TryOnResolution, number>> = {
    balanced:    { "1k": 2,  "2k": 3,  "4k": 4  },
    quality:     { "1k": 3,  "2k": 4,  "4k": 5 },
  };
  return table[mode]?.[resolution] ?? 4;
}
