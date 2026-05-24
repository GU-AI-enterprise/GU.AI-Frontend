"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Image as ImageIcon,
  FolderOpen,
  History,
  Settings,
  LogOut,
  LayoutDashboard,
  User,
  ChevronRight,
  UploadCloud,
  FolderHeart,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import Logo from "@/components/shared/logo";

const mainNav = [
  { href: "/dashboard", label: "Tổng quan", Icon: LayoutDashboard },
  { href: "/studio", label: "Studio", Icon: Sparkles },
];

const archiveNav = [
  { href: "/archive/gallery", label: "Tất cả ảnh", Icon: ImageIcon },
  { href: "/archive/collections", label: "Bộ sưu tập", Icon: FolderHeart },
  { href: "/archive/upload", label: "Upload hàng loạt", Icon: UploadCloud },
];

const bottomNav = [
  { href: "/profile", label: "Hồ sơ", Icon: User },
  { href: "/settings", label: "Cài đặt", Icon: Settings },
  { href: "/logout", label: "Đăng xuất", Icon: LogOut },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(pathname.startsWith("/archive"));
  const [archiveFlyoutOpen, setArchiveFlyoutOpen] = useState(false);
  const [archiveFlyoutPos, setArchiveFlyoutPos] = useState<{ top: number; left: number } | null>(null);
  const [tooltip, setTooltip] = useState<{ label: string; top: number } | null>(null);
  const archiveFlyoutTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved) setCollapsed(saved === "true");
  }, []);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
  };

  return (
    <>
      <aside
        className={`border-r border-border bg-sidebar h-screen sticky top-0 flex flex-col transition-[width] duration-300 ${
          collapsed ? "w-[70px]" : "w-[260px]"
        }`}
      >
        {/* Header */}
        <div className="flex h-16 items-center px-4 border-b border-sidebar-border">
          <div className="flex-1">
            <Logo iconOnly={collapsed} />
          </div>
        </div>

        {/* Main Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Workspace */}
          <div className="space-y-1">
            {!collapsed && (
              <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                Workspace
              </div>
            )}

            {mainNav.map(({ href, label, Icon }) => {
              const active = isActive(href);
              return (
                <div key={href} className="relative" onMouseLeave={() => setTooltip(null)}>
                  <Link
                    href={href}
                    onMouseEnter={(e) => {
                      if (collapsed) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltip({ label, top: rect.top + rect.height / 2 });
                      }
                    }}
                    className={`flex items-center ${collapsed ? "justify-center" : "gap-3 px-3"} h-10 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    <Icon className={`size-[18px] flex-shrink-0 ${active ? "text-primary" : ""}`} />
                    {!collapsed && <span>{label}</span>}
                  </Link>
                </div>
              );
            })}

            {/* Archive Dropdown */}
            <div
              className="relative"
              onMouseEnter={(e) => {
                if (collapsed) {
                  if (archiveFlyoutTimeoutRef.current) {
                    clearTimeout(archiveFlyoutTimeoutRef.current);
                    archiveFlyoutTimeoutRef.current = null;
                  }
                  const rect = e.currentTarget.getBoundingClientRect();
                  setArchiveFlyoutPos({ top: rect.top, left: rect.right + 8 });
                  setArchiveFlyoutOpen(true);
                }
              }}
              onMouseLeave={() => {
                archiveFlyoutTimeoutRef.current = setTimeout(() => {
                  setArchiveFlyoutOpen(false);
                }, 200);
              }}
            >
              <button
                onClick={() => !collapsed && setArchiveOpen(!archiveOpen)}
                onMouseLeave={() => setTooltip(null)}
                className={`w-full flex items-center ${collapsed ? "justify-center" : "justify-between px-3"} h-10 rounded-lg text-sm font-medium transition-all ${
                  isActive("/archive")
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <div className="flex items-center gap-3">
                  <FolderOpen className={`size-[18px] flex-shrink-0 ${isActive("/archive") ? "text-primary" : ""}`} />
                  {!collapsed && <span>Kho lưu trữ</span>}
                </div>
                {!collapsed && (
                  <ChevronRight className={`size-4 transition-transform ${archiveOpen ? "rotate-90" : ""}`} />
                )}
              </button>

              {/* Expanded submenu */}
              {!collapsed && archiveOpen && (
                <div className="ml-6 mt-1 space-y-1 border-l border-sidebar-border pl-3">
                  {archiveNav.map(({ href, label, Icon }) => {
                    const active = isActive(href);
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={`flex items-center gap-3 h-9 rounded-md px-2 text-sm transition-all ${
                          active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        }`}
                      >
                        <Icon className={`size-4 ${active ? "text-primary" : ""}`} />
                        <span className="text-xs">{label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}

            </div>

            <div className="relative" onMouseLeave={() => setTooltip(null)}>
              <Link
                href="/history"
                onMouseEnter={(e) => {
                  if (collapsed) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltip({ label: "Lịch sử tác vụ", top: rect.top + rect.height / 2 });
                  }
                }}
                className={`flex items-center ${collapsed ? "justify-center" : "gap-3 px-3"} h-10 rounded-lg text-sm font-medium transition-all ${
                  isActive("/history")
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <History className={`size-[18px] flex-shrink-0 ${isActive("/history") ? "text-primary" : ""}`} />
                {!collapsed && <span>Lịch sử tác vụ</span>}
              </Link>
            </div>
          </div>
        </nav>

        {/* Bottom Nav */}
        <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
          {bottomNav.map(({ href, label, Icon }) => {
            const active = isActive(href);
            return (
              <div key={href} className="relative" onMouseLeave={() => setTooltip(null)}>
                <Link
                  href={href}
                  onMouseEnter={(e) => {
                    if (collapsed) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltip({ label, top: rect.top + rect.height / 2 });
                    }
                  }}
                  className={`flex items-center ${collapsed ? "justify-center" : "gap-3 px-3"} h-10 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <Icon className={`size-[18px] flex-shrink-0 ${active ? "text-primary" : ""}`} />
                  {!collapsed && <span>{label}</span>}
                </Link>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Toggle button (outside aside to avoid overflow clipping) */}
      <button
        onClick={toggle}
        className="fixed z-50 p-1.5 rounded-md bg-background border border-border shadow-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        style={{ left: collapsed ? "62px" : "252px", top: "20px" }}
      >
        {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
      </button>

      {/* Tooltip */}
      {collapsed && tooltip && !archiveFlyoutOpen && (
        <div
          className="fixed z-50 px-2.5 py-1.5 rounded-md bg-popover text-popover-foreground text-xs font-medium shadow-md border border-border pointer-events-none"
          style={{ left: "78px", top: tooltip.top, transform: "translateY(-50%)" }}
        >
          {tooltip.label}
        </div>
      )}

      {/* Archive flyout (fixed to escape overflow container) */}
      {collapsed && archiveFlyoutOpen && archiveFlyoutPos && (
        <div
          className="fixed z-50 min-w-[180px] rounded-lg bg-popover border border-border shadow-lg p-1.5"
          style={{ left: archiveFlyoutPos.left, top: archiveFlyoutPos.top }}
          onMouseEnter={() => {
            if (archiveFlyoutTimeoutRef.current) {
              clearTimeout(archiveFlyoutTimeoutRef.current);
              archiveFlyoutTimeoutRef.current = null;
            }
            setArchiveFlyoutOpen(true);
          }}
          onMouseLeave={() => {
            archiveFlyoutTimeoutRef.current = setTimeout(() => {
              setArchiveFlyoutOpen(false);
            }, 200);
          }}
        >
          <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1">
            Kho lưu trữ
          </div>
          {archiveNav.map(({ href, label, Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 h-9 rounded-md px-2.5 text-sm transition-all ${
                  active
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon className={`size-4 ${active ? "text-primary" : ""}`} />
                <span className="text-xs">{label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}

