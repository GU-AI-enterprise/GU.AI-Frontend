"use client";

import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import NotificationCenter from "@/components/notification/NotificationCenter";

const ROUTE_MAP: Record<string, [string, string]> = {
  "/dashboard":            ["Studio", "Tổng quan"],
  "/studio":               ["Studio", "AI Studio"],
  "/archive/gallery":      ["Kho lưu trữ", "Tất cả ảnh"],
  "/archive/collections":  ["Kho lưu trữ", "Bộ sưu tập"],
  "/archive/upload":       ["Kho lưu trữ", "Upload hàng loạt"],
  "/history":              ["Studio", "Lịch sử tác vụ"],
  "/profile":              ["Tài khoản", "Hồ sơ"],
  "/profile/edit":         ["Tài khoản", "Chỉnh sửa hồ sơ"],
  "/profile/password":     ["Tài khoản", "Đổi mật khẩu"],
  "/settings":             ["Tài khoản", "Cài đặt"],
};

function getRoute(pathname: string): [string, string] {
  if (ROUTE_MAP[pathname]) return ROUTE_MAP[pathname];
  // match prefix (e.g. /archive/collections/[id])
  for (const key of Object.keys(ROUTE_MAP).sort((a, b) => b.length - a.length)) {
    if (pathname.startsWith(key)) return ROUTE_MAP[key];
  }
  return ["GU.AI", "Dashboard"];
}

export default function DashboardTopBar() {
  const pathname = usePathname();
  const { user } = useAppSelector((s) => s.auth);
  const [section, title] = getRoute(pathname);

  const displayName = user?.user_metadata?.full_name
    || user?.user_metadata?.name
    || user?.email?.split("@")[0]
    || "Người dùng";

  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/60 bg-background/80 px-6 backdrop-blur-xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>{section}</span>
        <ChevronRight className="size-3.5" />
        <span className="font-semibold text-foreground">{title}</span>
      </div>

      {/* Right: notification + user */}
      <div className="flex items-center gap-3">
        <NotificationCenter variant="header" />

        <div className="flex items-center gap-2.5">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="size-8 rounded-full object-cover border border-border/60"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {initials}
            </div>
          )}
          <span className="hidden sm:block text-sm font-medium text-foreground">{displayName}</span>
        </div>
      </div>
    </header>
  );
}
