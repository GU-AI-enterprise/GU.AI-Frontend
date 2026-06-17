"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Logo from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { LogOut, User as UserIcon, LayoutDashboard, Settings, ChevronDown, Shirt, Box, Shuffle, UserRound, Video, Pencil, Crop, ImageUp } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import NotificationCenter from "@/components/notification/NotificationCenter";
import { fetchCredit, selectPlanType } from "@/features/credit/creditSlice";
import { PLAN_VISUALS } from "@/features/credit/planMeta";
import { PlanAvatarRing } from "@/features/credit/PlanGlow";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const authLoading = useAppSelector((state) => state.auth.loading);
  const planType = useAppSelector(selectPlanType);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 20);
      if (currentY > lastScrollY.current && currentY > 80) {
        setVisible(false);
      } else if (currentY < lastScrollY.current) {
        setVisible(true);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) {
        setIsToolsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) dispatch(fetchCredit());
  }, [user, dispatch]);

  const plan = PLAN_VISUALS[planType];
  const avatarBorderClass = plan.ringClass ? "" : "border border-primary/20";

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsDropdownOpen(false);
    router.push("/");
    router.refresh();
  };

  // Determine standard links based on whether we are on landing page or subpages
  const isLanding = pathname === "/";

  return (
    <header className={`sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl transition-all duration-300 ${visible ? "translate-y-0" : "-translate-y-full"
      } ${scrolled ? "shadow-sm" : ""}`}>
      <div className="relative mx-auto flex h-16 max-w-7xl items-center px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Logo />
        </div>

        {/* Main Navigation — absolutely centered so it never shifts */}
        <nav className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <Link href="/" className={`hover:text-foreground transition-colors ${pathname === "/" ? "text-primary" : ""}`}>
            Trang chủ
          </Link>
          {/* AI Tools dropdown */}
          <div className="relative" ref={toolsRef}>
            <button
              onClick={() => setIsToolsOpen(o => !o)}
              className="cursor-pointer flex items-center gap-1 hover:text-foreground transition-colors"
            >
              Công cụ AI
              <ChevronDown className={`size-3.5 transition-transform duration-200 ${isToolsOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {isToolsOpen && (
                <>
                  {/* invisible backdrop — click to close */}
                  <div className="fixed inset-0 z-40" onClick={() => setIsToolsOpen(false)} />
                  <motion.div
                    key="tools-dropdown"
                    initial={{ opacity: 0, scale: 0.95, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 mt-3 w-[480px] rounded-2xl border border-border bg-card/95 backdrop-blur-lg p-3 shadow-xl ring-1 ring-black/5 z-50"
                  >
                    <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">AI Tools</p>
                    <div className="grid grid-cols-2 gap-0.5">
                      {[
                        { Icon: Shirt, title: "Virtual Try-On", desc: "Thử trang phục ảo lên ảnh người mẫu", href: "/studio?tool=try_on" },
                        { Icon: Box, title: "Product to Model", desc: "Đặt sản phẩm lên model AI", href: "/studio?tool=product_to_model" },
                        { Icon: Shuffle, title: "Model Swap", desc: "Đổi model, giữ nguyên trang phục", href: "/studio?tool=model_swap" },
                        { Icon: UserRound, title: "Face Swap", desc: "Thay khuôn mặt tự nhiên", href: "/studio?tool=face_swap" },
                        { Icon: Pencil, title: "AI Edit", desc: "Chỉnh sửa ảnh bằng lệnh văn bản", href: "/studio?tool=edit" },
                        { Icon: Video, title: "Image to Video", desc: "Biến ảnh tĩnh thành video thời trang", href: "/studio?tool=image_to_video" },
                        { Icon: Crop, title: "Reframe", desc: "Đổi tỉ lệ khung hình bằng AI", href: "/studio?tool=reframe" },
                        { Icon: ImageUp, title: "Upscale", desc: "Nâng độ phân giải ảnh 2× – 4×", href: "/studio?tool=upscale" },
                      ].map(({ Icon, title, desc, href }) => (
                        <Link
                          key={title}
                          href={href}
                          onClick={() => setIsToolsOpen(false)}
                          className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-secondary transition-colors group"
                        >
                          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary group-hover:bg-primary/15 transition-colors">
                            <Icon className="size-3.5" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-foreground leading-tight">{title}</p>
                            <p className="text-[10px] font-light text-muted-foreground mt-0.5 leading-tight">{desc}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>


          <Link href="/pricing" className={`hover:text-foreground transition-colors ${pathname === "/pricing" ? "text-primary" : ""}`}>
            Bảng giá
          </Link>
          <Link href="/about" className={`hover:text-foreground transition-colors ${pathname === "/about" ? "text-primary" : ""}`}>
            Về chúng tôi
          </Link>
        </nav>

        {/* Authentication State / Action buttons */}
        <div className="ml-auto flex items-center gap-3">
          {authLoading ? (
            <div className="h-9 w-36 rounded-full bg-secondary animate-pulse" />
          ) : user ? (
            /* Logged In User Profile Dropdown */
            <>
              <NotificationCenter variant="header" />
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="cursor-pointer flex items-center gap-2.5 p-1.5 pr-3 rounded-full hover:bg-secondary border border-border/60 transition-all duration-300 focus:outline-none"
                >
                  {/* User Avatar */}
                  <PlanAvatarRing planType={planType}>
                    <img
                      src={user.user_metadata?.avatar_url || user.user_metadata?.picture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"}
                      alt={user.user_metadata?.full_name || "Avatar"}
                      className={`size-8 rounded-full object-cover shadow-sm ${avatarBorderClass}`}
                      referrerPolicy="no-referrer"
                    />
                  </PlanAvatarRing>

                  {/* User Info (Desktop only) */}
                  <div className="hidden sm:flex flex-col items-start text-left">
                    <span className="text-xs font-semibold text-foreground leading-none">
                      {user.user_metadata?.full_name || user.user_metadata?.name || "Người dùng GU.AI"}
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-0.5 leading-none max-w-[120px] truncate">
                      {user.email}
                    </span>
                  </div>

                  <ChevronDown className={`size-3 text-muted-foreground transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown Menu Container */}
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      key="user-dropdown"
                      initial={{ opacity: 0, scale: 0.95, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2.5 w-60 rounded-2xl border border-border bg-card/95 backdrop-blur-lg p-2.5 shadow-xl ring-1 ring-black/5 focus:outline-none z-50 text-foreground"
                    >
                      {/* User profile card in dropdown */}
                      <div className="px-2.5 py-2 border-b border-border/60 mb-2">
                        <p className="text-xs font-medium text-muted-foreground">Tài khoản</p>
                        <p className="text-sm font-semibold text-foreground truncate mt-0.5">
                          {user.user_metadata?.full_name || user.user_metadata?.name || "Người dùng"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>

                      {/* Menu items */}
                      <div className="space-y-1">
                        <Link href="/profile" className="flex items-center gap-2.5 w-full px-2.5 py-2 text-xs text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-all" onClick={() => setIsDropdownOpen(false)}>
                          <UserIcon className="size-4 text-primary" />
                          Hồ sơ cá nhân
                        </Link>
                        <Link href="/dashboard" className="flex items-center gap-2.5 w-full px-2.5 py-2 text-xs text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-all" onClick={() => setIsDropdownOpen(false)}>
                          <LayoutDashboard className="size-4 text-primary" />
                          GU.AI Studio Dashboard
                        </Link>

                        <Link href="/pricing" className="flex items-center gap-2.5 w-full px-2.5 py-2 text-xs text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-all" onClick={() => setIsDropdownOpen(false)}>
                          <Settings className="size-4" />
                          Nâng cấp gói dịch vụ
                        </Link>
                      </div>

                      <div className="h-px bg-border/60 my-2" />

                      {/* Sign out */}
                      <button
                        onClick={handleSignOut}
                        className="cursor-pointer flex items-center gap-2.5 w-full px-2.5 py-2 text-xs text-destructive hover:bg-destructive/10 rounded-lg transition-all text-left"
                      >
                        <LogOut className="size-4" />
                        Đăng xuất tài khoản
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            /* Action buttons for Unauthenticated Users */
            <>
              <Link href="/login">
                <Button variant="ghost" className="text-sm font-light text-foreground hover:bg-secondary rounded-xl px-4 py-2">
                  Đăng nhập
                </Button>
              </Link>
              <Link href="/register">
                <Button className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-[0_0_15px_rgba(var(--color-primary),0.1)] hover:bg-primary/95 transition-all">
                  Dùng thử Miễn phí
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
