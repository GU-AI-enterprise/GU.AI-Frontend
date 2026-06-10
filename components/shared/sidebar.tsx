"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Image as ImageIcon,
  FolderOpen,
  History,
  LayoutDashboard,
  ChevronRight,
  UploadCloud,
  FolderHeart,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  Coins,
  LogOut,
  Settings,
  User,
  Sun,
  Moon,
  HelpCircle,
  MessageCircle,
  BookOpen,
  ChevronUp,
  Archive,
  Plus,
  Layers,
} from "lucide-react";
import Logo from "@/components/shared/logo";
import SupportChatWidget from "@/components/support/support-chat-widget";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchCredit, selectCreditBalance, setPlanType, selectPlanType } from "@/features/credit/creditSlice";
import { getTopupInfo } from "@/features/payment/paymentService";
import { supabase } from "@/lib/supabase";
import { useSupportUnread } from "@/contexts/SupportUnreadContext";
import { useSidebar } from "@/contexts/SidebarContext";

const mainNav = [
  { href: "/dashboard", label: "Tổng quan", Icon: LayoutDashboard, iconSrc: null },
  { href: "/studio", label: "Studio", Icon: null, iconSrc: "/icons/logo_only.png" },
  { href: "/library", label: "Thư viện", Icon: BookOpen, iconSrc: null },
];

