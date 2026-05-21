"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import Logo from "@/components/shared/logo";
import GuaiLoader from "@/components/shared/guai-loader";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon, LayoutDashboard, History, Settings, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get user session on mount
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setAuthLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    // Close dropdown on click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsDropdownOpen(false);
    router.push("/");
    router.refresh();
  };

  // Determine standard links based on whether we are on landing page or subpages
  const isLanding = pathname === "/";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <div className="flex items-center gap-4">
          {authLoading ? <GuaiLoader size="sm" /> : <Logo />}
        </div>

        {/* Main Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-light text-muted-foreground">
          <Link href={isLanding ? "#features" : "/#features"} className="hover:text-foreground transition-colors">
            Tính năng
          </Link>
          <Link href={isLanding ? "#how-it-works" : "/#how-it-works"} className="hover:text-foreground transition-colors">
            Cách hoạt động
          </Link>
          <Link href="/services" className={`hover:text-foreground transition-colors ${pathname === "/services" ? "text-primary font-normal" : ""}`}>
            Dịch vụ
          </Link>
          <Link href="/pricing" className={`hover:text-foreground transition-colors ${pathname === "/pricing" ? "text-primary font-normal" : ""}`}>
            Bảng giá
          </Link>
        </nav>

        {/* Authentication State / Action buttons */}
        <div className="flex items-center gap-3">
          {user ? (
            /* Logged In User Profile Dropdown */
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full hover:bg-secondary border border-border/60 transition-all duration-300 focus:outline-none"
              >
                {/* User Avatar */}
                <img
                  src={user.user_metadata?.avatar_url || user.user_metadata?.picture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"}
                  alt={user.user_metadata?.full_name || "Avatar"}
                  className="size-8 rounded-full object-cover border border-primary/20 shadow-sm"
                  referrerPolicy="no-referrer"
                />

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
                      <Link href="/dashboard" className="flex items-center gap-2.5 w-full px-2.5 py-2 text-xs text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-all" onClick={() => setIsDropdownOpen(false)}>
                        <LayoutDashboard className="size-4 text-primary" />
                        GU.AI Studio Dashboard
                      </Link>
                      <Link href="/archive" className="flex items-center gap-2.5 w-full px-2.5 py-2 text-xs text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-all" onClick={() => setIsDropdownOpen(false)}>
                        <History className="size-4" />
                        Lịch sử tác vụ (Archive)
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
                      className="flex items-center gap-2.5 w-full px-2.5 py-2 text-xs text-destructive hover:bg-destructive/10 rounded-lg transition-all text-left"
                    >
                      <LogOut className="size-4" />
                      Đăng xuất tài khoản
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
