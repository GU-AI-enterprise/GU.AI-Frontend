"use client";

import { useEffect, useState } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    console.error("[GU.AI Error Boundary]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="flex size-16 items-center justify-center rounded-full border border-destructive/20 bg-destructive/10">
            <svg className="size-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1 text-center">
          <h1 className="font-serif text-2xl font-light text-foreground">
            Đã xảy ra <span className="italic text-destructive">lỗi</span>
          </h1>
          <p className="text-sm font-light text-muted-foreground">
            {error.message || "Trang không thể tải được."}
          </p>
          {error.digest && (
            <p className="font-mono text-xs text-muted-foreground/50">
              digest: {error.digest}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={reset}
            className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Thử lại
          </button>
          <button
            onClick={() => window.location.href = "/"}
            className="flex-1 rounded-xl border border-border bg-card py-2.5 text-sm font-medium text-foreground transition hover:bg-secondary"
          >
            Về trang chủ
          </button>
        </div>

        {/* Error details dropdown */}
        <div className="rounded-xl border border-border overflow-hidden">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-3 text-left text-xs font-medium text-muted-foreground transition hover:bg-secondary"
          >
            <span>Chi tiết lỗi</span>
            <svg
              className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {open && (
            <div className="border-t border-border bg-muted/30 px-4 py-3">
              <p className="mb-1 font-mono text-xs font-semibold text-destructive">
                {error.name}: {error.message}
              </p>
              {error.stack && (
                <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-all font-mono text-[10px] leading-relaxed text-muted-foreground">
                  {error.stack}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
