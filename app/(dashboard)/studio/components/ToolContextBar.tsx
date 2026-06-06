"use client";

import { AIToolType } from "@/constants/ai";
import { TRY_ON_CATEGORIES, TRY_ON_MODELS, TRY_ON_RESOLUTIONS } from "../constants";
import { computeTryOnCost } from "../helpers";
import type {
  TryOnModel, TryOnResolution, GenResolution, GenMode, FaceRefMode,
  VideoDuration, VideoResolution,
} from "../types";
import type { TryOnCategory } from "@/features/studio/studioService";

const RESOLUTIONS: GenResolution[] = ["1k", "2k", "4k"];
const GEN_MODES: GenMode[] = ["fast", "balanced", "quality"];
const FACE_REF_MODES: { value: FaceRefMode; label: string }[] = [
  { value: "match_reference", label: "giống nhất" },
  { value: "match_base",      label: "cân bằng" },
];
const ASPECT_RATIOS = ["1:1", "3:4", "4:5", "9:16", "16:9"];

const pill = (active: boolean) =>
  `px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
    active
      ? "bg-foreground text-background"
      : "bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary"
  }`;

const lbl = "text-[10px] text-muted-foreground shrink-0";
const row = "flex items-center gap-1.5 flex-wrap";
const inputCls =
  "w-full h-8 px-0 text-sm bg-transparent border-0 focus:outline-none focus:ring-0 placeholder:text-muted-foreground/50";

export interface ToolContextBarProps {
  selectedTool: AIToolType;
  // Try-On
  toCategory: TryOnCategory;
  toModel: TryOnModel;
  toResolution: TryOnResolution;
  toHovered: TryOnModel | null;
  onToCategoryChange: (v: TryOnCategory) => void;
  onToModelChange: (v: TryOnModel) => void;
  onToResolutionChange: (v: TryOnResolution) => void;
  onToHoveredChange: (v: TryOnModel | null) => void;
  // Product to Model
  p2mPrompt: string;
  p2mAspect: string;
  p2mRes: GenResolution;
  p2mGenMode: GenMode;
  p2mFaceMode: FaceRefMode;
  p2mHasFaceRef: boolean;
  onP2mPromptChange: (v: string) => void;
  onP2mAspectChange: (v: string) => void;
  onP2mResChange: (v: GenResolution) => void;
  onP2mGenModeChange: (v: GenMode) => void;
  onP2mFaceModeChange: (v: FaceRefMode) => void;
  // Model Swap
  msPrompt: string;
  msRes: GenResolution;
  msGenMode: GenMode;
  msFaceMode: FaceRefMode;
  msHasFaceRef: boolean;
  onMsPromptChange: (v: string) => void;
  onMsResChange: (v: GenResolution) => void;
  onMsGenModeChange: (v: GenMode) => void;
  onMsFaceModeChange: (v: FaceRefMode) => void;
  // Face Swap
  fsRes: GenResolution;
  fsFaceMode: FaceRefMode;
  onFsResChange: (v: GenResolution) => void;
  onFsFaceModeChange: (v: FaceRefMode) => void;
  // Edit
  editRes: GenResolution;
  editGenMode: GenMode;
  editNumImages: number;
  editSeed: string;
  onEditResChange: (v: GenResolution) => void;
  onEditGenModeChange: (v: GenMode) => void;
  onEditNumImagesChange: (v: number) => void;
  onEditSeedChange: (v: string) => void;
  // Create Model / Image to Video (generic prompt)
  genericPrompt: string;
  videoDuration: VideoDuration;
  videoRes: VideoResolution;
  onGenericPromptChange: (v: string) => void;
  onVideoDurationChange: (v: VideoDuration) => void;
  onVideoResChange: (v: VideoResolution) => void;
}

