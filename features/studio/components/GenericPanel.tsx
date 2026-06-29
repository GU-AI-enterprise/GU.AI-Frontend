"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Upload, X } from "lucide-react";
import type { StudioImage } from "../types";
import { fileToStudioImage } from "../helpers";
import { DropZoneContent } from "./DropZoneContent";

interface Props {
  images: StudioImage[];
  onImagesChange: (imgs: StudioImage[]) => void;
  onPaste: (onImage: (file: File) => void) => Promise<void>;
  openGallery: (cb: (url: string) => void) => void;
}

export function GenericPanel({ images, onImagesChange, onPaste, openGallery }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const addFiles = (files: File[]) => {
    const imgs = files.filter(f => f.type.startsWith("image/")).map(fileToStudioImage);
    onImagesChange([...images, ...imgs].slice(0, 5));
  };

  // Native paste event — fires when Ctrl+V pressed while zone is focused
  const handleNativePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const files: File[] = [];
    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }
    if (files.length > 0) addFiles(files);
  };

  const addFromGallery = (url: string) =>
    onImagesChange([...images, { id: Math.random().toString(36).substr(2, 9), url }].slice(0, 5));

  const addFromPasteBtn = () =>
    onPaste((f) => onImagesChange([...images, fileToStudioImage(f)].slice(0, 5)));

  return (
    <div
      className="h-full flex flex-col min-h-0"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        addFiles(Array.from(e.dataTransfer.files));
      }}
    >
      {images.length === 0 ? (
        /* Drop / focus zone — click to focus, then Ctrl+V to paste */
        <div
          tabIndex={0}
          onPaste={handleNativePaste}
          className="flex-1 min-h-0 rounded-3xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 cursor-default select-none @container
            hover:border-primary/30 hover:bg-card
            focus:outline-none focus:border-primary/60 focus:bg-primary/5
            transition-all"
        >
          <input
            type="file" multiple accept="image/*" ref={fileRef}
            className="hidden"
            onChange={(e) => { if (e.target.files) addFiles(Array.from(e.target.files)); }}
          />

          <DropZoneContent
            onUpload={() => fileRef.current?.click()}
            onPaste={addFromPasteBtn}
            onGallery={() => openGallery(addFromGallery)}
          />
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex items-center justify-center gap-3 overflow-x-auto overflow-y-hidden p-4">
          {images.map((img, index) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="relative group h-full max-h-96 shrink-0"
            >
              <div className="h-full aspect-[3/4] rounded-2xl overflow-hidden border border-border bg-card shadow-md">
                <img src={img.url} alt="Input" className="w-full h-full object-cover" />
              </div>
              <button
                onClick={() => onImagesChange(images.filter(i => i.id !== img.id))}
                className="cursor-pointer absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <X className="size-3" />
              </button>
            </motion.div>
          ))}
          {images.length < 5 && (
            <button
              onClick={() => fileRef.current?.click()}
              className="cursor-pointer h-full max-h-96 aspect-[3/4] shrink-0 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:border-primary/30 hover:text-foreground transition-all"
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
    </div>
  );
}
