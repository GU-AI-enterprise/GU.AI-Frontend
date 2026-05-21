"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Image as ImageIcon, 
  FolderOpen, 
  History, 
  Settings, 
  Wand2,
  LogOut,
  CreditCard,
  LayoutDashboard
} from "lucide-react";
import Logo from "@/components/shared/logo";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Tổng quan", href: "/dashboard", icon: <LayoutDashboard className="size-5" /> },
    { name: "Tạo ảnh AI", href: "/generate", icon: <Wand2 className="size-5" /> },
    { name: "Lịch sử tác vụ", href: "/archive", icon: <History className="size-5" /> },
  ];

  const bottomItems = [
    { name: "Cài đặt", href: "/settings", icon: <Settings className="size-5" /> },
    { name: "Đăng xuất", href: "/logout", icon: <LogOut className="size-5" /> },
  ];

  return (
    <aside className="w-[260px] border-r border-border/40 bg-background/95 backdrop-blur-xl h-screen sticky top-0 flex flex-col z-40">
      <div className="p-6">
        <Logo />
      </div>

      <div className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest mb-3 px-3">
          Workspace
        </div>
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                isActive 
                  ? "bg-primary/10 text-primary font-medium shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {React.cloneElement(item.icon, { 
                className: `size-[18px] ${isActive ? "text-primary drop-shadow-[0_0_8px_rgba(var(--color-primary),0.5)]" : "text-muted-foreground/70 group-hover:text-foreground/90 transition-colors"}` 
              })}
              <span className="text-sm">{item.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-4 flex flex-col gap-1">
        {bottomItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className="group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              {React.cloneElement(item.icon, { 
                className: "size-[18px] text-muted-foreground/70 group-hover:text-foreground/90 transition-colors" 
              })}
              <span className="text-sm">{item.name}</span>
            </Link>
        ))}
      </div>

      <div className="p-4 border-t border-border/40">
        <div className="bg-secondary/40 border border-border/30 rounded-2xl p-4 flex flex-col items-start relative overflow-hidden group hover:border-primary/30 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-xl -mr-10 -mt-10 group-hover:bg-primary/20 transition-colors"></div>
          <div className="flex items-center gap-2 mb-2">
             <CreditCard className="size-4 text-primary" />
             <span className="text-xs font-semibold text-foreground">Số dư Credits</span>
          </div>
          <div className="text-2xl font-serif text-foreground">1,450</div>
          <Link href="/pricing" className="text-[10px] text-primary hover:underline mt-1 font-medium">
            Nạp thêm credits →
          </Link>
        </div>
      </div>
    </aside>
  );
}