export function ToolContextBar({
  selectedTool,
  toCategory, toModel, toResolution, toHovered,
  onToCategoryChange, onToModelChange, onToResolutionChange, onToHoveredChange,
  p2mPrompt, p2mAspect, p2mRes, p2mGenMode, p2mFaceMode, p2mHasFaceRef,
  onP2mPromptChange, onP2mAspectChange, onP2mResChange, onP2mGenModeChange, onP2mFaceModeChange,
  msPrompt, msRes, msGenMode, msFaceMode, msHasFaceRef,
  onMsPromptChange, onMsResChange, onMsGenModeChange, onMsFaceModeChange,
  fsRes, fsFaceMode, onFsResChange, onFsFaceModeChange,
  editRes, editGenMode, editNumImages, editSeed,
  onEditResChange, onEditGenModeChange, onEditNumImagesChange, onEditSeedChange,
  genericPrompt, videoDuration, videoRes,
  onGenericPromptChange, onVideoDurationChange, onVideoResChange,
}: ToolContextBarProps) {

  // ── Try-On ────────────────────────────────────────────────────────────────
  if (selectedTool === AIToolType.TRY_ON) {
    const display = toHovered ?? toModel;
    const info = TRY_ON_MODELS.find((m) => m.id === display);
    return (
      <div className="border border-border/60 rounded-2xl px-3 py-2.5 flex flex-col gap-2">
        <div className={row}>
          <span className={`${lbl} w-9`}>Loại:</span>
          {TRY_ON_CATEGORIES.map((c) => (
            <button key={c.value} onClick={() => onToCategoryChange(c.value)} className={pill(toCategory === c.value)}>
              {c.label}
            </button>
          ))}
        </div>
        <div className="flex items-start gap-2">
          <span className={`${lbl} w-9 pt-1.5`}>AI:</span>
          <div className="flex flex-col gap-1.5 flex-1">
            <div className={row}>
              {TRY_ON_MODELS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => onToModelChange(m.id)}
                  onMouseEnter={() => onToHoveredChange(m.id)}
                  onMouseLeave={() => onToHoveredChange(null)}
                  className={`flex items-center gap-1.5 ${pill(toModel === m.id)}`}
                >
                  {m.name}
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                    toModel === m.id ? "bg-background/15 text-background/80" : "bg-primary/10 text-primary"
                  }`}>
                    {m.id === "v1.6" ? "1 cr" : `${computeTryOnCost("max", "balanced", toResolution)} cr`}
                  </span>
                </button>
              ))}
              {toModel === "max" && TRY_ON_RESOLUTIONS.map((r) => (
                <button key={r.value} onClick={() => onToResolutionChange(r.value)} className={pill(toResolution === r.value)}>
                  {r.label}
                </button>
              ))}
            </div>
            {info && (
              <p className="text-[10px] text-muted-foreground">
                <span className="text-foreground font-medium">{info.tagline}</span>
                {" · "}{info.speed}{" · "}{info.bestFor}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Product to Model ──────────────────────────────────────────────────────
  if (selectedTool === AIToolType.PRODUCT_TO_MODEL) {
    return (
      <div className="border border-border/60 rounded-2xl px-3 py-2 space-y-2">
        <input
          value={p2mPrompt}
          onChange={(e) => onP2mPromptChange(e.target.value)}
          placeholder='Mô tả thêm: "professional office", "man casual", "studio white background"... (tuỳ chọn)'
          className={inputCls}
        />
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          <div className={row}>
            <span className={lbl}>Tỉ lệ:</span>
            {ASPECT_RATIOS.map((r) => (
              <button key={r} onClick={() => onP2mAspectChange(r)} className={pill(p2mAspect === r)}>{r}</button>
            ))}
          </div>
          <div className={row}>
            <span className={lbl}>Res:</span>
            {RESOLUTIONS.map((r) => (
              <button key={r} onClick={() => onP2mResChange(r)} className={pill(p2mRes === r)}>{r}</button>
            ))}
          </div>
          <div className={row}>
            <span className={lbl}>Mode:</span>
            {GEN_MODES.map((m) => (
              <button key={m} onClick={() => onP2mGenModeChange(m)} className={pill(p2mGenMode === m)}>{m}</button>
            ))}
          </div>
          {p2mHasFaceRef && (
            <div className={row}>
              <span className={lbl}>Face:</span>
              {FACE_REF_MODES.map((m) => (
                <button key={m.value} onClick={() => onP2mFaceModeChange(m.value)} className={pill(p2mFaceMode === m.value)}>{m.label}</button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Model Swap ────────────────────────────────────────────────────────────
  if (selectedTool === AIToolType.MODEL_SWAP) {
    return (
      <div className="border border-border/60 rounded-2xl px-3 py-2 space-y-2">
        <input
          value={msPrompt}
          onChange={(e) => onMsPromptChange(e.target.value)}
          placeholder='Mô tả thêm: "same pose", "outdoor", "studio lighting"... (tuỳ chọn)'
          className={inputCls}
        />
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          <div className={row}>
            <span className={lbl}>Res:</span>
            {RESOLUTIONS.map((r) => (
              <button key={r} onClick={() => onMsResChange(r)} className={pill(msRes === r)}>{r}</button>
            ))}
          </div>
          <div className={row}>
            <span className={lbl}>Mode:</span>
            {GEN_MODES.map((m) => (
              <button key={m} onClick={() => onMsGenModeChange(m)} className={pill(msGenMode === m)}>{m}</button>
            ))}
          </div>
          {msHasFaceRef && (
            <div className={row}>
              <span className={lbl}>Face:</span>
              {FACE_REF_MODES.map((m) => (
                <button key={m.value} onClick={() => onMsFaceModeChange(m.value)} className={pill(msFaceMode === m.value)}>{m.label}</button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Face Swap ─────────────────────────────────────────────────────────────
  if (selectedTool === AIToolType.FACE_SWAP) {
    return (
      <div className="border border-border/60 rounded-2xl px-3 py-2">
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          <div className={row}>
            <span className={lbl}>Res:</span>
            {RESOLUTIONS.map((r) => (
              <button key={r} onClick={() => onFsResChange(r)} className={pill(fsRes === r)}>{r}</button>
            ))}
          </div>
          <div className={row}>
            <span className={lbl}>Face:</span>
            {FACE_REF_MODES.map((m) => (
              <button key={m.value} onClick={() => onFsFaceModeChange(m.value)} className={pill(fsFaceMode === m.value)}>{m.label}</button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Edit ──────────────────────────────────────────────────────────────────
  if (selectedTool === AIToolType.EDIT) {
    return (
      <div className="border border-border/60 rounded-2xl px-3 py-2 space-y-2">
        <input
          value={genericPrompt}
          onChange={(e) => onGenericPromptChange(e.target.value)}
          placeholder='Mô tả thay đổi: "add a black leather bag", "turn slightly left", "studio lighting"...'
          className={inputCls}
        />
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          <div className={row}>
            <span className={lbl}>Res:</span>
            {RESOLUTIONS.map((r) => (
              <button key={r} onClick={() => onEditResChange(r)} className={pill(editRes === r)}>{r}</button>
            ))}
          </div>
          <div className={row}>
            <span className={lbl}>Mode:</span>
            {GEN_MODES.map((m) => (
              <button key={m} onClick={() => onEditGenModeChange(m)} className={pill(editGenMode === m)}>{m}</button>
            ))}
          </div>
          <div className={row}>
            <span className={lbl}>Số ảnh:</span>
            {([1, 2, 3, 4] as const).map((n) => (
              <button key={n} onClick={() => onEditNumImagesChange(n)} className={pill(editNumImages === n)}>{n}</button>
            ))}
          </div>
          <div className={row}>
            <span className={lbl}>Seed:</span>
            <input
              type="number"
              value={editSeed}
              onChange={(e) => onEditSeedChange(e.target.value)}
              placeholder="42"
              className="w-16 px-1.5 py-0.5 rounded-md text-[11px] bg-secondary/40 border border-border/60 focus:outline-none focus:ring-1 focus:ring-primary/40"
            />
          </div>
        </div>
      </div>
    );
  }

  // ── Create Model ──────────────────────────────────────────────────────────
  if (selectedTool === AIToolType.CREATE_MODEL) {
    return (
      <div className="border border-border/60 rounded-2xl px-3 py-2">
        <input
          value={genericPrompt}
          onChange={(e) => onGenericPromptChange(e.target.value)}
          placeholder='Mô tả model muốn tạo: "Full body shot, woman wearing a white t-shirt, studio"...'
          className={inputCls}
        />
      </div>
    );
  }

  // ── Image to Video ────────────────────────────────────────────────────────
  if (selectedTool === AIToolType.IMAGE_TO_VIDEO) {
    return (
      <div className="border border-border/60 rounded-2xl px-3 py-2 space-y-2">
        <input
          value={genericPrompt}
          onChange={(e) => onGenericPromptChange(e.target.value)}
          placeholder="Mô tả chuyển động (tuỳ chọn — để trống để AI tự quyết)"
          className={inputCls}
        />
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          <div className={row}>
            <span className={lbl}>Thời lượng:</span>
            {([5, 10] as const).map((d) => (
              <button key={d} onClick={() => onVideoDurationChange(d)} className={pill(videoDuration === d)}>{d}s</button>
            ))}
          </div>
          <div className={row}>
            <span className={lbl}>Chất lượng:</span>
            {(["480p", "720p", "1080p"] as const).map((r) => (
              <button key={r} onClick={() => onVideoResChange(r)} className={pill(videoRes === r)}>{r}</button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
