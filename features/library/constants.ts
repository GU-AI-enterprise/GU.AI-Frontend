import type { ElementType } from "react";
import { UserRound, Image as ImageIcon, Layers, AlignLeft, LayoutGrid, Sparkles } from "lucide-react";
import type { Cat, Item } from "./types";

export const CATS: { id: Cat; label: string; Icon: ElementType }[] = [
  { id: "all",        label: "Tất cả",     Icon: Layers    },
  { id: "model",      label: "Người mẫu",  Icon: UserRound },
  { id: "pose",       label: "Dáng ảnh",   Icon: ImageIcon },
  { id: "prompt",     label: "Prompt",     Icon: AlignLeft },
  { id: "background", label: "Background", Icon: LayoutGrid },
  { id: "example",    label: "Ví dụ",      Icon: Sparkles  },
];

export const CAT_COLORS: Record<string, string> = {
  model:      "bg-primary/10 text-primary",
  pose:       "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  prompt:     "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  background: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  example:    "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

export const CAT_PROMPT_GRADIENT: Record<string, string> = {
  prompt: "from-violet-50 to-purple-50/60 dark:from-violet-950/40 dark:to-purple-950/20",
};

export const ITEMS: Item[] = [
  // ── Người mẫu ──────────────────────────────────────────────────────────────
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

  // ── Dáng ảnh ───────────────────────────────────────────────────────────────
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

  // ── Prompt ─────────────────────────────────────────────────────────────────
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

  // ── Background ─────────────────────────────────────────────────────────────
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

  // ── Ví dụ ──────────────────────────────────────────────────────────────────
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
