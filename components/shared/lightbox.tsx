"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Download } from "lucide-react";

interface LightboxProps {
  imageUrl: string | null;
  onClose: () => void;
}

export function Lightbox({ imageUrl, onClose }: LightboxProps) {
  const [isMounted, setIsMounted] = useState(false);
  const isOpen = !!imageUrl;

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isMounted) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm transition-opacity duration-200 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      onClick={onClose}
    >
      <div
        className={`relative flex items-center justify-center transition-transform duration-200 ${isOpen ? "scale-100" : "scale-95"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl ?? undefined}
          alt="Phóng to"
          className="max-w-[90vw] max-h-[88vh] rounded-2xl object-contain shadow-2xl"
        />
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <a
            href={imageUrl ?? "#"}
            download={`guai_${Date.now()}.png`}
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-xl bg-black/60 backdrop-blur-sm border border-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <Download className="size-4" />
          </a>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-black/60 backdrop-blur-sm border border-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