const archiveNav = [
  { href: "/archive/gallery", label: "Ảnh & Video", Icon: Layers },
  { href: "/archive/models", label: "Người mẫu", Icon: FolderOpen },
  { href: "/archive/collections", label: "Bộ sưu tập", Icon: FolderHeart },
  { href: "/archive/upload", label: "Upload hàng loạt", Icon: UploadCloud },
  { href: "/archive/trash", label: "Archive", Icon: Archive },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { theme, setTheme } = useTheme();
  const { session, user } = useAppSelector((s) => s.auth);
  const credit = useAppSelector(selectCreditBalance);
  const planType = useAppSelector(selectPlanType);

  const { unreadCount, role: userRole, markRead } = useSupportUnread();
  const isStaff = userRole === "staff" || userRole === "admin";

  // Mobile drawer state comes from context; desktop collapsed is local
  const { isMobile, drawerOpen, close: closeDrawer } = useSidebar();

  const [collapsed, setCollapsed] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(pathname.startsWith("/archive"));
  const [archiveFlyout, setArchiveFlyout] = useState(false);
  const [archiveFlyoutPos, setArchiveFlyoutPos] = useState<{ top: number; left: number } | null>(null);
  const [tooltip, setTooltip] = useState<{ label: string; top: number } | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userMenuPos, setUserMenuPos] = useState<{ bottom: number; left: number } | null>(null);
  const [chatForceOpen, setChatForceOpen] = useState(false);
  const [isFakeAI, setIsFakeAI] = useState(false);

  // Sync and load fake AI mode state
  useEffect(() => {
    setIsFakeAI(localStorage.getItem("fake-ai-call") === "true");
    const syncFakeAI = () => {
      setIsFakeAI(localStorage.getItem("fake-ai-call") === "true");
    };
    window.addEventListener("fake-ai-toggle", syncFakeAI);
    return () => window.removeEventListener("fake-ai-toggle", syncFakeAI);
  }, []);

  const toggleFakeAI = () => {
    const newVal = !isFakeAI;
    setIsFakeAI(newVal);
    localStorage.setItem("fake-ai-call", String(newVal));
    window.dispatchEvent(new Event("fake-ai-toggle"));
  };

  const archiveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userBtnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // "icon-only" mode: only on desktop when collapsed
  const isCollapsed = !isMobile && collapsed;

  // ── Desktop: restore collapsed from localStorage ───────────────────────────
  useEffect(() => {
    if (isMobile) return;
    const saved = localStorage.getItem("sidebar-collapsed");
    setCollapsed(saved === "true");
  }, [isMobile]);

  // ── Auto-close mobile drawer on navigation ────────────────────────────────
  useEffect(() => {
    if (isMobile) closeDrawer();
  }, [pathname]); // eslint-disable-line

  useEffect(() => {
    if (session?.access_token) dispatch(fetchCredit());
  }, [session?.access_token, dispatch]);

  useEffect(() => {
    if (!session?.access_token) return;
    getTopupInfo().then(info => dispatch(setPlanType(info.plan_type))).catch(() => { });
  }, [session?.access_token, dispatch]);

  // ── Close user menu on outside click ────────────────────────────────────────
  useEffect(() => {
    if (!userMenuOpen) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideBtn = userBtnRef.current?.contains(target);
      const insideMenu = menuRef.current?.contains(target);
      if (!insideBtn && !insideMenu) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown, true);
    return () => document.removeEventListener("mousedown", onDown, true);
  }, [userMenuOpen]);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
    setUserMenuOpen(false);
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const openUserMenu = () => {
    if (!userBtnRef.current) return;
    const rect = userBtnRef.current.getBoundingClientRect();
    setUserMenuPos({
      bottom: window.innerHeight - rect.bottom,
      left: rect.right + 8,
    });
    setUserMenuOpen(v => !v);
  };

  // ── User info ────────────────────────────────────────────────────────────────
  const displayName = user?.user_metadata?.full_name
    || user?.user_metadata?.name
    || user?.email?.split("@")[0]
    || "Người dùng";
  const email = user?.email ?? "";
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const initials = displayName.charAt(0).toUpperCase();

  const PLAN_META = {
    free: { label: 'Free', color: 'text-slate-400', bg: 'bg-slate-400/10', dot: 'bg-slate-400' },
    basic: { label: 'Basic', color: 'text-blue-400', bg: 'bg-blue-400/10', dot: 'bg-blue-400' },
    pro: { label: 'Pro', color: 'text-violet-400', bg: 'bg-violet-400/10', dot: 'bg-violet-400' },
    agency: { label: 'Agency', color: 'text-amber-400', bg: 'bg-amber-400/10', dot: 'bg-amber-400' },
  } as const;
  const plan = PLAN_META[planType];

  return (
    <>
      {/* ── Backdrop for mobile drawer ── */}
      {isMobile && drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={closeDrawer}
        />
      )}

      <aside
        className={
          isMobile
            ? `fixed left-0 top-0 h-screen z-50 bg-sidebar border-r border-border flex flex-col w-[280px] shadow-2xl transition-transform duration-300 ease-in-out ${drawerOpen ? "translate-x-0" : "-translate-x-full"}`
            : `border-r border-border bg-sidebar h-screen sticky top-0 flex flex-col transition-[width] duration-300 ${isCollapsed ? "w-[70px]" : "w-[260px]"}`
        }
      >
        {/* ── Logo ── */}
        <div className="flex h-16 items-center px-4 border-b border-sidebar-border">
          <div className="flex-1">
            <Logo iconOnly={isCollapsed} />
          </div>
        </div>

        {/* ── Main Nav ── */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                Workspace
              </div>
            )}

            {mainNav.map(({ href, label, Icon, iconSrc }) => {
              const active = isActive(href);
              return (
                <div key={href} className="relative" onMouseLeave={() => setTooltip(null)}>
                  <Link
                    href={href}
                    onMouseEnter={(e) => {
                      if (isCollapsed) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltip({ label, top: rect.top + rect.height / 2 });
                      }
                    }}
                    className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3 px-3"} h-10 rounded-lg text-sm font-medium transition-all ${active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      }`}
                  >
                    {iconSrc ? (
                      <img src={iconSrc} alt={label} className="size-[18px] flex-shrink-0 object-contain" />
                    ) : Icon ? (
                      <Icon className={`size-[18px] flex-shrink-0 ${active ? "text-primary" : ""}`} />
                    ) : null}
                    {!isCollapsed && <span>{label}</span>}
                  </Link>
                </div>
              );
            })}

            {/* Archive dropdown */}
            <div
              className="relative"
              onMouseEnter={(e) => {
                if (isCollapsed) {
                  if (archiveTimeout.current) { clearTimeout(archiveTimeout.current); archiveTimeout.current = null; }
                  const rect = e.currentTarget.getBoundingClientRect();
                  setArchiveFlyoutPos({ top: rect.top, left: rect.right + 8 });
                  setArchiveFlyout(true);
                }
              }}
              onMouseLeave={() => {
                archiveTimeout.current = setTimeout(() => setArchiveFlyout(false), 200);
              }}
            >
              <button
                onClick={() => !isCollapsed && setArchiveOpen(!archiveOpen)}
                onMouseLeave={() => setTooltip(null)}
                className={`cursor-pointer w-full flex items-center ${isCollapsed ? "justify-center" : "justify-between px-3"} h-10 rounded-lg text-sm font-medium transition-all ${isActive("/archive")
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <FolderOpen className={`size-[18px] flex-shrink-0 ${isActive("/archive") ? "text-primary" : ""}`} />
                  {!isCollapsed && <span>Kho lưu trữ</span>}
                </div>
                {!isCollapsed && <ChevronRight className={`size-4 transition-transform ${archiveOpen ? "rotate-90" : ""}`} />}
              </button>

              {!isCollapsed && archiveOpen && (
                <div className="ml-6 mt-1 space-y-1 border-l border-sidebar-border pl-3">
                  {archiveNav.map(({ href, label, Icon }) => {
                    const active = isActive(href);
                    return (
                      <Link key={href} href={href} className={`flex items-center gap-3 h-9 rounded-md px-2 text-sm transition-all ${active ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        }`}>
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
                  if (isCollapsed) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltip({ label: "Lịch sử tác vụ", top: rect.top + rect.height / 2 });
                  }
                }}
                className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3 px-3"} h-10 rounded-lg text-sm font-medium transition-all ${isActive("/history")
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
              >
                <History className={`size-[18px] flex-shrink-0 ${isActive("/history") ? "text-primary" : ""}`} />
                {!isCollapsed && <span>Lịch sử tác vụ</span>}
              </Link>
            </div>

            {/* Support nav — only for staff/admin */}
            {isStaff && (
              <div className="relative" onMouseLeave={() => setTooltip(null)}>
                <Link
                  href="/admin/support"
                  onMouseEnter={(e) => {
                    if (isCollapsed) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltip({ label: "Hỗ trợ khách hàng", top: rect.top + rect.height / 2 });
                    }
                  }}
                  className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3 px-3"} h-10 rounded-lg text-sm font-medium transition-all ${isActive("/admin/support")
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                >
                  <span className="relative flex-shrink-0">
                    <MessageCircle className={`size-[18px] ${isActive("/admin/support") ? "text-primary" : ""}`} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1.5 flex size-[14px] items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white leading-none">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </span>
                  {!isCollapsed && (
                    <span className="flex items-center gap-2 flex-1">
                      Hỗ trợ khách hàng
                      {unreadCount > 0 && (
                        <span className="ml-auto flex items-center justify-center rounded-full bg-red-500 px-1.5 min-w-[18px] h-[16px] text-[9px] font-bold text-white leading-none">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </span>
                  )}
                </Link>
              </div>
            )}
          </div>


        </nav>

        {/* ── Credit + Plan ── */}
        {credit !== null && (
          <div className="px-3 pb-2 border-t border-sidebar-border pt-3">
            {isCollapsed ? (
              <div className="flex flex-col items-center gap-1.5 py-1">
                <Link
                  href="/topup"
                  title={`${credit.toLocaleString()} credits — Nạp thêm`}
                  className="relative flex items-center justify-center size-9 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  <Coins className="size-4" />
                  {planType !== 'free' && (
                    <span className={`absolute -top-1 -right-1 size-2.5 rounded-full border-2 border-sidebar ${plan.dot}`} />
                  )}
                </Link>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-xl bg-primary/8 border border-primary/15 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <Coins className="size-4 text-primary shrink-0" />
                  <span className="text-xs font-medium text-muted-foreground">Credits</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground tabular-nums">{credit.toLocaleString()}</span>
                  <Link
                    href="/topup"
                    title="Nạp credits"
                    className="flex items-center justify-center size-5 rounded-md bg-primary/15 text-primary hover:bg-primary/25 transition-colors"
                  >
                    <Plus className="size-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Fake AI Call Toggle ── */}
        <div className="px-3 pb-2">
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-1.5 py-1">
              <button
                onClick={toggleFakeAI}
                title={isFakeAI ? "Fake AI Calls: Đang bật" : "Fake AI Calls: Đang tắt"}
                className={`cursor-pointer relative flex items-center justify-center size-9 rounded-xl border transition-colors ${isFakeAI
                    ? "bg-amber-500/15 text-amber-500 border-amber-500/30 hover:bg-amber-500/25"
                    : "bg-secondary/40 text-muted-foreground border-transparent hover:bg-secondary hover:text-foreground"
                  }`}
              >
                <Sparkles className={`size-4.5 ${isFakeAI ? "animate-pulse text-amber-500" : ""}`} />
                {isFakeAI && (
                  <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-amber-500 border-2 border-sidebar" />
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={toggleFakeAI}
              className={`cursor-pointer w-full flex items-center justify-between px-3 h-10 rounded-xl text-xs font-medium border transition-all ${isFakeAI
                  ? "bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20"
                  : "bg-secondary/40 text-muted-foreground border-transparent hover:bg-secondary hover:text-foreground"
                }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className={`size-4 ${isFakeAI ? "animate-pulse text-amber-500" : ""}`} />
                <span>Fake AI Calls</span>
              </div>
              <div className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-200 ${isFakeAI ? "bg-amber-500" : "bg-muted-foreground/30"}`}>
                <div className={`w-3 h-3 rounded-full bg-white transition-transform duration-200 ${isFakeAI ? "translate-x-4" : "translate-x-0"}`} />
              </div>
            </button>
          )}
        </div>

        {/* ── User card (bottom) ── */}
        <div className="px-3 py-3 border-t border-sidebar-border">
          <button
            ref={userBtnRef}
            onClick={openUserMenu}
            onMouseEnter={(e) => {
              if (isCollapsed) {
                const rect = e.currentTarget.getBoundingClientRect();
                setTooltip({ label: displayName, top: rect.top + rect.height / 2 });
              }
            }}
            onMouseLeave={() => setTooltip(null)}
            className={`cursor-pointer w-full flex items-center ${isCollapsed ? "justify-center" : "gap-3 px-2"} h-11 rounded-xl hover:bg-sidebar-accent transition-colors group`}
          >
            {/* Avatar */}
            <div className="shrink-0 relative">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} referrerPolicy="no-referrer"
                  className="size-8 rounded-full object-cover border-2 border-border/60" />
              ) : (
                <div className="size-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground border-2 border-primary/20">
                  {initials}
                </div>
              )}
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-sidebar border-0 leading-none">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>

            {/* Name + email */}
            {!isCollapsed && (
              <>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-semibold text-sidebar-foreground truncate leading-tight">{displayName}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`shrink-0 inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${plan.bg} ${plan.color}`}>
                      <span className={`size-1 rounded-full ${plan.dot}`} />
                      {plan.label}
                    </span>
                    <p className="text-[11px] text-sidebar-foreground/50 truncate leading-tight">{email}</p>
                  </div>
                </div>
                <ChevronUp className="size-3.5 text-sidebar-foreground/40 group-hover:text-sidebar-foreground/70 transition-colors shrink-0" />
              </>
            )}
          </button>
        </div>
      </aside>

      {/* ── Desktop toggle button (hidden on mobile — topbar has the hamburger) ── */}
      {!isMobile && (
        <button
          onClick={toggle}
          className="cursor-pointer fixed z-50 p-1.5 rounded-md bg-background border border-border shadow-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          style={{ left: isCollapsed ? "62px" : "252px", top: "20px" }}
        >
          {isCollapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
        </button>
      )}

      {/* ── Tooltip ── */}
      {isCollapsed && tooltip && !archiveFlyout && !userMenuOpen && (
        <div
          className="fixed z-50 px-2.5 py-1.5 rounded-md bg-popover text-popover-foreground text-xs font-medium shadow-md border border-border pointer-events-none"
          style={{ left: "78px", top: tooltip.top, transform: "translateY(-50%)" }}
        >
          {tooltip.label}
        </div>
      )}

      {/* ── Archive flyout ── */}
      {isCollapsed && archiveFlyout && archiveFlyoutPos && (
        <div
          className="fixed z-50 min-w-[180px] rounded-lg bg-popover border border-border shadow-lg p-1.5"
          style={{ left: archiveFlyoutPos.left, top: archiveFlyoutPos.top }}
          onMouseEnter={() => { if (archiveTimeout.current) { clearTimeout(archiveTimeout.current); archiveTimeout.current = null; } setArchiveFlyout(true); }}
          onMouseLeave={() => { archiveTimeout.current = setTimeout(() => setArchiveFlyout(false), 200); }}
        >
          <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1">Kho lưu trữ</div>
          {archiveNav.map(({ href, label, Icon }) => {
            const active = isActive(href);
            return (
              <Link key={href} href={href} className={`flex items-center gap-2.5 h-9 rounded-md px-2.5 text-sm transition-all ${active ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}>
                <Icon className="size-4" />
                {label}
              </Link>
            );
          })}
        </div>
      )}

      {/* ── User menu popup (fixed, escapes overflow) ── */}
      {userMenuOpen && userMenuPos && (
        <div
          ref={menuRef}
          className="fixed z-50 w-64 rounded-2xl border border-border bg-popover shadow-xl overflow-hidden"
          style={{ bottom: userMenuPos.bottom, left: userMenuPos.left }}
        >
          {/* User info header */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} referrerPolicy="no-referrer"
                className="size-9 rounded-full object-cover border border-border/60 shrink-0" />
            ) : (
              <div className="size-9 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground shrink-0">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${plan.bg} ${plan.color}`}>
                  <span className={`size-1.5 rounded-full ${plan.dot}`} />
                  {plan.label}
                </span>
                <p className="text-xs text-muted-foreground truncate">{email}</p>
              </div>
            </div>
          </div>

          {/* Account links */}
          <div className="p-1.5">
            <MenuItem icon={<User className="size-4" />} label="Hồ sơ" href="/profile" onClick={() => setUserMenuOpen(false)} />
            <MenuItem icon={<Settings className="size-4" />} label="Cài đặt" href="/settings" onClick={() => setUserMenuOpen(false)} />
          </div>

          <div className="border-t border-border/60 p-1.5">
            {/* Theme toggle */}
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl">
              <Sun className="size-4 text-muted-foreground shrink-0" />
              <span className="flex-1 text-sm text-foreground">Giao diện</span>
              <div className="flex items-center gap-0.5 bg-muted rounded-lg p-0.5">
                <button
                  onClick={() => setTheme("light")}
                  className={`cursor-pointer flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all ${theme === "light" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <Sun className="size-3" /> Sáng
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`cursor-pointer flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all ${theme === "dark" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <Moon className="size-3" /> Tối
                </button>
              </div>
            </div>
          </div>

          {/* Help & Support */}
          <div className="border-t border-border/60 p-1.5">
            <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Trợ giúp
            </div>
            <MenuItem icon={<BookOpen className="size-4" />} label="Help Center" href="#" onClick={() => setUserMenuOpen(false)} />
            {!isStaff && (
              <button
                onClick={() => { setUserMenuOpen(false); setChatForceOpen(true); setTimeout(() => setChatForceOpen(false), 200); }}
                className="cursor-pointer w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-foreground hover:bg-accent transition-colors"
              >
                <span className="text-muted-foreground relative shrink-0">
                  <MessageCircle className="size-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex size-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white leading-none">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </span>
                Chat với chúng tôi
                {unreadCount > 0 && (
                  <span className="ml-auto flex items-center justify-center rounded-full bg-red-500 px-1.5 min-w-[18px] h-[16px] text-[9px] font-bold text-white leading-none">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            )}
            <MenuItem icon={<HelpCircle className="size-4" />} label="Discord" href="#" onClick={() => setUserMenuOpen(false)} />
          </div>

          {/* Logout */}
          <div className="border-t border-border/60 p-1.5">
            <button
              onClick={handleLogout}
              className="cursor-pointer w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <LogOut className="size-4" />
              Đăng xuất
            </button>
          </div>
        </div>
      )}

      {/* ── Support chat widget (triggered from menu, no float button) ── */}
      <SupportChatWidget forceOpen={chatForceOpen} hideFloatButton />
    </>
  );
}

// ── MenuItem ────────────────────────────────────────────────────────────────────
function MenuItem({ icon, label, href, onClick }: {
  icon: React.ReactNode;
  label: string;
  href: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-foreground hover:bg-accent transition-colors"
    >
      <span className="text-muted-foreground">{icon}</span>
      {label}
    </Link>
  );
}
