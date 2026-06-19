"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Search, Sparkles, UserRound, Image as ImageIcon,
  Layers, Copy, Wand2, AlignLeft, Check, LayoutGrid, X
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { createBrowserClient } from "@supabase/ssr";

// ── Types ──────────────────────────────────────────────────────────────────────

type Cat = "all" | "model" | "pose" | "prompt" | "background" | "example";

interface Item {
  id: string;
  cat: Exclude<Cat, "all">;
  title: string;
  image?: string;
  promptText?: string;
  tags: string[];
  desc: string;
  studioHref?: string;
  imgAspect?: "portrait" | "landscape" | "square" | "tall";
}

// ── Static Data ────────────────────────────────────────────────────────────────

const CATS: { id: Cat; label: string; Icon: React.ElementType }[] = [
  { id: "all",        label: "Tất cả",     Icon: Layers    },
  { id: "model",      label: "Người mẫu",  Icon: UserRound },
  { id: "pose",       label: "Dáng ảnh",   Icon: ImageIcon },
  { id: "prompt",     label: "Prompt",     Icon: AlignLeft },
  { id: "background", label: "Background", Icon: LayoutGrid },
  { id: "example",    label: "Ví dụ",      Icon: Sparkles  },
];

const CAT_COLORS: Record<string, string> = {
  model:      "bg-primary/10 text-primary",
  pose:       "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  prompt:     "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  background: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  example:    "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

const CAT_PROMPT_GRADIENT: Record<string, string> = {
  prompt: "from-violet-50 to-purple-50/60 dark:from-violet-950/40 dark:to-purple-950/20",
};

// ── Masonry helpers ───────────────────────────────────────────────────────────

function useCols(): number {
  const [cols, setCols] = useState(3);
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setCols(w >= 1280 ? 4 : w >= 1024 ? 3 : w >= 640 ? 2 : 1);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return cols;
}

function splitCols<T>(items: T[], n: number): T[][] {
  const cols: T[][] = Array.from({ length: n }, () => []);
  items.forEach((item, i) => cols[i % n].push(item));
  return cols;
}

// ── Card ──────────────────────────────────────────────────────────────────────

function LibraryCard({ item, selected, onToggle }: { item: Item; selected: boolean; onToggle: () => void }) {
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

  let href = item.studioHref;
  if (!href) {
    if (item.cat === "pose") {
      href = `/studio?tool=product-to-model&poseUrl=${encodeURIComponent(item.image || "")}`;
    } else if (item.cat === "model") {
      href = `/studio?tool=product-to-model&modelUrl=${encodeURIComponent(item.image || "")}`;
    } else if (item.cat === "background") {
      href = `/studio?tool=edit&bgUrl=${encodeURIComponent(item.image || "")}`;
    } else if (item.cat === "prompt") {
      href = `/studio?tool=create-model&promptText=${encodeURIComponent(item.promptText || "")}`;
    }
  } else {
    if (href.includes("?")) {
      if (item.cat === "model") href += `&modelUrl=${encodeURIComponent(item.image || "")}`;
      if (item.cat === "background") href += `&bgUrl=${encodeURIComponent(item.image || "")}`;
      if (item.cat === "example") href += `&exampleUrl=${encodeURIComponent(item.image || "")}`;
    }
  }

  return (
    <div 
      onClick={onToggle}
      className={cn(
        "group cursor-pointer rounded-2xl overflow-hidden border bg-card hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 relative",
        selected ? "border-primary shadow-md shadow-primary/20 ring-2 ring-primary/20" : "border-border hover:shadow-black/5 dark:hover:shadow-black/20"
      )}
    >
      {/* Selection Checkbox */}
      <div className={cn(
        "absolute top-3 left-3 z-10 size-6 rounded-full border-2 flex items-center justify-center transition-all shadow-sm",
        selected 
          ? "bg-primary border-primary text-primary-foreground" 
          : "bg-black/20 border-white/60 text-transparent opacity-0 group-hover:opacity-100 backdrop-blur-md"
      )}>
        <Check className="size-3.5" strokeWidth={3} />
      </div>

      {/* ── Image card ── */}
      {item.image ? (
        <div className={cn("relative overflow-hidden", aspectClass)}>
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            loading="lazy"
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 gap-2">
            <div className="flex items-center gap-2">
              {href && (
                <Link
                  href={href}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-foreground text-[11px] font-semibold hover:bg-white/90 transition-colors shadow-lg"
                >
                  <Wand2 className="size-3" />
                  Dùng trong Studio
                </Link>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); copy(item.title); }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/20 backdrop-blur-sm text-white text-[11px] font-medium hover:bg-white/30 transition-colors border border-white/20 ml-auto"
              >
                <Copy className={cn("size-3", copied && "hidden")} />
                <Check className={cn("size-3", !copied && "hidden")} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ── Prompt card (no image) ── */
        <div className={cn(
          "relative p-4 bg-gradient-to-br min-h-[150px] flex flex-col",
          CAT_PROMPT_GRADIENT.prompt,
        )}>
          <div className="flex items-center justify-between mb-3 gap-2">
            <div className="flex items-center gap-1.5 text-violet-500">
              <AlignLeft className="size-3.5" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">Prompt template</span>
            </div>
            <div className="flex items-center gap-1.5">
              {href && (
                <Link
                  href={href}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all bg-white/50 hover:bg-white/80 text-violet-700 dark:bg-black/20 dark:hover:bg-black/40 dark:text-violet-300"
                >
                  <Wand2 className="size-3" />
                  Dùng thử
                </Link>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); copy(item.promptText ?? ""); }}
                className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all",
                  copied
                    ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
                    : "bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400 hover:bg-violet-200 dark:hover:bg-violet-900/60"
                )}
              >
                <Copy className={cn("size-3", copied && "hidden")} />
                <Check className={cn("size-3", !copied && "hidden")} />
                <span>{copied ? "Đã copy!" : "Copy"}</span>
              </button>
            </div>
          </div>
          <p className="text-[11px] font-mono text-muted-foreground leading-relaxed flex-1">
            {item.promptText}
          </p>
        </div>
      )}

      {/* ── Card body ── */}
      <div className="px-3.5 py-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className={cn(
            "inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold",
            CAT_COLORS[item.cat],
          )}>
            {catLabel}
          </span>
        </div>

        <h3 className="text-sm font-semibold text-foreground leading-snug mb-1">{item.title}</h3>
        <p className="text-[11px] text-muted-foreground leading-relaxed mb-2.5">{item.desc}</p>

        <div className="flex flex-wrap gap-1">
          {item.tags.map(tag => (
            <span
              key={tag}
              className="px-1.5 py-0.5 rounded-md bg-secondary text-[10px] text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LibraryPage() {
  const router                    = useRouter();
  const [activeCat, setActiveCat] = useState<Cat>("all");
  const [search, setSearch]       = useState("");
  const [items, setItems]         = useState<Item[]>([]);
  const [loading, setLoading]     = useState(true);
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const cols                      = useCols();

  useEffect(() => {
    const fetchItems = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
      );

      const { data, error } = await supabase
        .from("library_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Lỗi lấy dữ liệu thư viện:", error);
      } else if (data) {
        setItems(data.map((d: any) => ({
          id: d.id,
          cat: d.category,
          title: d.title,
          image: d.image_url,
          promptText: d.prompt_text,
          tags: d.tags || [],
          desc: d.description || "",
          imgAspect: d.img_aspect || "square",
        })));
      }
      setLoading(false);
    };

    fetchItems();
  }, []);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: items.length };
    items.forEach(i => { map[i.cat] = (map[i.cat] ?? 0) + 1; });
    return map;
  }, [items]);

  const filtered = useMemo(() => {
    let result = items;
    if (activeCat !== "all") result = result.filter(i => i.cat === activeCat);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.desc.toLowerCase().includes(q) ||
        i.tags.some(t => t.toLowerCase().includes(q)) ||
        (i.promptText ?? "").toLowerCase().includes(q),
      );
    }
    return result;
  }, [items, activeCat, search]);

  const toggleSelect = (item: Item) => {
    setSelectedItems(prev => {
      if (prev.find(i => i.id === item.id)) {
        return prev.filter(i => i.id !== item.id);
      }
      return [...prev.filter(i => i.cat !== item.cat), item];
    });
  };

  const handleSendToStudio = () => {
    if (selectedItems.length === 0) return;

    let tool = "try-on";
    const params = new URLSearchParams();

    const pose = selectedItems.find(i => i.cat === "pose" || i.cat === "reference");
    const model = selectedItems.find(i => i.cat === "model");
    const bg = selectedItems.find(i => i.cat === "background");
    const prompt = selectedItems.find(i => i.cat === "prompt");

    if (pose || model) {
      tool = "product-to-model";
      if (pose) params.set("poseUrl", pose.image || "");
      if (model) params.set("modelUrl", model.image || "");
    }
    
    if (bg) {
      if (!pose) tool = "edit";
      params.set("bgUrl", bg.image || "");
      if (model && !pose) params.set("modelUrl", model.image || "");
    }

    if (prompt) {
      if (!pose && !model && !bg) tool = "create-model";
      params.set("promptText", prompt.promptText || "");
    }

    router.push(`/studio?tool=${tool}&${params.toString()}`);
  };

  return (
    <div className="min-h-full p-6 lg:p-8 pb-20">

      {/* ── Header ── */}
      <div className="mb-7">
        <h1 className="font-serif text-3xl font-light text-foreground tracking-tight mb-1">
          Thư <span className="font-normal italic text-primary">viện</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Người mẫu, dáng ảnh, prompt mẫu và background để tham khảo và dùng nhanh trong Studio
        </p>
      </div>

      {/* ── Search ── */}
      <div className="relative mb-5 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Tìm kiếm người mẫu, dáng, prompt..."
          className="w-full h-10 pl-9 pr-4 text-sm bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all placeholder:text-muted-foreground/60"
        />
      </div>

      {/* ── Categories ── */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide">
        {CATS.map(c => {
          const count = counts[c.id] ?? 0;
          const active = activeCat === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setActiveCat(c.id)}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-full border text-sm font-semibold transition-all",
                active
                  ? "bg-foreground text-background border-foreground shadow-md shadow-black/10"
                  : "bg-card text-muted-foreground border-border hover:bg-secondary hover:text-foreground",
              )}
            >
              <c.Icon className="size-4" />
              {c.label}
              <span className={cn(
                "ml-1.5 px-1.5 py-0.5 rounded-md text-[10px] leading-none transition-colors",
                active ? "bg-background/20" : "bg-muted text-muted-foreground group-hover:bg-border",
              )}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div className="flex items-center justify-center py-32 text-muted-foreground">
          <Wand2 className="size-8 animate-spin opacity-20" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="flex gap-4 items-start pb-24">
          {splitCols(filtered, cols).map((col, ci) => (
            <div key={ci} className="flex-1 flex flex-col gap-4 min-w-0">
              {col.map(item => (
                <LibraryCard 
                  key={item.id} 
                  item={item} 
                  selected={!!selectedItems.find(i => i.id === item.id)}
                  onToggle={() => toggleSelect(item)}
                />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
          <Search className="size-12 mb-4 opacity-20" />
          <p className="text-sm font-medium mb-1">Không tìm thấy kết quả</p>
          <p className="text-xs opacity-60">Thử tìm với từ khóa khác hoặc chọn danh mục khác</p>
        </div>
      )}

      {/* ── Selection Cart (Floating Bottom Bar) ── */}
      {selectedItems.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-background/90 backdrop-blur-xl border shadow-2xl p-3 pr-4 rounded-full animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="flex items-center gap-2 pl-2 border-r pr-4">
            <div className="flex -space-x-3">
              {selectedItems.map((item, idx) => (
                <div key={item.id} className="relative size-10 rounded-full overflow-hidden border-2 border-background bg-secondary z-[idx]">
                  {item.image ? (
                    <img src={item.image} alt="" className="size-full object-cover" />
                  ) : (
                    <div className="size-full flex items-center justify-center bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-400">
                      <AlignLeft className="size-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex flex-col ml-2">
              <span className="text-[11px] text-muted-foreground font-medium leading-none mb-1">Đã chọn</span>
              <span className="text-sm font-semibold leading-none">{selectedItems.length} mục</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setSelectedItems([])}
              className="px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary rounded-xl transition-colors flex items-center gap-1"
            >
              <X className="size-3" />
              Bỏ qua
            </button>
            <button 
              onClick={handleSendToStudio}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5"
            >
              <Wand2 className="size-4" />
              Gửi vào Studio
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
