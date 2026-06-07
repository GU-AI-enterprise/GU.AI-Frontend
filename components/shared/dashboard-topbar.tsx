"use client";

import { usePathname } from "next/navigation";
import { ChevronRight, Menu } from "lucide-react";
import NotificationCenter from "@/components/notification/NotificationCenter";
import { useSidebar } from "@/contexts/SidebarContext";

const ROUTE_MAP: Record<string, [string, string]> = {
  "/dashboard":                 ["Studio", "Tổng quan"],
  "/studio":               ["Studio", "AI Studio"],
  "/archive/gallery":      ["Kho lưu trữ", "Tất cả ảnh"],
  "/archive/models":       ["Kho lưu trữ", "Người mẫu"],
  "/archive/collections":  ["Kho lưu trữ", "Bộ sưu tập"],
  "/archive/upload":       ["Kho lưu trữ", "Upload hàng loạt"],
  "/archive/trash":        ["Kho lưu trữ", "Archive"],
  "/history":              ["Studio", "Lịch sử tác vụ"],
  "/profile":              ["Tài khoản", "Hồ sơ"],
  "/profile/edit":         ["Tài khoản", "Chỉnh sửa hồ sơ"],
  "/profile/password":     ["Tài khoản", "Đổi mật khẩu"],
  "/settings":             ["Tài khoản", "Cài đặt"],
};

function getRoute(pathname: string): [string, string] {
  if (ROUTE_MAP[pathname]) return ROUTE_MAP[pathname];
  for (const key of Object.keys(ROUTE_MAP).sort((a, b) => b.length - a.length)) {
    if (pathname.startsWith(key)) return ROUTE_MAP[key];
  }
  return ["GU.AI", "Dashboard"];
}

export default function DashboardTopBar() {
  const pathname = usePathname();
  const [section, title] = getRoute(pathname);
  const { isMobile, toggle } = useSidebar();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/60 bg-background/80 px-4 lg:px-6 backdrop-blur-xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {isMobile && (
          <button
            onClick={toggle}
            className="cursor-pointer p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors mr-1"
            aria-label="Mở menu"
          >
            <Menu className="size-5" />
          </button>
        )}
        <span>{section}</span>
        <ChevronRight className="size-3.5" />
        <span className="font-semibold text-foreground">{title}</span>
      </div>

      {/* Notification only */}
      <NotificationCenter variant="header" />
    </header>
  );
}
