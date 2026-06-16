"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const toggle = () => {
    const next = locale === "vi" ? "en" : "vi";
    document.cookie = `GUAI_LOCALE=${next}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    startTransition(() => router.refresh());
  };

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className="cursor-pointer flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border/60 bg-background hover:bg-secondary/50 text-xs font-semibold text-foreground transition-colors disabled:opacity-50"
    >
      <span className={locale === "vi" ? "text-foreground" : "text-muted-foreground"}>VI</span>
      <span className="text-muted-foreground/40">/</span>
      <span className={locale === "en" ? "text-foreground" : "text-muted-foreground"}>EN</span>
    </button>
  );
}
