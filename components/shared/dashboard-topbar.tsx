"use client";

import { usePathname } from "next/navigation";
import { ChevronRight, Menu } from "lucide-react";
import NotificationCenter from "@/components/notification/NotificationCenter";
import { useSidebar } from "@/contexts/SidebarContext";
import { useTranslations } from "next-intl";
import { LanguageToggle } from "@/components/shared/language-toggle";

type RouteKey =
  | "overview" | "aiStudio" | "archive" | "allPhotos" | "models"
  | "collections" | "bulkUpload" | "archiveTrash" | "taskHistory"
  | "profile" | "editProfile" | "changePassword" | "settings"
  | "assistant" | "library" | "defaultPage";

type SectionKey = "studio" | "archive" | "account" | "defaultSection";

const ROUTE_MAP: Record<string, [SectionKey, RouteKey]> = {
  "/dashboard":          ["studio",        "overview"],
  "/studio":             ["studio",        "aiStudio"],
  "/archive/gallery":    ["archive",       "allPhotos"],
  "/archive/models":     ["archive",       "models"],
  "/archive/collections":["archive",       "collections"],
  "/archive/upload":     ["archive",       "bulkUpload"],
  "/archive/trash":      ["archive",       "archiveTrash"],
  "/history":            ["studio",        "taskHistory"],
  "/profile":            ["account",       "profile"],
  "/profile/edit":       ["account",       "editProfile"],
  "/profile/password":   ["account",       "changePassword"],
  "/settings":           ["account",       "settings"],
  "/workflow":           ["studio",        "assistant"],
  "/library":            ["studio",        "library"],
};

function getRoute(pathname: string): [SectionKey, RouteKey] {
  if (ROUTE_MAP[pathname]) return ROUTE_MAP[pathname];
  for (const key of Object.keys(ROUTE_MAP).sort((a, b) => b.length - a.length)) {
    if (pathname.startsWith(key)) return ROUTE_MAP[key];
  }
  return ["defaultSection", "defaultPage"];
}

export default function DashboardTopBar() {
  const pathname = usePathname();
  const [section, page] = getRoute(pathname);
  const { isMobile, toggle } = useSidebar();
  const t = useTranslations("nav");

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/60 bg-background/80 px-4 lg:px-6 backdrop-blur-xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {isMobile && (
          <button
            onClick={toggle}
            className="cursor-pointer p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors mr-1"
            aria-label={t("openMenu")}
          >
            <Menu className="size-5" />
          </button>
        )}
        <span>{t(section)}</span>
        <ChevronRight className="size-3.5" />
        <span className="font-semibold text-foreground">{t(page)}</span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        <LanguageToggle />
        <NotificationCenter variant="header" />
      </div>
    </header>
  );
}
