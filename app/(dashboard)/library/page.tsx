"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Search, Sparkles, Image as ImageIcon,
  Layers, Copy, Wand2, AlignLeft, Check, LayoutGrid, X, Maximize2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/apiFetch";
import GuaiLoader from "@/components/shared/guai-loader";
import {
  ActionBar,
  ActionBarClose,
  ActionBarGroup,
  ActionBarItem,
  ActionBarSelection,
  ActionBarSeparator,
} from "@/components/ui/action-bar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
// ── Types ──────────────────────────────────────────────────────────────────────

type Cat = "all" | "pose" | "prompt" | "background" | "example";

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
  { id: "pose",       label: "Dáng ảnh",   Icon: ImageIcon },
  { id: "prompt",     label: "Prompt",     Icon: AlignLeft },
  { id: "background", label: "Background", Icon: LayoutGrid },
  { id: "example",    label: "Ví dụ",      Icon: Sparkles  },
];

const CAT_COLORS: Record<string, string> = {
  pose:       "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  prompt:     "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  background: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  example:    "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

const CAT_PROMPT_GRADIENT: Record<string, string> = {
  prompt: "from-violet-50 to-purple-50/60 dark:from-violet-950/40 dark:to-purple-950/20",
};

// ── Masonry (code tay: chia round-robin theo cột, mỗi cột tự xếp dọc) ──────────

function useCols(): number {
  const [cols, setCols] = useState(3);
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setCols(w >= 1280 ? 5 : w >= 1024 ? 4 : w >= 768 ? 3 : w >= 640 ? 2 : 1);
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

const LibraryCard = React.memo(function LibraryCard({ item, selected, onToggle, priority }: { item: Item; selected: boolean; onToggle: (item: Item) => void; priority?: boolean }) {
  const [copied, setCopied] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const catLabel = CATS.find(c => c.id === item.cat)?.label ?? item.cat;
  const isImageCard = !!item.image;
  const hasImageWithPrompt = isImageCard && !!item.promptText;

  const copy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  let href = item.studioHref;
  if (!href) {
    if (item.cat === "pose") {
      href = `/studio?tool=product-to-model&poseUrl=${encodeURIComponent(item.image || "")}`;
    } else if (item.cat === "background") {
      href = `/studio?tool=edit&bgUrl=${encodeURIComponent(item.image || "")}`;
    } else if (item.cat === "prompt") {
      href = `/studio?tool=create-model&promptText=${encodeURIComponent(item.promptText || "")}`;
    }
  } else {
    if (href.includes("?")) {
      if (item.cat === "background") href += `&bgUrl=${encodeURIComponent(item.image || "")}`;
      if (item.cat === "example") href += `&exampleUrl=${encodeURIComponent(item.image || "")}`;
    }
  }

  return (
    <div 
      onClick={() => onToggle(item)}
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

      {/* ── Image card (chiều cao tự nhiên theo ảnh thật, đúng kiểu masonry) ── */}
      {item.image ? (
        <div className="relative overflow-hidden bg-secondary">
          {/* eslint-disable-next-line @next/next/no-img-element -- cần chiều cao tự nhiên theo ảnh thật cho từng cột masonry, next/image fill sẽ ép theo box cố định */}
          <img
            src={item.image}
            alt={item.title}
            loading={priority ? undefined : "lazy"}
            className="block w-full h-auto transition-transform duration-500 group-hover:scale-[1.04]"
          />
          {/* Xem chi tiết */}
          <button
            onClick={(e) => { e.stopPropagation(); setPromptOpen(true); }}
            title="Xem chi tiết"
            className="absolute top-3 right-3 z-10 size-7 rounded-full flex items-center justify-center bg-black/30 text-white opacity-0 group-hover:opacity-100 backdrop-blur-md border border-white/30 hover:bg-black/50 transition-all"
          >
            <Maximize2 className="size-3.5" />
          </button>
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 gap-2">
            <div>
              <span className={cn(
                "inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold mb-1.5",
                CAT_COLORS[item.cat],
              )}>
                {catLabel}
              </span>
              <h3 className="text-sm font-semibold text-white leading-snug">{item.title}</h3>
              <p className="text-[11px] text-white/80 leading-relaxed line-clamp-2 mt-0.5">{item.desc}</p>
            </div>
            {hasImageWithPrompt && (
              <button
                onClick={(e) => { e.stopPropagation(); setPromptOpen(true); }}
                className="text-left text-[10px] font-mono text-white/80 leading-relaxed line-clamp-2 hover:text-white transition-colors"
              >
                &ldquo;{item.promptText}&rdquo;
              </button>
            )}
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
          <p className="text-[11px] font-mono text-muted-foreground leading-relaxed flex-1 line-clamp-4">
            {item.promptText}
          </p>
        </div>
      )}

      {/* ── Card body (prompt-only cards: no image to hover, so info stays visible) ── */}
      {!item.image && (
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
      )}

      {/* ── Chi tiết dialog (ảnh + mô tả, kèm prompt đầy đủ nếu có) ── */}
      {isImageCard && (
        <Dialog open={promptOpen} onOpenChange={setPromptOpen}>
          <DialogContent
            onClick={(e) => e.stopPropagation()}
            className="max-w-3xl w-[calc(100%-2rem)] p-0 overflow-hidden grid sm:grid-cols-2 gap-0"
          >
            <div className="relative bg-secondary flex items-center justify-center min-h-[240px] sm:min-h-[420px] max-h-[80vh] p-2">
              {/* eslint-disable-next-line @next/next/no-img-element -- hiện đúng ảnh thật, không ép theo box cố định để tránh crop/letterbox sai tỉ lệ */}
              <img src={item.image!} alt={item.title} className="max-w-full max-h-[76vh] w-auto h-auto object-contain rounded-lg" />
            </div>
            <div className="p-6 flex flex-col max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <span className={cn(
                  "inline-flex w-fit items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold mb-2",
                  CAT_COLORS[item.cat],
                )}>
                  {catLabel}
                </span>
                <DialogTitle>{item.title}</DialogTitle>
                <DialogDescription>{item.desc}</DialogDescription>
              </DialogHeader>

              {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {item.tags.map(tag => (
                    <span key={tag} className="px-1.5 py-0.5 rounded-md bg-secondary text-[10px] text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {item.promptText && (
                <div className="mt-4 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Prompt đầy đủ</p>
                  <p className="text-xs font-mono text-foreground leading-relaxed whitespace-pre-wrap bg-secondary/50 rounded-xl p-3">
                    {item.promptText}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 mt-5">
                {href && (
                  <Link
                    href={href}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
                  >
                    <Wand2 className="size-3.5" />
                    Dùng trong Studio
                  </Link>
                )}
                {item.promptText && (
                  <button
                    onClick={(e) => { e.stopPropagation(); copy(item.promptText ?? ""); }}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors",
                      copied
                        ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
                        : "bg-secondary text-muted-foreground hover:bg-secondary/70",
                    )}
                  >
                    <Copy className={cn("size-3.5", copied && "hidden")} />
                    <Check className={cn("size-3.5", !copied && "hidden")} />
                    {copied ? "Đã copy!" : "Copy prompt"}
                  </button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
});

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
      try {
        const res = await apiClient.get("/api/library");
        if (res.data.success) {
          setItems((res.data.data as any[])
            .filter((d) => d.category !== "model") // "Người mẫu" đã tách thành trang /models riêng
            .map((d) => ({
              id: d.id,
              cat: d.category,
              title: d.title,
              image: d.image_url,
              promptText: d.prompt_text,
              tags: d.tags || [],
              desc: d.description || "",
              imgAspect: d.img_aspect || "square",
            })));
        } else {
          console.error("Lỗi lấy dữ liệu thư viện:", res.data.error);
        }
      } catch (err) {
        console.error("Lỗi lấy dữ liệu thư viện:", err);
      } finally {
        setLoading(false);
      }
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

  const toggleSelect = React.useCallback((item: Item) => {
    setSelectedItems(prev => {
      if (prev.find(i => i.id === item.id)) {
        return prev.filter(i => i.id !== item.id);
      }
      return [...prev.filter(i => i.cat !== item.cat), item];
    });
  }, []);

  const handleSendToStudio = () => {
    if (selectedItems.length === 0) return;

    let tool = "try-on";
    const params = new URLSearchParams();

    const pose = selectedItems.find(i => i.cat === "pose");
    const bg = selectedItems.find(i => i.cat === "background");
    const prompt = selectedItems.find(i => i.cat === "prompt");

    if (pose) {
      tool = "product-to-model";
      params.set("poseUrl", pose.image || "");
    }

    if (bg) {
      if (!pose) tool = "edit";
      params.set("bgUrl", bg.image || "");
    }

    if (prompt) {
      if (!pose && !bg) tool = "create-model";
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
          Dáng ảnh, prompt mẫu và background để tham khảo và dùng nhanh trong Studio. Tìm người mẫu? Qua <a href="/models" className="text-primary hover:underline">trang Người mẫu</a>.
        </p>
      </div>

      {/* ── Search ── */}
      <div className="relative mb-5 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Tìm kiếm dáng ảnh, prompt..."
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
        <div className="flex items-center justify-center py-32">
          <GuaiLoader size="lg" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="flex gap-4 items-start pb-24">
          {splitCols(filtered, cols).map((col, ci) => (
            <div key={ci} className="flex-1 flex flex-col gap-4 min-w-0">
              {col.map((item, rowIdx) => (
                <LibraryCard
                  key={item.id}
                  item={item}
                  selected={!!selectedItems.find(i => i.id === item.id)}
                  onToggle={toggleSelect}
                  priority={rowIdx === 0}
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
      <ActionBar open={selectedItems.length > 0} onOpenChange={(open) => !open && setSelectedItems([])}>
        <ActionBarSelection>
          <div className="flex -space-x-3 mr-1">
            {selectedItems.map((item) => (
              <div key={item.id} className="relative size-7 rounded-full overflow-hidden border-2 border-background bg-secondary">
                {item.image ? (
                  <Image src={item.image} alt="" fill sizes="28px" className="object-cover" />
                ) : (
                  <div className="size-full flex items-center justify-center bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-400">
                    <AlignLeft className="size-3" />
                  </div>
                )}
              </div>
            ))}
          </div>
          {selectedItems.length} mục
        </ActionBarSelection>
        <ActionBarSeparator />
        <ActionBarGroup>
          <ActionBarItem onSelect={handleSendToStudio} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Wand2 className="size-3.5" /> Gửi vào Studio
          </ActionBarItem>
        </ActionBarGroup>
        <ActionBarClose>
          <X className="size-3.5" />
        </ActionBarClose>
      </ActionBar>
    </div>
  );
}
