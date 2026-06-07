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
  `cursor-pointer px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
    active
      ? "bg-foreground text-background"
      : "bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary"
  }`;

const lbl = "text-[10px] text-muted-foreground shrink-0";
const row = "flex items-center gap-1.5 flex-wrap";
const inputCls =
  "w-full h-full px-0 text-sm bg-transparent border-0 focus:outline-none focus:ring-0 placeholder:text-muted-foreground/50 resize-none";

// Vertical divider between controls and prompt
const Divider = () => <div className="w-px bg-border/50 self-stretch mx-1 shrink-0" />;

export interface ToolContextBarProps {
  selectedTool: AIToolType;
  // Try-On
  toCategory: TryOnCategory;
  toModel: TryOnModel;
  toResolution: TryOnResolution;
  toHovered: TryOnModel | null;
  toPrompt: string;
  onToCategoryChange: (v: TryOnCategory) => void;
  onToModelChange: (v: TryOnModel) => void;
  onToResolutionChange: (v: TryOnResolution) => void;
  onToHoveredChange: (v: TryOnModel | null) => void;
  onToPromptChange: (v: string) => void;
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
  // Face to Model
  f2mPrompt: string;
  f2mAspect: string;
  f2mRes: GenResolution;
  f2mGenMode: GenMode;
  f2mNumImages: number;
  f2mSeed: string;
  onF2mPromptChange: (v: string) => void;
  onF2mAspectChange: (v: string) => void;
  onF2mResChange: (v: GenResolution) => void;
  onF2mGenModeChange: (v: GenMode) => void;
  onF2mNumImagesChange: (v: number) => void;
  onF2mSeedChange: (v: string) => void;
  // Edit
  editRes: GenResolution;
  editGenMode: GenMode;
  editNumImages: number;
  editSeed: string;
  onEditResChange: (v: GenResolution) => void;
  onEditGenModeChange: (v: GenMode) => void;
  onEditNumImagesChange: (v: number) => void;
  onEditSeedChange: (v: string) => void;
  // Create Model
  createRes: GenResolution;
  createGenMode: GenMode;
  createNumImages: number;
  createSeed: string;
  onCreateResChange: (v: GenResolution) => void;
  onCreateGenModeChange: (v: GenMode) => void;
  onCreateNumImagesChange: (v: number) => void;
  onCreateSeedChange: (v: string) => void;
  // Image to Video (generic prompt shared with Create Model)
  genericPrompt: string;
  videoDuration: VideoDuration;
  videoRes: VideoResolution;
  onGenericPromptChange: (v: string) => void;
  onVideoDurationChange: (v: VideoDuration) => void;
  onVideoResChange: (v: VideoResolution) => void;
  // Reframe
  reframeAspect: string;
  reframeRes: GenResolution;
  reframeGenMode: GenMode;
  reframeNumImages: number;
  reframeSeed: string;
  onReframeAspectChange: (v: string) => void;
  onReframeResChange: (v: GenResolution) => void;
  onReframeGenModeChange: (v: GenMode) => void;
  onReframeNumImagesChange: (v: number) => void;
  onReframeSeedChange: (v: string) => void;
  // Upscale
  upscaleScale: number;
  onUpscaleScaleChange: (v: number) => void;
}

