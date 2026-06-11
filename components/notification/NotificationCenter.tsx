"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { Bell, CheckCheck, Sparkles, Info, AlertTriangle, X, CreditCard, Wand2, MessageCircle, Settings } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/contexts/NotificationContext";
import { NotificationStatus, NotificationType } from "@/constants/notification";
import { cn } from "@/lib/utils";

const NOTIF_META: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  [NotificationType.PAYMENT]:   { icon: <CreditCard className="size-4" />,    label: "Thanh toán", color: "text-emerald-500" },
  [NotificationType.AI_JOB]:    { icon: <Wand2 className="size-4" />,         label: "AI Job",     color: "text-violet-400" },
  [NotificationType.SUPPORT]:   { icon: <MessageCircle className="size-4" />, label: "Hỗ trợ",     color: "text-sky-400"    },
  [NotificationType.SYSTEM]:    { icon: <Settings className="size-4" />,      label: "Hệ thống",   color: "text-muted-foreground" },
  [NotificationType.SECURITY]:  { icon: <AlertTriangle className="size-4" />, label: "Bảo mật",    color: "text-red-400"    },
  [NotificationType.PROMOTION]: { icon: <Sparkles className="size-4" />,      label: "Ưu đãi",     color: "text-amber-400"  },
};
const DEFAULT_META = { icon: <Info className="size-4" />, label: "", color: "text-primary" };

function NotifIcon({ type }: { type: string }) {
  const meta = NOTIF_META[type] ?? DEFAULT_META;
  return <span className={meta.color}>{meta.icon}</span>;
}

function NotifLabel({ type }: { type: string }) {
  const label = NOTIF_META[type]?.label;
  if (!label) return null;
  return (
    <span className="inline-block rounded-full bg-accent px-1.5 py-px text-[9px] font-medium text-muted-foreground uppercase tracking-wide leading-none">
      {label}
    </span>
  );
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Vừa xong";
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  return new Date(iso).toLocaleDateString("vi-VN");
}

interface DropdownPos { top: number; left: number; width: number; openUp: boolean }

interface Props {
  variant?: "sidebar" | "header";
  collapsed?: boolean;
}

export default function NotificationCenter({ variant = "sidebar", collapsed = false }: Props) {
  const { unreadCount, items, loading, loadItems, markRead, markAllRead } = useNotifications();

  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<DropdownPos | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const calcPos = useCallback(() => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom;
    const openUp = spaceBelow < 360 && r.top > 360;
    setPos({
      top: openUp ? r.top : r.bottom + 8,
      left: variant === "header" ? r.right - 320 : r.left,
      width: 320,
      openUp,
    });
  }, [variant]);

  const toggle = () => {
    if (!open) {
      calcPos();
      loadItems();
    }
    setOpen((v) => !v);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (btnRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    window.addEventListener("scroll", calcPos, true);
    window.addEventListener("resize", calcPos);
    return () => {
      window.removeEventListener("scroll", calcPos, true);
      window.removeEventListener("resize", calcPos);
    };
  }, [open, calcPos]);

  const dropdown = pos && (
    <AnimatePresence>
      {open && (
        <motion.div
          key="notification-panel"
          ref={panelRef}
          initial={{ opacity: 0, scale: 0.96, y: pos.openUp ? 6 : -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: pos.openUp ? 6 : -6 }}
          transition={{ duration: 0.15 }}
          style={{
            position: "fixed",
            top: pos.openUp ? undefined : pos.top,
            bottom: pos.openUp ? window.innerHeight - pos.top + 8 : undefined,
            left: pos.left,
            width: pos.width,
            zIndex: 9999,
          }}
          className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold">Thông báo</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="cursor-pointer flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors"
                >
                  <CheckCheck className="size-3.5" />
                  Đọc tất cả
                </button>
              )}
              <button onClick={() => setOpen(false)} className="cursor-pointer p-1 rounded-lg hover:bg-accent text-muted-foreground">
                <X className="size-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <ScrollArea className="h-80">
            {loading ? (
              <div className="flex items-center justify-center py-10 text-xs text-muted-foreground">Đang tải…</div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Bell className="size-8 text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground">Chưa có thông báo nào.</p>
              </div>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => n.status === NotificationStatus.UNREAD && markRead(n.id)}
                  className={cn(
                    "cursor-pointer flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50 border-b border-border/50 last:border-0",
                    n.status === NotificationStatus.UNREAD && "bg-primary/5"
                  )}
                >
                  <div className="mt-0.5 flex-shrink-0"><NotifIcon type={n.type} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className={cn("text-xs font-semibold truncate", n.status === NotificationStatus.UNREAD ? "text-foreground" : "text-muted-foreground")}>
                        {n.title}
                      </p>
                      <NotifLabel type={n.type} />
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">{n.content}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                  {n.status === NotificationStatus.UNREAD && (
                    <div className="mt-1.5 size-2 rounded-full bg-primary flex-shrink-0" />
                  )}
                </button>
              ))
            )}
          </ScrollArea>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* ── Sidebar variant ── */}
      {variant === "sidebar" && (
        <button
          ref={btnRef}
          onClick={toggle}
          className={cn(
            "cursor-pointer relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-all hover:bg-accent hover:text-foreground w-full",
            open && "bg-accent text-foreground"
          )}
        >
          <div className="relative flex-shrink-0">
            <Bell className="size-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
          {!collapsed && <span className="truncate">Thông báo</span>}
          {!collapsed && unreadCount > 0 && (
            <span className="ml-auto rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      )}

      {/* ── Header variant ── */}
      {variant === "header" && (
        <button
          ref={btnRef}
          onClick={toggle}
          className={cn(
            "cursor-pointer relative flex size-9 items-center justify-center rounded-xl border border-border/60 text-muted-foreground transition-all hover:bg-secondary hover:text-foreground",
            open && "bg-secondary text-foreground"
          )}
        >
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Portal: renders at document.body level */}
      {mounted && createPortal(dropdown, document.body)}
    </>
  );
}
