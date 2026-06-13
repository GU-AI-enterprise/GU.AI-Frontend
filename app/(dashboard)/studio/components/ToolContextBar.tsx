"use client";

import { useState, useRef, useEffect } from "react";
import { AIToolType } from "@/constants/ai";
import { TRY_ON_CATEGORIES, TRY_ON_MODELS, TRY_ON_RESOLUTIONS } from "../constants";
import { computeTryOnCost } from "../helpers";
import type {
  TryOnModel, TryOnResolution, GenResolution, GenMode, FaceRefMode,
  VideoDuration, VideoResolution, StudioImage,
} from "../types";
import type { TryOnCategory } from "@/features/studio/studioService";
import { ChevronDown, Loader2, Sparkles, ScanFace, ImageIcon, Mountain } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Dropdown button ──────────────────────────────────────────────────────────

function DropdownBtn<T extends string | number>({
  label, value, options, onChange,
}: {
  label?: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const currentLabel = options.find((o) => o.value === value)?.label ?? String(value);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="cursor-pointer flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border/60 bg-background hover:bg-secondary/50 text-xs text-foreground transition-colors whitespace-nowrap"
      >
        {label && <span className="text-muted-foreground mr-0.5">{label}</span>}
        <span className="font-medium">{currentLabel}</span>
        <ChevronDown className="size-3 text-muted-foreground ml-0.5" />
      </button>
      {open && (
        <div className="absolute bottom-full mb-1.5 right-0 z-[200] min-w-[110px] rounded-xl border border-border bg-popover shadow-xl py-1 overflow-hidden">
          {options.map((opt) => (
            <button
              key={String(opt.value)}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={cn(
                "cursor-pointer w-full text-left px-3 py-1.5 text-xs transition-colors hover:bg-accent",
                opt.value === value ? "text-foreground font-semibold" : "text-muted-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Run button ───────────────────────────────────────────────────────────────

function RunBtn({ onClick, disabled, isProcessing }: {
  onClick: () => void;
  disabled: boolean;
  isProcessing: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="cursor-pointer flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-foreground text-background text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-all whitespace-nowrap"
    >
      {isProcessing ? (
        <><Loader2 className="size-3.5 animate-spin" />Đang chạy</>
      ) : (
        <><Sparkles className="size-3.5" />Chạy</>
      )}
    </button>
  );
}

// ── Action button ────────────────────────────────────────────────────────────

function ActionBtn({ icon: Icon, label, active, onClick }: {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "cursor-pointer flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap",
        active
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border/60 text-muted-foreground hover:text-foreground hover:border-border hover:bg-secondary/40"
      )}
    >
      <Icon className="size-3.5" />
      {label}
    </button>
  );
}

// ── Bottom row ───────────────────────────────────────────────────────────────

function BottomRow({ left, right }: { left?: React.ReactNode; right: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      {left && (
        <div className="flex items-center gap-1.5 flex-1 min-w-0 flex-wrap">{left}</div>
      )}
      <div className="flex items-center gap-1.5 ml-auto shrink-0">{right}</div>
    </div>
  );
}

// ── Shared constants ─────────────────────────────────────────────────────────

const inputCls =
  "w-full px-0 text-sm bg-transparent border-0 focus:outline-none focus:ring-0 placeholder:text-muted-foreground/40 resize-none leading-relaxed";

const RES_OPTS: { value: GenResolution; label: string }[] = [
  { value: "1k", label: "1K" },
  { value: "2k", label: "2K" },
  { value: "4k", label: "4K" },
];
const MODE_OPTS: { value: GenMode; label: string }[] = [
  { value: "fast",     label: "Fast" },
  { value: "balanced", label: "Balanced" },
  { value: "quality",  label: "Quality" },
];
const RATIO_OPTS = ["1:1", "3:4", "4:5", "9:16", "16:9"].map((v) => ({ value: v, label: v }));
const COUNT_OPTS = [1, 2, 3, 4].map((n) => ({ value: n, label: String(n) }));
const FACE_MODE_OPTS: { value: FaceRefMode; label: string }[] = [
  { value: "match_reference", label: "Giống nhất" },
  { value: "match_base",      label: "Cân bằng" },
];
const VIDEO_DUR_OPTS: { value: VideoDuration; label: string }[] = [
  { value: 5,  label: "5s" },
  { value: 10, label: "10s" },
];
const VIDEO_RES_OPTS: { value: VideoResolution; label: string }[] = [
  { value: "480p",  label: "480p" },
  { value: "720p",  label: "720p" },
  { value: "1080p", label: "1080p" },
];
const TRY_ON_MODEL_OPTS: { value: TryOnModel; label: string }[] = TRY_ON_MODELS.map((m) => ({
  value: m.id,
  label: m.name,
}));
const TRY_ON_CAT_OPTS: { value: TryOnCategory; label: string }[] = TRY_ON_CATEGORIES.map((c) => ({
  value: c.value,
  label: c.label,
}));
const TRY_ON_RES_OPTS: { value: TryOnResolution; label: string }[] = TRY_ON_RESOLUTIONS;

const uid = () => Math.random().toString(36).slice(2, 9);

// ── Props ────────────────────────────────────────────────────────────────────

export interface ToolContextBarProps {
  selectedTool: AIToolType;

  // Run
  handleRun: () => void;
  canRun: boolean;
  isProcessing: boolean;

  // Gallery opener
  openGallery: (cb: (url: string) => void) => void;

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
  p2mFaceRef: StudioImage | null;
  p2mPromptImg: StudioImage | null;
  p2mBgRef: StudioImage | null;
  onP2mPromptChange: (v: string) => void;
  onP2mAspectChange: (v: string) => void;
  onP2mResChange: (v: GenResolution) => void;
  onP2mGenModeChange: (v: GenMode) => void;
  onP2mFaceModeChange: (v: FaceRefMode) => void;
  onP2mFaceRefChange: (img: StudioImage | null) => void;
  onP2mPromptImgChange: (img: StudioImage | null) => void;
  onP2mBgRefChange: (img: StudioImage | null) => void;

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
  genericPrompt: string;
  onEditResChange: (v: GenResolution) => void;
  onEditGenModeChange: (v: GenMode) => void;
  onEditNumImagesChange: (v: number) => void;
  onEditSeedChange: (v: string) => void;
  onGenericPromptChange: (v: string) => void;

  // Create Model
  createRes: GenResolution;
  createGenMode: GenMode;
  createNumImages: number;
  createSeed: string;
  onCreateResChange: (v: GenResolution) => void;
  onCreateGenModeChange: (v: GenMode) => void;
  onCreateNumImagesChange: (v: number) => void;
  onCreateSeedChange: (v: string) => void;

  // Image to Video
  videoDuration: VideoDuration;
  videoRes: VideoResolution;
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

  // DB-driven credit overrides
  removeBgCredit?: number;
}

// ── Main component ────────────────────────────────────────────────────────────

export function ToolContextBar({
  selectedTool,
  handleRun, canRun, isProcessing,
  openGallery,
  toCategory, toModel, toResolution, toHovered, toPrompt,
  onToCategoryChange, onToModelChange, onToResolutionChange, onToHoveredChange, onToPromptChange,
  p2mPrompt, p2mAspect, p2mRes, p2mGenMode, p2mFaceMode,
  p2mFaceRef, p2mPromptImg, p2mBgRef,
  onP2mPromptChange, onP2mAspectChange, onP2mResChange, onP2mGenModeChange, onP2mFaceModeChange,
  onP2mFaceRefChange, onP2mPromptImgChange, onP2mBgRefChange,
  msPrompt, msRes, msGenMode, msFaceMode, msHasFaceRef,
  onMsPromptChange, onMsResChange, onMsGenModeChange, onMsFaceModeChange,
  f2mPrompt, f2mAspect, f2mRes, f2mGenMode, f2mNumImages, f2mSeed,
  onF2mPromptChange, onF2mAspectChange, onF2mResChange, onF2mGenModeChange, onF2mNumImagesChange, onF2mSeedChange,
  editRes, editGenMode, editNumImages, editSeed, genericPrompt,
  onEditResChange, onEditGenModeChange, onEditNumImagesChange, onEditSeedChange, onGenericPromptChange,
  createRes, createGenMode, createNumImages, createSeed,
  onCreateResChange, onCreateGenModeChange, onCreateNumImagesChange, onCreateSeedChange,
  videoDuration, videoRes,
  onVideoDurationChange, onVideoResChange,
  reframeAspect, reframeRes, reframeGenMode, reframeNumImages, reframeSeed,
  onReframeAspectChange, onReframeResChange, onReframeGenModeChange, onReframeNumImagesChange, onReframeSeedChange,
  upscaleScale, onUpscaleScaleChange,
  removeBgCredit,
}: ToolContextBarProps) {

  // ── Try-On ─────────────────────────────────────────────────────────────────
  if (selectedTool === AIToolType.TRY_ON) {
    return (
      <div className="px-4 pt-3 pb-3 flex flex-col">
        <div className="min-h-[40px] flex items-center mb-2">
          {toModel === "max" ? (
            <input
              value={toPrompt}
              onChange={(e) => onToPromptChange(e.target.value)}
              placeholder='Tuỳ chỉnh (tuỳ chọn): "remove scarf", "tuck in shirt", "roll up sleeves"...'
              className={inputCls}
            />
          ) : (
            <p className="text-[11px] text-muted-foreground/40 italic">
              Chọn Try-On Max để thêm prompt tuỳ chỉnh
            </p>
          )}
        </div>
        <BottomRow
          left={
            <DropdownBtn label="Loại" value={toCategory} options={TRY_ON_CAT_OPTS} onChange={onToCategoryChange} />
          }
          right={
            <>
              <DropdownBtn label="Model" value={toModel} options={TRY_ON_MODEL_OPTS} onChange={onToModelChange} />
              {toModel === "max" && (
                <DropdownBtn value={toResolution} options={TRY_ON_RES_OPTS} onChange={onToResolutionChange} />
              )}
              <RunBtn onClick={handleRun} disabled={!canRun} isProcessing={isProcessing} />
            </>
          }
        />
      </div>
    );
  }

  // ── Product to Model ───────────────────────────────────────────────────────
  if (selectedTool === AIToolType.PRODUCT_TO_MODEL) {
    return (
      <div className="px-4 pt-3 pb-3 flex flex-col">
        <div className="min-h-[40px] flex items-center mb-2">
          <input
            value={p2mPrompt}
            onChange={(e) => onP2mPromptChange(e.target.value)}
            placeholder='Tùy chọn: "Blonde hair, studio photoshoot", "office setting", "casual outdoor"...'
            className={inputCls}
          />
        </div>
        <BottomRow
          left={
            <>
              <ActionBtn
                icon={ScanFace}
                label="Face Reference"
                active={!!p2mFaceRef}
                onClick={() => openGallery((url) => onP2mFaceRefChange({ id: uid(), url }))}
              />
              <ActionBtn
                icon={ImageIcon}
                label="Image Prompt"
                active={!!p2mPromptImg}
                onClick={() => openGallery((url) => onP2mPromptImgChange({ id: uid(), url }))}
              />
              <ActionBtn
                icon={Mountain}
                label="Background"
                active={!!p2mBgRef}
                onClick={() => openGallery((url) => onP2mBgRefChange({ id: uid(), url }))}
              />
            </>
          }
          right={
            <>
              <DropdownBtn label="Ratio" value={p2mAspect} options={RATIO_OPTS} onChange={onP2mAspectChange} />
              <DropdownBtn value={p2mRes} options={RES_OPTS} onChange={onP2mResChange} />
              <DropdownBtn value={p2mGenMode} options={MODE_OPTS} onChange={onP2mGenModeChange} />
              {!!p2mFaceRef && (
                <DropdownBtn value={p2mFaceMode} options={FACE_MODE_OPTS} onChange={onP2mFaceModeChange} />
              )}
              <RunBtn onClick={handleRun} disabled={!canRun} isProcessing={isProcessing} />
            </>
          }
        />
      </div>
    );
  }

  // ── Model Swap ─────────────────────────────────────────────────────────────
  if (selectedTool === AIToolType.MODEL_SWAP) {
    return (
      <div className="px-4 pt-3 pb-3 flex flex-col">
        <div className="min-h-[40px] flex items-center mb-2">
          <input
            value={msPrompt}
            onChange={(e) => onMsPromptChange(e.target.value)}
            placeholder='Tùy chọn: "same pose", "outdoor", "studio lighting"...'
            className={inputCls}
          />
        </div>
        <BottomRow
          right={
            <>
              <DropdownBtn value={msRes} options={RES_OPTS} onChange={onMsResChange} />
              <DropdownBtn value={msGenMode} options={MODE_OPTS} onChange={onMsGenModeChange} />
              {msHasFaceRef && (
                <DropdownBtn value={msFaceMode} options={FACE_MODE_OPTS} onChange={onMsFaceModeChange} />
              )}
              <RunBtn onClick={handleRun} disabled={!canRun} isProcessing={isProcessing} />
            </>
          }
        />
      </div>
    );
  }

  // ── Face to Model ──────────────────────────────────────────────────────────
  if (selectedTool === AIToolType.FACE_TO_MODEL) {
    return (
      <div className="px-4 pt-3 pb-3 flex flex-col">
        <div className="min-h-[40px] flex items-center mb-2">
          <input
            value={f2mPrompt}
            onChange={(e) => onF2mPromptChange(e.target.value)}
            placeholder='Tùy chọn: "athletic build", "slender frame", "curvy figure"...'
            className={inputCls}
          />
        </div>
        <BottomRow
          right={
            <>
              <DropdownBtn
                label="Ratio"
                value={f2mAspect}
                options={["1:1", "4:5", "3:4", "2:3", "9:16"].map((v) => ({ value: v, label: v }))}
                onChange={onF2mAspectChange}
              />
              <DropdownBtn value={f2mRes} options={RES_OPTS} onChange={onF2mResChange} />
              <DropdownBtn value={f2mGenMode} options={MODE_OPTS} onChange={onF2mGenModeChange} />
              <DropdownBtn value={f2mNumImages} options={COUNT_OPTS} onChange={onF2mNumImagesChange} />
              <RunBtn onClick={handleRun} disabled={!canRun} isProcessing={isProcessing} />
            </>
          }
        />
      </div>
    );
  }

  // ── Edit ───────────────────────────────────────────────────────────────────
  if (selectedTool === AIToolType.EDIT) {
    return (
      <div className="px-4 pt-3 pb-3 flex flex-col">
        <div className="min-h-[40px] flex items-center mb-2">
          <input
            value={genericPrompt}
            onChange={(e) => onGenericPromptChange(e.target.value)}
            placeholder='Mô tả thay đổi: "add a black leather bag", "turn slightly left", "studio lighting"...'
            className={inputCls}
          />
        </div>
        <BottomRow
          right={
            <>
              <DropdownBtn value={editRes} options={RES_OPTS} onChange={onEditResChange} />
              <DropdownBtn value={editGenMode} options={MODE_OPTS} onChange={onEditGenModeChange} />
              <DropdownBtn value={editNumImages} options={COUNT_OPTS} onChange={onEditNumImagesChange} />
              <RunBtn onClick={handleRun} disabled={!canRun} isProcessing={isProcessing} />
            </>
          }
        />
      </div>
    );
  }

  // ── Create Model ───────────────────────────────────────────────────────────
  if (selectedTool === AIToolType.CREATE_MODEL) {
    return (
      <div className="px-4 pt-3 pb-3 flex flex-col">
        <div className="min-h-[40px] flex items-center mb-2">
          <input
            value={genericPrompt}
            onChange={(e) => onGenericPromptChange(e.target.value)}
            placeholder='Mô tả model: "Full body shot, woman wearing a white t-shirt, studio"...'
            className={inputCls}
          />
        </div>
        <BottomRow
          right={
            <>
              <DropdownBtn value={createRes} options={RES_OPTS} onChange={onCreateResChange} />
              <DropdownBtn value={createGenMode} options={MODE_OPTS} onChange={onCreateGenModeChange} />
              <DropdownBtn value={createNumImages} options={COUNT_OPTS} onChange={onCreateNumImagesChange} />
              <RunBtn onClick={handleRun} disabled={!canRun} isProcessing={isProcessing} />
            </>
          }
        />
      </div>
    );
  }

  // ── Image to Video ─────────────────────────────────────────────────────────
  if (selectedTool === AIToolType.IMAGE_TO_VIDEO) {
    return (
      <div className="px-4 pt-3 pb-3 flex flex-col">
        <div className="min-h-[40px] flex items-center mb-2">
          <input
            value={genericPrompt}
            onChange={(e) => onGenericPromptChange(e.target.value)}
            placeholder="Mô tả chuyển động (tùy chọn — để trống để AI tự quyết)"
            className={inputCls}
          />
        </div>
        <BottomRow
          right={
            <>
              <DropdownBtn label="Thời lượng" value={videoDuration} options={VIDEO_DUR_OPTS} onChange={onVideoDurationChange} />
              <DropdownBtn value={videoRes} options={VIDEO_RES_OPTS} onChange={onVideoResChange} />
              <RunBtn onClick={handleRun} disabled={!canRun} isProcessing={isProcessing} />
            </>
          }
        />
      </div>
    );
  }

  // ── Reframe ────────────────────────────────────────────────────────────────
  if (selectedTool === AIToolType.REFRAME) {
    return (
      <div className="px-4 pt-3 pb-3 flex flex-col">
        <div className="min-h-[40px] flex items-center mb-2">
          <p className="text-[11px] text-muted-foreground/40 italic">
            Mở rộng khung hình với AI outpainting
          </p>
        </div>
        <BottomRow
          right={
            <>
              <DropdownBtn label="Ratio" value={reframeAspect} options={RATIO_OPTS} onChange={onReframeAspectChange} />
              <DropdownBtn value={reframeRes} options={RES_OPTS} onChange={onReframeResChange} />
              <DropdownBtn value={reframeGenMode} options={MODE_OPTS} onChange={onReframeGenModeChange} />
              <DropdownBtn value={reframeNumImages} options={COUNT_OPTS} onChange={onReframeNumImagesChange} />
              <RunBtn onClick={handleRun} disabled={!canRun} isProcessing={isProcessing} />
            </>
          }
        />
      </div>
    );
  }

  // ── Remove Background ──────────────────────────────────────────────────────
  if (selectedTool === AIToolType.REMOVE_BG) {
    return (
      <div className="px-4 pt-3 pb-3 flex flex-col">
        <div className="min-h-[40px] flex items-center mb-2">
          <p className="text-[11px] text-muted-foreground/40 italic">
            AI tự động phát hiện foreground và xóa nền — xuất file PNG trong suốt · {removeBgCredit ?? 1} credit / ảnh
          </p>
        </div>
        <BottomRow
          right={<RunBtn onClick={handleRun} disabled={!canRun} isProcessing={isProcessing} />}
        />
      </div>
    );
  }

  // ── Upscale ────────────────────────────────────────────────────────────────
  if (selectedTool === AIToolType.UPSCALE) {
    return (
      <div className="px-4 pt-3 pb-3 flex flex-col">
        <div className="min-h-[40px] flex items-center mb-2">
          <p className="text-[11px] text-muted-foreground/40 italic">
            Nâng cao độ phân giải ảnh bằng AI
          </p>
        </div>
        <BottomRow
          left={
            <DropdownBtn
              label="Scale"
              value={upscaleScale}
              options={[{ value: 2, label: "2×" }, { value: 4, label: "4×" }]}
              onChange={onUpscaleScaleChange}
            />
          }
          right={<RunBtn onClick={handleRun} disabled={!canRun} isProcessing={isProcessing} />}
        />
      </div>
    );
  }

  return null;
}