export function ToolContextBar({
  selectedTool,
  toCategory, toModel, toResolution, toHovered, toPrompt,
  onToCategoryChange, onToModelChange, onToResolutionChange, onToHoveredChange, onToPromptChange,
  p2mPrompt, p2mAspect, p2mRes, p2mGenMode, p2mFaceMode, p2mHasFaceRef,
  onP2mPromptChange, onP2mAspectChange, onP2mResChange, onP2mGenModeChange, onP2mFaceModeChange,
  msPrompt, msRes, msGenMode, msFaceMode, msHasFaceRef,
  onMsPromptChange, onMsResChange, onMsGenModeChange, onMsFaceModeChange,
  f2mPrompt, f2mAspect, f2mRes, f2mGenMode, f2mNumImages, f2mSeed,
  onF2mPromptChange, onF2mAspectChange, onF2mResChange, onF2mGenModeChange, onF2mNumImagesChange, onF2mSeedChange,
  editRes, editGenMode, editNumImages, editSeed,
  onEditResChange, onEditGenModeChange, onEditNumImagesChange, onEditSeedChange,
  createRes, createGenMode, createNumImages, createSeed,
  onCreateResChange, onCreateGenModeChange, onCreateNumImagesChange, onCreateSeedChange,
  genericPrompt, videoDuration, videoRes,
  onGenericPromptChange, onVideoDurationChange, onVideoResChange,
  reframeAspect, reframeRes, reframeGenMode, reframeNumImages, reframeSeed,
  onReframeAspectChange, onReframeResChange, onReframeGenModeChange, onReframeNumImagesChange, onReframeSeedChange,
  upscaleScale, onUpscaleScaleChange,
}: ToolContextBarProps) {

  // ── Try-On ────────────────────────────────────────────────────────────────
  if (selectedTool === AIToolType.TRY_ON) {
    const display = toHovered ?? toModel;
    const info = TRY_ON_MODELS.find((m) => m.id === display);
    return (
      <div className="border border-border/60 rounded-2xl px-3 py-2.5 flex items-stretch min-h-0">
        {/* Left 40%: controls */}
        <div className="w-[40%] min-w-0 flex flex-col gap-1.5 pr-3">
          <div className={row}>
            <span className={`${lbl} w-9`}>Loại:</span>
            {TRY_ON_CATEGORIES.map((c) => (
              <button key={c.value} onClick={() => onToCategoryChange(c.value)} className={pill(toCategory === c.value)}>
                {c.label}
              </button>
            ))}
          </div>
          <div className={row}>
            <span className={`${lbl} w-9`}>AI:</span>
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
            <p className="text-[10px] text-muted-foreground leading-tight">
              <span className="text-foreground font-medium">{info.tagline}</span>
              {" · "}{info.speed}
            </p>
          )}
        </div>
        <Divider />
        {/* Right 60%: prompt when max, hint when v1.6 */}
        <div className="flex-1 min-w-0 pl-3 flex items-center">
          {toModel === "max" ? (
            <input
              value={toPrompt ?? ""}
              onChange={(e) => onToPromptChange(e.target.value)}
              placeholder='Tuỳ chỉnh (tuỳ chọn): "remove scarf", "tuck in shirt", "roll up sleeves"...'
              className={inputCls}
            />
          ) : (
            <p className="text-[11px] text-muted-foreground/50 italic">Chọn Try-On Max để thêm prompt tuỳ chỉnh</p>
          )}
        </div>
      </div>
    );
  }

  // ── Product to Model ──────────────────────────────────────────────────────
  if (selectedTool === AIToolType.PRODUCT_TO_MODEL) {
    return (
      <div className="border border-border/60 rounded-2xl px-3 py-2 flex items-stretch min-h-0">
        {/* Left 40%: controls */}
        <div className="w-[40%] min-w-0 flex flex-col gap-1.5 pr-3">
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
        <Divider />
        {/* Right 60%: prompt */}
        <div className="flex-1 min-w-0 pl-3 flex items-center">
          <input
            value={p2mPrompt}
            onChange={(e) => onP2mPromptChange(e.target.value)}
            placeholder='Mô tả thêm: "professional office", "man casual", "studio white background"... (tuỳ chọn)'
            className={inputCls}
          />
        </div>
      </div>
    );
  }

  // ── Model Swap ────────────────────────────────────────────────────────────
  if (selectedTool === AIToolType.MODEL_SWAP) {
    return (
      <div className="border border-border/60 rounded-2xl px-3 py-2 flex items-stretch min-h-0">
        {/* Left 40%: controls */}
        <div className="w-[40%] min-w-0 flex flex-col gap-1.5 pr-3">
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
        <Divider />
        {/* Right 60%: prompt */}
        <div className="flex-1 min-w-0 pl-3 flex items-center">
          <input
            value={msPrompt}
            onChange={(e) => onMsPromptChange(e.target.value)}
            placeholder='Mô tả thêm: "same pose", "outdoor", "studio lighting"... (tuỳ chọn)'
            className={inputCls}
          />
        </div>
      </div>
    );
  }

  // ── Face to Model ─────────────────────────────────────────────────────────
  if (selectedTool === AIToolType.FACE_TO_MODEL) {
    return (
      <div className="border border-border/60 rounded-2xl px-3 py-2 flex items-stretch min-h-0">
        <div className="w-[40%] min-w-0 flex flex-col gap-1.5 pr-3">
          <div className={row}>
            <span className={lbl}>Res:</span>
            {RESOLUTIONS.map((r) => (
              <button key={r} onClick={() => onF2mResChange(r)} className={pill(f2mRes === r)}>{r}</button>
            ))}
          </div>
          <div className={row}>
            <span className={lbl}>Mode:</span>
            {GEN_MODES.map((m) => (
              <button key={m} onClick={() => onF2mGenModeChange(m)} className={pill(f2mGenMode === m)}>{m}</button>
            ))}
          </div>
          <div className={row}>
            <span className={lbl}>Ảnh:</span>
            {([1, 2, 3, 4] as const).map((n) => (
              <button key={n} onClick={() => onF2mNumImagesChange(n)} className={pill(f2mNumImages === n)}>{n}</button>
            ))}
            <span className={`${lbl} ml-2`}>Seed:</span>
            <input
              type="number" value={f2mSeed} onChange={(e) => onF2mSeedChange(e.target.value)}
              placeholder="42"
              className="w-14 px-1.5 py-0.5 rounded-md text-[11px] bg-secondary/40 border-0 focus:outline-none focus:ring-1 focus:ring-primary/40"
            />
          </div>
          <div className={row}>
            <span className={lbl}>Ratio:</span>
            {["1:1","4:5","3:4","2:3","9:16"].map((a) => (
              <button key={a} onClick={() => onF2mAspectChange(a)} className={pill(f2mAspect === a)}>{a}</button>
            ))}
          </div>
        </div>
        <Divider />
        <div className="flex-1 min-w-0 pl-3 flex items-center">
          <input
            value={f2mPrompt}
            onChange={(e) => onF2mPromptChange(e.target.value)}
            placeholder='Mô tả body (tuỳ chọn): "athletic build", "slender frame", "curvy figure"...'
            className={inputCls}
          />
        </div>
      </div>
    );
  }

  // ── Edit ──────────────────────────────────────────────────────────────────
  if (selectedTool === AIToolType.EDIT) {
    return (
      <div className="border border-border/60 rounded-2xl px-3 py-2 flex items-stretch min-h-0">
        {/* Left 40%: controls */}
        <div className="w-[40%] min-w-0 flex flex-col gap-1.5 pr-3">
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
            <span className={lbl}>Ảnh:</span>
            {([1, 2, 3, 4] as const).map((n) => (
              <button key={n} onClick={() => onEditNumImagesChange(n)} className={pill(editNumImages === n)}>{n}</button>
            ))}
            <span className={`${lbl} ml-2`}>Seed:</span>
            <input
              type="number"
              value={editSeed}
              onChange={(e) => onEditSeedChange(e.target.value)}
              placeholder="42"
              className="w-14 px-1.5 py-0.5 rounded-md text-[11px] bg-secondary/40 border border-border/60 focus:outline-none focus:ring-1 focus:ring-primary/40"
            />
          </div>
        </div>
        <Divider />
        {/* Right 60%: prompt (required) */}
        <div className="flex-1 min-w-0 pl-3 flex items-center">
          <input
            value={genericPrompt}
            onChange={(e) => onGenericPromptChange(e.target.value)}
            placeholder='Mô tả thay đổi: "add a black leather bag", "turn slightly left", "studio lighting"...'
            className={inputCls}
          />
        </div>
      </div>
    );
  }

  // ── Create Model ──────────────────────────────────────────────────────────
  if (selectedTool === AIToolType.CREATE_MODEL) {
    return (
      <div className="border border-border/60 rounded-2xl px-3 py-2 flex items-stretch min-h-0">
        {/* Left 40%: controls */}
        <div className="w-[40%] min-w-0 flex flex-col gap-1.5 pr-3">
          <div className={row}>
            <span className={lbl}>Res:</span>
            {RESOLUTIONS.map((r) => (
              <button key={r} onClick={() => onCreateResChange(r)} className={pill(createRes === r)}>{r}</button>
            ))}
          </div>
          <div className={row}>
            <span className={lbl}>Mode:</span>
            {GEN_MODES.map((m) => (
              <button key={m} onClick={() => onCreateGenModeChange(m)} className={pill(createGenMode === m)}>{m}</button>
            ))}
          </div>
          <div className={row}>
            <span className={lbl}>Ảnh:</span>
            {([1, 2, 3, 4] as const).map((n) => (
              <button key={n} onClick={() => onCreateNumImagesChange(n)} className={pill(createNumImages === n)}>{n}</button>
            ))}
            <span className={`${lbl} ml-2`}>Seed:</span>
            <input
              type="number"
              value={createSeed}
              onChange={(e) => onCreateSeedChange(e.target.value)}
              placeholder="42"
              className="w-14 px-1.5 py-0.5 rounded-md text-[11px] bg-secondary/40 border border-border/60 focus:outline-none focus:ring-1 focus:ring-primary/40"
            />
          </div>
        </div>
        <Divider />
        {/* Right 60%: prompt (required) */}
        <div className="flex-1 min-w-0 pl-3 flex items-center">
          <input
            value={genericPrompt}
            onChange={(e) => onGenericPromptChange(e.target.value)}
            placeholder='Mô tả model: "Full body shot, woman wearing a white t-shirt, studio"...'
            className={inputCls}
          />
        </div>
      </div>
    );
  }

  // ── Image to Video ────────────────────────────────────────────────────────
  if (selectedTool === AIToolType.IMAGE_TO_VIDEO) {
    return (
      <div className="border border-border/60 rounded-2xl px-3 py-2 flex items-stretch min-h-0">
        {/* Left 40%: controls */}
        <div className="w-[40%] min-w-0 flex flex-col gap-1.5 pr-3">
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
        <Divider />
        {/* Right 60%: prompt (optional) */}
        <div className="flex-1 min-w-0 pl-3 flex items-center">
          <input
            value={genericPrompt}
            onChange={(e) => onGenericPromptChange(e.target.value)}
            placeholder="Mô tả chuyển động (tuỳ chọn — để trống để AI tự quyết)"
            className={inputCls}
          />
        </div>
      </div>
    );
  }

  // ── Reframe ───────────────────────────────────────────────────────────────────
  if (selectedTool === AIToolType.REFRAME) {
    return (
      <div className="border border-border/60 rounded-2xl px-3 py-2">
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          <div className={row}>
            <span className={lbl}>Tỉ lệ:</span>
            {ASPECT_RATIOS.map((r) => (
              <button key={r} onClick={() => onReframeAspectChange(r)} className={pill(reframeAspect === r)}>{r}</button>
            ))}
          </div>
          <div className={row}>
            <span className={lbl}>Res:</span>
            {RESOLUTIONS.map((r) => (
              <button key={r} onClick={() => onReframeResChange(r)} className={pill(reframeRes === r)}>{r}</button>
            ))}
          </div>
          <div className={row}>
            <span className={lbl}>Mode:</span>
            {GEN_MODES.map((m) => (
              <button key={m} onClick={() => onReframeGenModeChange(m)} className={pill(reframeGenMode === m)}>{m}</button>
            ))}
          </div>
          <div className={row}>
            <span className={lbl}>Ảnh:</span>
            {([1, 2, 3, 4] as const).map((n) => (
              <button key={n} onClick={() => onReframeNumImagesChange(n)} className={pill(reframeNumImages === n)}>{n}</button>
            ))}
          </div>
          <div className={row}>
            <span className={lbl}>Seed:</span>
            <input
              type="number"
              value={reframeSeed}
              onChange={(e) => onReframeSeedChange(e.target.value)}
              placeholder="42"
              className="w-16 px-1.5 py-0.5 rounded-md text-[11px] bg-secondary/40 border border-border/60 focus:outline-none focus:ring-1 focus:ring-primary/40"
            />
          </div>
        </div>
      </div>
    );
  }

  // ── Upscale ───────────────────────────────────────────────────────────────────
  if (selectedTool === AIToolType.UPSCALE) {
    return (
      <div className="border border-border/60 rounded-2xl px-3 py-2">
        <div className={row}>
          <span className={lbl}>Scale:</span>
          {([2, 4] as const).map((s) => (
            <button key={s} onClick={() => onUpscaleScaleChange(s)} className={pill(upscaleScale === s)}>{s}×</button>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
