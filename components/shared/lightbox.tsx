"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  X, Download, ZoomIn, ZoomOut, Maximize2, ChevronLeft, ChevronRight,
} from "lucide-react";

export interface LightboxAction {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: "default" | "destructive";
}

interface LightboxImage {
  url: string;
  filename?: string;
  createdAt?: string;
}

interface LightboxProps {
  imageUrl: string | null;
  onClose: () => void;
  /** Extra action buttons shown in the bottom toolbar */
  actions?: LightboxAction[];
  /** Filename hint for the download button */
  filename?: string;
  /** ISO timestamp — shown in top bar as creation time */
  createdAt?: string;
  /** Full image list for prev/next navigation */
  images?: LightboxImage[];
  /** Index of the currently open image within `images` */
  currentIndex?: number;
  /** Called when user navigates to a different image */
  onNavigate?: (index: number) => void;
}

const ZOOM_STEPS = [1, 1.5, 2, 3, 4];
const ZOOM_MIN = ZOOM_STEPS[0];
const ZOOM_MAX = ZOOM_STEPS[ZOOM_STEPS.length - 1];

export function Lightbox({ imageUrl, onClose, actions = [], filename, createdAt, images, currentIndex, onNavigate }: LightboxProps) {
  const [isMounted, setIsMounted] = useState(false);
  const isOpen = !!imageUrl;

  const [zoom, setZoom]   = useState(1);
  const [panX, setPanX]   = useState(0);
  const [panY, setPanY]   = useState(0);

  const dragging  = useRef(false);
  const lastPos   = useRef({ x: 0, y: 0 });
  const imgRef    = useRef<HTMLImageElement>(null);

  const hasNav   = !!images && images.length > 1;
  const navIndex = currentIndex ?? 0;
  const activeImg = hasNav ? images![navIndex] : null;
  const activeUrl      = activeImg?.url      ?? imageUrl ?? undefined;
  const activeFilename = activeImg?.filename ?? filename;
  const activeCreatedAt= activeImg?.createdAt ?? createdAt;

  // ── Mount guard for portal ─────────────────────────────────────────────────
  useEffect(() => { setIsMounted(true); }, []);

  // ── Reset zoom/pan when image changes ─────────────────────────────────────
  useEffect(() => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  }, [imageUrl]);

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape")                   { onClose(); return; }
      if (e.key === "+" || e.key === "=")       { e.preventDefault(); zoomIn(); }
      if (e.key === "-")                        { e.preventDefault(); zoomOut(); }
      if (e.key === "0")                        { e.preventDefault(); resetZoom(); }
      if (e.key === "ArrowLeft"  && hasNav)     { e.preventDefault(); goPrev(); }
      if (e.key === "ArrowRight" && hasNav)     { e.preventDefault(); goNext(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose, zoom]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Zoom helpers ───────────────────────────────────────────────────────────
  const zoomIn = useCallback(() => {
    setZoom(prev => {
      const next = ZOOM_STEPS.find(s => s > prev) ?? ZOOM_MAX;
      return next;
    });
  }, []);

  const zoomOut = useCallback(() => {
    setZoom(prev => {
      const next = [...ZOOM_STEPS].reverse().find(s => s < prev) ?? ZOOM_MIN;
      if (next <= 1) { setPanX(0); setPanY(0); }
      return next;
    });
  }, []);

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  }, []);

  // ── Navigation (defined after resetZoom so it can reference it) ────────────
  const goTo = useCallback((idx: number) => {
    if (!images) return;
    const clamped = (idx + images.length) % images.length;
    onNavigate?.(clamped);
    setZoom(1); setPanX(0); setPanY(0);
  }, [images, onNavigate]);

  const goPrev = useCallback(() => goTo(navIndex - 1), [goTo, navIndex]);
  const goNext = useCallback(() => goTo(navIndex + 1), [goTo, navIndex]);

  // ── Wheel zoom ─────────────────────────────────────────────────────────────
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.deltaY < 0) zoomIn();
    else zoomOut();
  }, [zoomIn, zoomOut]);

  // ── Drag pan ───────────────────────────────────────────────────────────────
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom <= 1) return;
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  }, [zoom]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    setPanX(p => p + dx);
    setPanY(p => p + dy);
    lastPos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onMouseUp = useCallback(() => { dragging.current = false; }, []);

  // ── Download ───────────────────────────────────────────────────────────────
  const handleDownload = () => {
    if (!activeUrl) return;
    const a = document.createElement("a");
    a.href = activeUrl;
    a.download = activeFilename ?? `guai_${Date.now()}.png`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!isMounted) return null;

  const zoomPct   = Math.round(zoom * 100);
  const canZoomIn  = zoom < ZOOM_MAX;
  const canZoomOut = zoom > ZOOM_MIN;

  return createPortal(
    <div
      className={`fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-sm transition-opacity duration-200 select-none ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/8">
        <div className="flex items-center gap-3">
          {activeFilename && (
            <span className="text-xs font-medium text-white/60 truncate max-w-[200px]">{activeFilename}</span>
          )}
          {activeCreatedAt && (
            <>
              {activeFilename && <span className="text-white/20">·</span>}
              <span className="text-[11px] text-white/40 font-mono">
                {new Date(activeCreatedAt).toLocaleString("vi-VN", {
                  day: "2-digit", month: "2-digit", year: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
              </span>
            </>
          )}
          {hasNav && (
            <>
              {(activeFilename || activeCreatedAt) && <span className="text-white/20">·</span>}
              <span className="text-[11px] text-white/40 font-mono">{navIndex + 1} / {images!.length}</span>
            </>
          )}
          {!activeFilename && !activeCreatedAt && !hasNav && (
            <span className="text-[11px] text-white/30">Xem ảnh</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-white/25 mr-1 font-mono hidden sm:block">ESC</span>
          <button
            onClick={onClose}
            className="flex items-center justify-center size-8 rounded-lg bg-white/8 hover:bg-white/16 text-white/70 hover:text-white transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* ── Image area ──────────────────────────────────────────────────────── */}
      <div
        className="flex-1 min-h-0 overflow-hidden flex items-center justify-center"
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onClick={(e) => { if (zoom <= 1 && e.target === e.currentTarget) onClose(); }}
        style={{ cursor: zoom > 1 ? (dragging.current ? "grabbing" : "grab") : "default" }}
      >
        {/* Prev button */}
        {hasNav && (
          <button
            onClick={goPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center size-10 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm border border-white/10 transition-all z-10"
          >
            <ChevronLeft className="size-5" />
          </button>
        )}

        <img
          ref={imgRef}
          src={activeUrl}
          alt="Phóng to"
          draggable={false}
          onDoubleClick={zoom > 1 ? resetZoom : zoomIn}
          style={{
            transform: `scale(${zoom}) translate(${panX / zoom}px, ${panY / zoom}px)`,
            transition: dragging.current ? "none" : "transform 0.18s ease",
            maxWidth: "90vw",
            maxHeight: "calc(90vh - 120px)",
            borderRadius: "12px",
            objectFit: "contain",
            boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
            cursor: zoom > 1 ? (dragging.current ? "grabbing" : "grab") : "zoom-in",
          }}
        />

        {/* Next button */}
        {hasNav && (
          <button
            onClick={goNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center size-10 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm border border-white/10 transition-all z-10"
          >
            <ChevronRight className="size-5" />
          </button>
        )}
      </div>

      {/* ── Bottom toolbar ──────────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center justify-center gap-2 px-4 py-3 border-t border-white/8">

        {/* Zoom controls */}
        <div className="flex items-center gap-1 bg-white/8 rounded-xl p-1">
          <button
            onClick={zoomOut}
            disabled={!canZoomOut}
            className="flex items-center justify-center size-8 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Thu nhỏ (−)"
          >
            <ZoomOut className="size-4" />
          </button>

          <button
            onClick={resetZoom}
            className="min-w-[52px] px-2 py-1 rounded-lg hover:bg-white/10 text-white text-xs font-mono font-semibold transition-colors"
            title="Đặt lại (0)"
          >
            {zoomPct}%
          </button>

          <button
            onClick={zoomIn}
            disabled={!canZoomIn}
            className="flex items-center justify-center size-8 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Phóng to (+)"
          >
            <ZoomIn className="size-4" />
          </button>

          <div className="w-px h-4 bg-white/15 mx-0.5" />

          <button
            onClick={resetZoom}
            disabled={zoom === 1 && panX === 0 && panY === 0}
            className="flex items-center justify-center size-8 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Vừa màn hình"
          >
            <Maximize2 className="size-3.5" />
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-white/15" />

        {/* Download */}
        <button
          onClick={handleDownload}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/8 hover:bg-white/14 text-white/80 hover:text-white text-xs font-medium transition-colors"
        >
          <Download className="size-3.5" />
          Tải xuống
        </button>

        {/* Custom actions */}
        {actions.length > 0 && (
          <>
            <div className="w-px h-6 bg-white/15" />
            {actions.map((action, i) => (
              <button
                key={i}
                onClick={action.onClick}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  action.variant === "destructive"
                    ? "bg-red-500/20 hover:bg-red-500/35 text-red-400 hover:text-red-300 border border-red-500/20"
                    : "bg-white/8 hover:bg-white/14 text-white/80 hover:text-white"
                }`}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </>
        )}
      </div>

      {/* Hint: double-click to reset / zoom */}
      {zoom > 1 && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 pointer-events-none">
          <span className="text-[10px] text-white/30 font-mono">Double-click để đặt lại</span>
        </div>
      )}
    </div>,
    document.body
  );
}
