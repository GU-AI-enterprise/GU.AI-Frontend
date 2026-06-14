"use client";

import { useState } from "react";
import Link from "next/link";
import { Wand2, Copy, Check, AlignLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATS, CAT_COLORS, CAT_PROMPT_GRADIENT } from "../constants";
import type { Item } from "../types";

export function LibraryCard({ item }: { item: Item }) {
  const [copied, setCopied] = useState(false);
  const catLabel = CATS.find(c => c.id === item.cat)?.label ?? item.cat;

  const copy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const aspectClass =
    item.imgAspect === "tall"      ? "aspect-[2/3]"  :
    item.imgAspect === "portrait"  ? "aspect-[3/4]"  :
    item.imgAspect === "landscape" ? "aspect-[4/3]"  :
                                     "aspect-square";

  return (
    <div className="group rounded-2xl overflow-hidden border border-border bg-card hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20 transition-all duration-300 hover:-translate-y-0.5">
      {item.image ? (
        <div className={cn("relative overflow-hidden", aspectClass)}>
          <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 gap-2">
            <div className="flex items-center gap-2">
              {item.studioHref && (
                <Link href={item.studioHref} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-foreground text-[11px] font-semibold hover:bg-white/90 transition-colors shadow-lg">
                  <Wand2 className="size-3" />Dùng trong Studio
                </Link>
              )}
              <button onClick={() => copy(item.title)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/20 backdrop-blur-sm text-white text-[11px] font-medium hover:bg-white/30 transition-colors border border-white/20 ml-auto">
                <Copy className={cn("size-3", copied && "hidden")} />
                <Check className={cn("size-3", !copied && "hidden")} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className={cn("relative p-4 bg-gradient-to-br min-h-[150px] flex flex-col", CAT_PROMPT_GRADIENT.prompt)}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-violet-500">
              <AlignLeft className="size-3.5" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">Prompt template</span>
            </div>
            <button onClick={() => copy(item.promptText ?? "")} className={cn("flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all", copied ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400" : "bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400 hover:bg-violet-200 dark:hover:bg-violet-900/60")}>
              <Copy className={cn("size-3", copied && "hidden")} />
              <Check className={cn("size-3", !copied && "hidden")} />
              <span>{copied ? "Đã copy!" : "Copy"}</span>
            </button>
          </div>
          <p className="text-[11px] font-mono text-muted-foreground leading-relaxed flex-1">{item.promptText}</p>
        </div>
      )}

      <div className="px-3.5 py-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold", CAT_COLORS[item.cat])}>{catLabel}</span>
        </div>
        <h3 className="text-sm font-semibold text-foreground leading-snug mb-1">{item.title}</h3>
        <p className="text-[11px] text-muted-foreground leading-relaxed mb-2.5">{item.desc}</p>
        <div className="flex flex-wrap gap-1">
          {item.tags.map(tag => (
            <span key={tag} className="px-1.5 py-0.5 rounded-md bg-secondary text-[10px] text-muted-foreground">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
