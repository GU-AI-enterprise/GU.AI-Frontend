"use client";

import { useEffect, useState } from "react";

// Catches errors thrown inside the root layout (e.g. providers crashing)
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    console.error("[GU.AI Global Error]", error);
  }, [error]);

  return (
    <html lang="vi">
      <body style={{ margin: 0, background: "#09090b", fontFamily: "system-ui, sans-serif" }}>
        <div style={{
          display: "flex", minHeight: "100vh", flexDirection: "column",
          alignItems: "center", justifyContent: "center", padding: "24px",
        }}>
          <div style={{ width: "100%", maxWidth: "420px" }}>
            {/* Icon */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#ef4444">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
            </div>

            {/* Text */}
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <h1 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 300, color: "#fafafa" }}>
                Ứng dụng gặp lỗi nghiêm trọng
              </h1>
              <p style={{ margin: 0, fontSize: 14, color: "#71717a" }}>
                {error.message || "Không thể khởi tạo ứng dụng."}
              </p>
              {error.digest && (
                <p style={{ margin: "6px 0 0", fontSize: 11, color: "#3f3f46", fontFamily: "monospace" }}>
                  digest: {error.digest}
                </p>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <button onClick={reset} style={{
                flex: 1, padding: "10px 0", borderRadius: 12, border: "none",
                background: "#a78bfa", color: "#fff", fontSize: 14, fontWeight: 500, cursor: "pointer",
              }}>
                Thử lại
              </button>
              <button onClick={() => window.location.href = "/"} style={{
                flex: 1, padding: "10px 0", borderRadius: 12,
                border: "1px solid #27272a", background: "#18181b",
                color: "#fafafa", fontSize: 14, fontWeight: 500, cursor: "pointer",
              }}>
                Về trang chủ
              </button>
            </div>

            {/* Error details */}
            <div style={{ borderRadius: 12, border: "1px solid #27272a", overflow: "hidden" }}>
              <button
                onClick={() => setOpen((v) => !v)}
                style={{
                  width: "100%", padding: "10px 16px", background: "transparent",
                  border: "none", color: "#71717a", fontSize: 12, cursor: "pointer",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}
              >
                <span>Chi tiết lỗi</span>
                <span style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
              </button>
              {open && (
                <div style={{ borderTop: "1px solid #27272a", padding: "12px 16px", background: "#0f0f0f" }}>
                  <p style={{ margin: "0 0 8px", fontFamily: "monospace", fontSize: 12, color: "#ef4444" }}>
                    {error.name}: {error.message}
                  </p>
                  {error.stack && (
                    <pre style={{
                      margin: 0, maxHeight: 180, overflow: "auto",
                      fontFamily: "monospace", fontSize: 10, color: "#52525b",
                      whiteSpace: "pre-wrap", wordBreak: "break-all",
                    }}>
                      {error.stack}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
