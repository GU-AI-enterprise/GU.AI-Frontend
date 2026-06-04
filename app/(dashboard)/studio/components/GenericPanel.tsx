"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Upload, X, ClipboardPaste, GalleryHorizontal } from "lucide-react";
import { AIToolType } from "@/constants/ai";
import type { StudioImage, VideoDuration, VideoResolution } from "../types";
import { fileToStudioImage } from "../helpers";

interface Props {
  selectedTool: AIToolType;
  images: StudioImage[];
  prompt: string;
  videoDuration: VideoDuration;
  videoResolution: VideoResolution;
  onImagesChange: (imgs: StudioImage[]) => void;
  onPromptChange: (v: string) => void;
  onVideoDurationChange: (v: VideoDuration) => void;
  onVideoResolutionChange: (v: VideoResolution) => void;
  onPaste: (onImage: (file: File) => void) => Promise<void>;
  openGallery: (cb: (url: string) => void) => void;
}

const TOOLS_WITH_PROMPT = [
  AIToolType.EDIT,
  AIToolType.CREATE_MODEL,
  AIToolType.MODEL_SWAP,
  AIToolType.IMAGE_TO_VIDEO,
];

const PROMPT_PLACEHOLDERS: Partial<Record<AIToolType, string>> = {
  [AIToolType.CREATE_MODEL]:   "Mô tả model muốn tạo (vd: Full body shot, woman wearing a white t-shirt...)",
  [AIToolType.EDIT]:           "Mô tả thay đổi muốn thực hiện (vd: add a black leather bag, change background to white...)",
  [AIToolType.IMAGE_TO_VIDEO]: "Mô tả chuyển động (tuỳ chọn — để trống để AI tự quyết)",
};

export function GenericPanel({
  selectedTool, images, prompt, videoDuration, videoResolution,
  onImagesChange, onPromptChange, onVideoDurationChange, onVideoResolutionChange,
  onPaste, openGallery,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const addFiles = (files: File[]) => {
    const imgs = files.filter(f => f.type.startsWith("image/")).map(fileToStudioImage);
    onImagesChange([...images, ...imgs].slice(0, 5));
  };

  const showPrompt = TOOLS_WITH_PROMPT.includes(selectedTool);
  const placeholderText = PROMPT_PLACEHOLDERS[selectedTool] ?? "Prompt / mô tả thêm (tuỳ chọn)";

  return (
    <div
      className="h-full flex flex-col min-h-0"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        addFiles(Array.from(e.dataTransfer.files));
      }}
    >
      {/* Image area */}
      {images.length === 0 ? (
        <div
          onClick={() => fileRef.current?.click()}
          className="flex-1 min-h-0 rounded-3xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/30 hover:bg-card transition-all"
        >
          <input
            type="file" multiple accept="image/*" ref={fileRef}
            className="hidden"
            onChange={(e) => { if (e.target.files) addFiles(Array.from(e.target.files)); }}
          />
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-14 h-18 rounded-xl bg-gradient-to-br from-orange-200 to-orange-400 shadow-lg -rotate-6" />
            <div className="w-14 h-18 rounded-xl bg-gradient-to-br from-sky-200 to-sky-400 shadow-lg z-10" />
            <div className="w-14 h-18 rounded-xl bg-gradient-to-br from-amber-200 to-amber-400 shadow-lg rotate-6" />
          </div>
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={(e) => { e.stopPropagation(); onPaste((f) => onImagesChange([...images, fileToStudioImage(f)].slice(0, 5))); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background border border-border text-xs font-medium hover:bg-secondary transition-colors"
            >
              <ClipboardPaste className="size-3.5" /> Paste
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background border border-border text-xs font-medium hover:bg-secondary transition-colors"
            >
              <Upload className="size-3.5" /> Upload
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                openGallery((url) => onImagesChange([...images, { id: Math.random().toString(36).substr(2, 9), url }].slice(0, 5)));
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background border border-border text-xs font-medium hover:bg-secondary transition-colors"
            >
              <GalleryHorizontal className="size-3.5" /> Gallery
            </button>
          </div>
          <p className="text-xs text-muted-foreground">or drop an image here</p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex items-center justify-center gap-3 flex-wrap overflow-hidden">
          {images.map((img, index) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="relative group"
            >
              <div className="w-28 h-36 rounded-2xl overflow-hidden border border-border bg-card shadow-md">
                <img src={img.url} alt="Input" className="w-full h-full object-cover" />
              </div>
              <button
                onClick={() => onImagesChange(images.filter(i => i.id !== img.id))}
                className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <X className="size-3" />
              </button>
            </motion.div>
          ))}
          {images.length < 5 && (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-28 h-36 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:border-primary/30 hover:text-foreground transition-all"
            >
              <Upload className="size-5 mb-1" />
              <span className="text-[10px]">Thêm ảnh</span>
            </button>
          )}
          <input
            type="file" multiple accept="image/*" ref={fileRef}
            className="hidden"
            onChange={(e) => { if (e.target.files) addFiles(Array.from(e.target.files)); }}
          />
        </div>
      )}

      {/* Extra controls */}
      {showPrompt && (
        <div className="shrink-0 flex flex-col gap-2 mt-3">
          <textarea
            rows={2} value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder={placeholderText}
            className="w-full px-3 py-2 text-xs rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none resize-none transition-all"
          />

          {selectedTool === AIToolType.IMAGE_TO_VIDEO && (
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Thời lượng:</span>
                {([5, 10] as const).map(d => (
                  <button key={d} onClick={() => onVideoDurationChange(d)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${videoDuration === d ? "bg-foreground text-background" : "bg-secondary/40 text-muted-foreground hover:bg-secondary"}`}>
                    {d}s
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Chất lượng:</span>
                {(["480p", "720p", "1080p"] as const).map(r => (
                  <button key={r} onClick={() => onVideoResolutionChange(r)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${videoResolution === r ? "bg-foreground text-background" : "bg-secondary/40 text-muted-foreground hover:bg-secondary"}`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
