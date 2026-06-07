"use client";

import React, { useState, useMemo } from "react";
import {
  Search, Sparkles, UserRound, Image as ImageIcon,
  Layers, Copy, Wand2, AlignLeft, Check, LayoutGrid,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

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

const ITEMS: Item[] = [
  // ── Người mẫu ─────────────────────────────────────────────────────────────
  { id: "m1", cat: "model", title: "Model nữ châu Á — Casual",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80",
    tags: ["nữ", "châu Á", "casual"],
    desc: "Streetwear, áo phông, quần jeans. Biểu cảm tự nhiên, gần gũi.",
    studioHref: "/studio?tool=try_on", imgAspect: "portrait" },

  { id: "m2", cat: "model", title: "Model nữ — Thanh lịch",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80",
    tags: ["nữ", "formal", "thanh lịch"],
    desc: "Formal, dress, công sở. Phù hợp studio ánh sáng mềm.",
    studioHref: "/studio?tool=try_on", imgAspect: "tall" },

  { id: "m3", cat: "model", title: "Model nam — Athletic",
    image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&q=80",
    tags: ["nam", "thể thao", "active"],
    desc: "Sportswear, activewear, hoodie. Vóc dáng cân đối.",
    studioHref: "/studio?tool=try_on", imgAspect: "square" },

  { id: "m4", cat: "model", title: "Model nữ trẻ — Gen Z",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&q=80",
    tags: ["nữ", "trẻ", "Gen Z"],
    desc: "Trendy, Y2K, crop top, mini skirt. Năng động và cá tính.",
    studioHref: "/studio?tool=try_on", imgAspect: "portrait" },

  { id: "m5", cat: "model", title: "Model nữ — Profile view",
    image: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=600&q=80",
    tags: ["nữ", "nhìn nghiêng", "profile"],
    desc: "Góc nghiêng tự nhiên, phù hợp jacket và coat.",
    studioHref: "/studio?tool=try_on", imgAspect: "square" },

  // ── Dáng ảnh ──────────────────────────────────────────────────────────────
  { id: "p1", cat: "pose", title: "Full body — Đứng thẳng",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80",
    tags: ["full body", "front", "cơ bản"],
    desc: "Chuẩn product showcase. Nhìn thẳng, đứng thẳng.",
    imgAspect: "tall" },

  { id: "p2", cat: "pose", title: "Editorial — Ngồi sáng tạo",
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80",
    tags: ["ngồi", "editorial", "creative"],
    desc: "Tư thế editorial cho lookbook và campaign cao cấp.",
    imgAspect: "landscape" },

  { id: "p3", cat: "pose", title: "Walking — Runway",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80",
    tags: ["đi", "catwalk", "dynamic"],
    desc: "Dáng đi catwalk. Năng động, đầy khí chất.",
    imgAspect: "portrait" },

  { id: "p4", cat: "pose", title: "Casual — Tự nhiên",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80",
    tags: ["casual", "relax", "natural"],
    desc: "Dáng thư giãn tự nhiên. Phù hợp streetwear mọi ngày.",
    imgAspect: "square" },

  // ── Prompt ────────────────────────────────────────────────────────────────
  { id: "pr1", cat: "prompt", title: "Studio E-commerce",
    promptText: "professional fashion photography, model wearing [clothing], clean white studio background, soft diffused lighting, sharp product details, commercial quality, 8k resolution",
    tags: ["studio", "trắng", "e-commerce"],
    desc: "Chuẩn ảnh sản phẩm thương mại điện tử" },

  { id: "pr2", cat: "prompt", title: "Outdoor Golden Hour",
    promptText: "fashion editorial, outdoor setting, golden hour sunlight, beautiful bokeh background, lifestyle photography, natural authentic feel, warm tones, candid relaxed mood, film grain texture",
    tags: ["outdoor", "golden hour", "warm"],
    desc: "Ngoại cảnh buổi chiều, ánh sáng hoàng hôn ấm áp" },

  { id: "pr3", cat: "prompt", title: "High Fashion Minimalist",
    promptText: "high fashion magazine editorial, pure white background, dramatic side lighting, Vogue aesthetic, avant-garde styling, ultra clean composition, luxury brand photography, aspirational",
    tags: ["high fashion", "Vogue", "luxury"],
    desc: "Phong cách tạp chí thời trang cao cấp" },

  { id: "pr4", cat: "prompt", title: "Urban Street Style",
    promptText: "urban street style photography, city bokeh background, shallow depth of field, candid fashion photography, dynamic natural pose, Gen Z aesthetic, authentic street scene, gritty urban energy",
    tags: ["street", "urban", "Gen Z"],
    desc: "Đường phố thành thị, phong cách tự nhiên candid" },

  { id: "pr5", cat: "prompt", title: "Áo Dài Việt Nam",
    promptText: "Vietnamese ao dai fashion photography, Hoan Kiem Lake Hanoi background, elegant graceful pose, warm soft traditional lighting, cultural heritage aesthetic, analog film photography, timeless beauty",
    tags: ["áo dài", "Việt Nam", "truyền thống"],
    desc: "Áo dài với bối cảnh Việt Nam truyền thống" },

  // ── Background ────────────────────────────────────────────────────────────
  { id: "bg1", cat: "background", title: "Studio Thuần Trắng",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    tags: ["trắng", "studio", "clean"],
    desc: "Nền trắng xóa hoàn toàn. Chuẩn e-commerce.",
    studioHref: "/studio?tool=edit", imgAspect: "landscape" },

  { id: "bg2", cat: "background", title: "Gradient Pastel — Tím",
    image: "https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=600&q=80",
    tags: ["gradient", "pastel", "tím"],
    desc: "Gradient nhẹ nhàng, phù hợp thời trang nữ trẻ.",
    studioHref: "/studio?tool=edit", imgAspect: "square" },

  { id: "bg3", cat: "background", title: "Núi tuyết — Outdoor Epic",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
    tags: ["núi", "outdoor", "epic"],
    desc: "Cảnh núi tuyết hùng vỹ. Phù hợp outdoor & sportswear.",
    studioHref: "/studio?tool=edit", imgAspect: "landscape" },

  { id: "bg4", cat: "background", title: "Nội thất Hiện đại",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80",
    tags: ["nội thất", "modern", "cozy"],
    desc: "Phòng nội thất ấm cúng. Phù hợp homewear & lifestyle.",
    studioHref: "/studio?tool=edit", imgAspect: "square" },

  { id: "bg5", cat: "background", title: "Đường phố — City Night",
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&q=80",
    tags: ["phố đêm", "neon", "urban"],
    desc: "Đường phố đêm với ánh đèn city. Phong cách city chic.",
    studioHref: "/studio?tool=edit", imgAspect: "landscape" },

  // ── Ví dụ ─────────────────────────────────────────────────────────────────
  { id: "ex1", cat: "example", title: "Try-On — Áo len oversize",
    image: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=600&q=80",
    tags: ["try-on", "knitwear", "winter"],
    desc: "Áo len oversize thử lên model nữ châu Á. Studio trắng, ánh sáng mềm.",
    studioHref: "/studio?tool=try_on", imgAspect: "portrait" },

  { id: "ex2", cat: "example", title: "Product → Model — Sơ mi lụa",
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4b4ac2?w=600&q=80",
    tags: ["product to model", "sơ mi", "lụa"],
    desc: "Ảnh sản phẩm sơ mi lụa → Model nữ elegant, nền văn phòng.",
    studioHref: "/studio?tool=product_to_model", imgAspect: "square" },

  { id: "ex3", cat: "example", title: "AI Edit — Đổi background",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80",
    tags: ["AI edit", "background swap", "outdoor"],
    desc: "Studio trắng → Nền outdoor thiên nhiên. Giữ nguyên người mẫu.",
    studioHref: "/studio?tool=edit", imgAspect: "landscape" },
];

// ── Card ──────────────────────────────────────────────────────────────────────

function LibraryCard({ item }: { item: Item }) {
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
    <div className="break-inside-avoid mb-4 group rounded-2xl overflow-hidden border border-border bg-card hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20 transition-all duration-300 hover:-translate-y-0.5">

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
              {item.studioHref && (
                <Link
                  href={item.studioHref}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-foreground text-[11px] font-semibold hover:bg-white/90 transition-colors shadow-lg"
                >
                  <Wand2 className="size-3" />
                  Dùng trong Studio
                </Link>
              )}
              <button
                onClick={() => copy(item.title)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/20 backdrop-blur-sm text-white text-[11px] font-medium hover:bg-white/30 transition-colors border border-white/20 ml-auto"
              >
                {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
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
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-violet-500">
              <AlignLeft className="size-3.5" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">Prompt template</span>
            </div>
            <button
              onClick={() => copy(item.promptText ?? "")}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all",
                copied
                  ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
                  : "bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400 hover:bg-violet-200 dark:hover:bg-violet-900/60"
              )}
            >
              {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
              {copied ? "Đã copy!" : "Copy"}
            </button>
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
  const [activeCat, setActiveCat] = useState<Cat>("all");
  const [search, setSearch]       = useState("");

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: ITEMS.length };
    ITEMS.forEach(i => { map[i.cat] = (map[i.cat] ?? 0) + 1; });
    return map;
  }, []);

  const filtered = useMemo(() => {
    let items = ITEMS;
    if (activeCat !== "all") items = items.filter(i => i.cat === activeCat);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.desc.toLowerCase().includes(q) ||
        i.tags.some(t => t.toLowerCase().includes(q)) ||
        (i.promptText ?? "").toLowerCase().includes(q),
      );
    }
    return items;
  }, [activeCat, search]);

  return (
    <div className="min-h-full p-6 lg:p-8 pb-20">

      {/* ── Header ── */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">Thư viện</h1>
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

      {/* ── Category tabs ── */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {CATS.map(({ id, label, Icon }) => {
          const active = activeCat === id;
          return (
            <button
              key={id}
              onClick={() => setActiveCat(id)}
              className={cn(
                "cursor-pointer flex items-center gap-1.5 pl-3 pr-2.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all shrink-0",
                active
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary",
              )}
            >
              <Icon className="size-3.5" />
              {label}
              <span className={cn(
                "text-[10px] rounded-full px-1.5 py-0.5 font-bold ml-0.5",
                active ? "bg-white/20 text-white" : "bg-border/80 text-muted-foreground",
              )}>
                {counts[id] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Result count ── */}
      <p className="text-[11px] text-muted-foreground mb-5">
        {filtered.length} mục
        {activeCat !== "all" && (
          <span className="text-foreground font-medium"> · {CATS.find(c => c.id === activeCat)?.label}</span>
        )}
        {search.trim() && (
          <span> · <span className="italic">"{search}"</span></span>
        )}
      </p>

      {/* ── Masonry grid ── */}
      {filtered.length > 0 ? (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
          {filtered.map(item => (
            <LibraryCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
          <Search className="size-12 mb-4 opacity-20" />
          <p className="text-sm font-medium mb-1">Không tìm thấy kết quả</p>
          <p className="text-xs opacity-60">Thử tìm với từ khóa khác hoặc chọn danh mục khác</p>
        </div>
      )}
    </div>
  );
}
