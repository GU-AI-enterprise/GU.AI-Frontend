"use client";

import type { StudioImage, TryOnModel, TryOnResolution } from "../types";
import type { TryOnCategory } from "@/features/studio/studioService";
import { TRY_ON_CATEGORIES, TRY_ON_MODELS, TRY_ON_RESOLUTIONS } from "../constants";
import { fileToStudioImage, computeTryOnCost } from "../helpers";
import { ImageSlot } from "./ImageSlot";

interface Props {
  modelImage: StudioImage | null;
  garmentImage: StudioImage | null;
  category: TryOnCategory;
  tryOnModel: TryOnModel;
  resolution: TryOnResolution;
  hoveredModel: TryOnModel | null;
  onModelImageChange: (img: StudioImage | null) => void;
  onGarmentImageChange: (img: StudioImage | null) => void;
  onCategoryChange: (v: TryOnCategory) => void;
  onTryOnModelChange: (v: TryOnModel) => void;
  onResolutionChange: (v: TryOnResolution) => void;
  onHoveredModelChange: (v: TryOnModel | null) => void;
  onPaste: (onImage: (file: File) => void) => Promise<void>;
  openGallery: (cb: (url: string) => void) => void;
}

export function TryOnPanel({
  modelImage, garmentImage, category, tryOnModel, resolution, hoveredModel,
  onModelImageChange, onGarmentImageChange, onCategoryChange, onTryOnModelChange,
  onResolutionChange, onHoveredModelChange, onPaste, openGallery,
}: Props) {
  const displayModel = hoveredModel ?? tryOnModel;
  const info = TRY_ON_MODELS.find(m => m.id === displayModel);

  return (
    <div className="flex flex-col gap-3 h-full min-h-0">
      <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
        <ImageSlot
          label="Ảnh người mẫu" sublabel="Người đứng thẳng"
          image={modelImage} onClear={() => onModelImageChange(null)}
          onFileChange={(f) => onModelImageChange(fileToStudioImage(f))}
          onPaste={() => onPaste((f) => onModelImageChange(fileToStudioImage(f)))}
          onGallery={() => openGallery((url) => onModelImageChange({ id: Math.random().toString(36).substr(2, 9), url }))}
        />
        <ImageSlot
          label="Ảnh trang phục" sublabel="Sản phẩm rõ nét"
          image={garmentImage} onClear={() => onGarmentImageChange(null)}
          onFileChange={(f) => onGarmentImageChange(fileToStudioImage(f))}
          onPaste={() => onPaste((f) => onGarmentImageChange(fileToStudioImage(f)))}
          onGallery={() => openGallery((url) => onGarmentImageChange({ id: Math.random().toString(36).substr(2, 9), url }))}
        />
      </div>

      <div className="flex flex-col gap-2 shrink-0">
        {/* Category */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground w-9">Loại:</span>
          {TRY_ON_CATEGORIES.map(c => (
            <button
              key={c.value}
              onClick={() => onCategoryChange(c.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                category === c.value
                  ? "bg-foreground text-background"
                  : "bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Model selector */}
        <div className="flex items-start gap-2">
          <span className="text-xs text-muted-foreground w-9 pt-1.5 shrink-0">AI:</span>
          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <div className="flex gap-1.5 flex-wrap">
              {TRY_ON_MODELS.map(m => (
                <button
                  key={m.id}
                  onClick={() => onTryOnModelChange(m.id)}
                  onMouseEnter={() => onHoveredModelChange(m.id)}
                  onMouseLeave={() => onHoveredModelChange(null)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    tryOnModel === m.id
                      ? "bg-foreground text-background"
                      : "bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {m.name}
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                    tryOnModel === m.id
                      ? "bg-background/15 text-background/80"
                      : "bg-primary/10 text-primary"
                  }`}>
                    {m.id === "v1.6" ? "1 cr" : `${computeTryOnCost("max", "balanced", resolution)} cr`}
                  </span>
                </button>
              ))}

              {/* Resolution — only for Max */}
              {tryOnModel === "max" && TRY_ON_RESOLUTIONS.map(r => (
                <button
                  key={r.value}
                  onClick={() => onResolutionChange(r.value)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    resolution === r.value
                      ? "bg-foreground text-background"
                      : "bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {info && (
              <div className="text-[10px] text-muted-foreground leading-relaxed">
                <span className="text-foreground font-medium">{info.tagline}</span>
                {" · "}{info.speed}
                {" · "}{info.bestFor}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
