"use client";

import { useRef, useState, useCallback } from "react";
import { ChevronsLeftRight } from "lucide-react";

interface Props {
  beforeUrl: string;
  afterUrl: string;
}

export function ComparisonSlider({ beforeUrl, afterUrl }: Props) {
  const [pos, setPos] = useState(50);
  const dragging = useRef(false);
  const rootRef   = useRef<HTMLDivElement>(null);

  const move = useCallback((clientX: number) => {
    const el = rootRef.current;
    if (!el) return;
    const { left, width } = el.getBoundingClientRect();
    setPos(Math.max(4, Math.min(96, ((clientX - left) / width) * 100)));
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    move(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragging.current) move(e.clientX);
  };
  const onPointerUp = () => { dragging.current = false; };

  return (
    <div
      ref={rootRef}
      className="relative w-full h-full overflow-hidden select-none cursor-ew-resize"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      {/* After — full width base */}
      <img
        src={afterUrl}
        alt="Sau"
        draggable={false}
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
      />

      {/* Before — clipped to left side */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        <img
          src={beforeUrl}
          alt="Trước"
          draggable={false}
          className="absolute inset-0 w-full h-full object-contain"
        />
        {/* subtle dark overlay to differentiate before */}
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-[1.5px] bg-white/90 shadow-[0_0_12px_rgba(0,0,0,0.35)] pointer-events-none"
        style={{ left: `${pos}%`, transform: "translateX(-50%)" }}
      >
        {/* Handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center size-8 rounded-full bg-white shadow-lg ring-1 ring-black/10 pointer-events-none">
          <ChevronsLeftRight className="size-3.5 text-black/60" />
        </div>
      </div>

    </div>
  );
}
