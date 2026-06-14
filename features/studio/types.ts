export interface StudioImage {
  id: string;
  url: string;
  file?: File;
}

export type TryOnModel = "v1.6" | "max";
export type TryOnResolution = "1k" | "2k" | "4k";
export type GenResolution = "1k" | "2k" | "4k";
export type GenMode = "fast" | "balanced" | "quality";
export type FaceRefMode = "match_base" | "match_reference";
export type VideoDuration = 5 | 10;
export type VideoResolution = "480p" | "720p" | "1080p";
