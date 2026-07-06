"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Play,
  Check,
  Camera,
  Layers,
  Zap,
  Shuffle,
  Pencil,
  Video,
  ArrowDown,
  Crop,
  ImageUp,
} from "lucide-react";
import Header from "@/components/shared/header";
import Logo from "@/components/shared/logo";
import SupportChatWidget from "@/components/support/support-chat-widget";
import { Button } from "@/components/ui/button";
import {
  CompareSlider,
  CompareSliderAfter,
  CompareSliderBefore,
  CompareSliderHandle,
} from "@/components/ui/compare-slider";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";


const TOOLS = [
  { Icon: Camera,  title: "Product to Model", desc: "Đặt sản phẩm lên model AI chuyên nghiệp chỉ trong vài giây." },
  { Icon: Shuffle, title: "Virtual Try-On",   desc: "Thử trang phục ảo lên bất kỳ ảnh người mẫu thật hoặc AI." },
  { Icon: Layers,  title: "Model Swap",        desc: "Giữ nguyên trang phục, thay đổi hoàn toàn ngoại hình model." },
  { Icon: Zap,     title: "Face Swap",         desc: "Thay khuôn mặt tự nhiên với công nghệ AI tiên tiến." },
  { Icon: Pencil,  title: "AI Edit",           desc: "Chỉnh sửa chi tiết ảnh thông minh bằng lệnh văn bản." },
  { Icon: Video,   title: "Image to Video",    desc: "Biến ảnh tĩnh thành video thời trang sinh động.", badge: "Mới" },
  { Icon: Crop,    title: "Reframe",           desc: "Đổi tỉ lệ khung hình, mở rộng nền ảnh bằng AI." },
  { Icon: ImageUp, title: "Upscale",           desc: "Nâng độ phân giải ảnh lên 2× – 4× mà không mất chi tiết." },
];

export default function LandingPage() {
  const router = useRouter();

  // ── custom page scroll ──
  const pageRef   = useRef<HTMLDivElement>(null);
  const pageIdx   = useRef(0);
  const scrolling = useRef(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const goTo = useCallback((idx: number) => {
    const el = pageRef.current;
    if (!el) return;
    const count = el.children.length;
    idx = Math.max(0, Math.min(count - 1, idx));
    scrolling.current = true;
    pageIdx.current   = idx;
    const target = el.children[idx] as HTMLElement;
    // Use getBoundingClientRect so position is always relative to the scroll container,
    // regardless of whether pageRef is the CSS offsetParent.
    const targetTop = target.getBoundingClientRect().top - el.getBoundingClientRect().top + el.scrollTop;
    el.scrollTo({ top: targetTop, behavior: "smooth" });
    setTimeout(() => { scrolling.current = false; }, 900);
  }, []);

  useEffect(() => {
    const el = pageRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (scrolling.current) return;
      goTo(pageIdx.current + (e.deltaY > 0 ? 1 : -1));
    };

    let ty = 0;
    const onTouchStart = (e: TouchEvent) => { ty = e.touches[0].clientY; };
    const onTouchEnd   = (e: TouchEvent) => {
      const diff = ty - e.changedTouches[0].clientY;
      if (Math.abs(diff) > 40) goTo(pageIdx.current + (diff > 0 ? 1 : -1));
    };

    el.addEventListener("wheel",      onWheel,      { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true  });
    el.addEventListener("touchend",   onTouchEnd,   { passive: true  });
    return () => {
      el.removeEventListener("wheel",      onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend",   onTouchEnd);
    };
  }, [goTo]);

  const SECTION = "h-[calc(100vh-4rem)]";

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* scroll progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-1 bg-violet-200/15 pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-violet-500 via-purple-400 to-fuchsia-400 transition-[width] duration-100 ease-linear"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <Header />

      {/* ── custom page scroll container ── */}
      <div
        ref={pageRef}
        className="flex-1 overflow-y-scroll [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onScroll={(e) => {
          const el = e.currentTarget;
          const pct = el.scrollTop / (el.scrollHeight - el.clientHeight);
          setScrollProgress(Math.round(pct * 100));
        }}
      >

        {/* ═══════════════ 1. HERO ═══════════════ */}
        <section className={`${SECTION} relative flex flex-col items-center justify-center overflow-hidden px-6`}>

          {/* Background layer */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full bg-primary/5 blur-[150px]" />
            <div className="absolute top-8 right-8 size-[300px] rounded-full bg-rose-500/5 blur-[100px]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(var(--color-primary),0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(var(--color-primary),0.02)_1px,transparent_1px)] bg-[size:30px_30px]" />

            {/* Floating model images */}
            {[
              { src: "/images/vietnamese_female.png", cls: "top-[8%]  left-[3%]  w-28 lg:w-40 -rotate-6",  dur: 8   },
              { src: "/images/japanese_female.png",   cls: "top-[6%]  right-[3%] w-24 lg:w-36  rotate-6",  dur: 9.5 },
              { src: "/images/indian_female.png",     cls: "bottom-[8%] left-[5%]  w-32 lg:w-44  rotate-3",  dur: 11  },
              { src: "/images/western_female.png",    cls: "bottom-[8%] right-[5%] w-28 lg:w-40 -rotate-3", dur: 8.5 },
            ].map((img, i) => (
              <motion.div
                key={i}
                className={`absolute ${img.cls} aspect-[3/4] rounded-2xl overflow-hidden border border-primary/10 shadow-lg opacity-[0.12] blur-[2px]`}
                animate={{ y: [0, -16, 0] }}
                transition={{ duration: img.dur, repeat: Infinity, ease: "easeInOut" }}
              >
                <img src={img.src} alt="" className="size-full object-cover" />
              </motion.div>
            ))}
          </div>

          {/* Content */}
          <motion.div
            className="relative z-10 text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary font-medium tracking-wider uppercase mb-6">
              <Sparkles className="size-3.5" /> Nền tảng AI dành riêng cho thời trang
            </div>

            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight text-foreground leading-[1.1]">
              Studio thời trang <br />
              <span className="font-normal italic text-primary relative">
                trong lòng bàn tay
                <span className="absolute bottom-1 left-0 w-full h-[6px] bg-primary/20 rounded-full blur-[1px]" />
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg font-light text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Từ ảnh sản phẩm thô đến ảnh model chuyên nghiệp — không cần model thật, không cần studio thuê.
              GU.AI Studio tạo ra trong vài giây.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Button
                onClick={() => router.push("/studio")}
                className="rounded-full bg-primary px-8 py-6 text-sm font-semibold text-primary-foreground shadow-[0_0_25px_rgba(var(--color-primary),0.2)] hover:bg-primary/90 hover:scale-[1.02] transition-all"
              >
                Dùng thử miễn phí <ArrowRight className="size-4 ml-1" />
              </Button>
              <Button
                variant="outline"
                className="rounded-full px-8 py-6 text-sm border-border hover:bg-secondary transition-all text-muted-foreground"
                onClick={() => goTo(2)}
              >
                <Play className="size-3.5 mr-2 fill-current" /> Xem demo
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-14 grid grid-cols-3 gap-6 border border-border/60 py-6 max-w-xl mx-auto bg-card/45 rounded-2xl px-6 backdrop-blur-sm shadow-sm">
              {[
                { num: "90%",   label: "Tiết kiệm chi phí" },
                { num: "< 1 min", label: "Tốc độ tạo ảnh"   },
                { num: "8+",    label: "Công cụ AI"        },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="font-serif text-2xl sm:text-3xl font-light text-foreground">{s.num}</div>
                  <div className="text-[11px] font-light text-muted-foreground mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 text-muted-foreground/40"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown className="size-5" />
          </motion.div>
        </section>

        {/* ═══════════════ 2. TOOLS ═══════════════ */}
        <section className={`${SECTION} flex flex-col items-center justify-center border-t border-border/40 px-6 py-12`}>
          <div className="max-w-5xl w-full mx-auto">
            <div className="text-center mb-8">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">BỘ CÔNG CỤ AI</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-light tracking-tight text-foreground mt-2">
                Mọi thứ bạn cần, <span className="font-normal italic text-primary">trong một nơi</span>
              </h2>
              <p className="mt-2 text-sm font-light text-muted-foreground max-w-lg mx-auto">
                Bộ công cụ AI chuyên biệt cho ngành thời trang — từ tạo ảnh model, thử đồ ảo đến chỉnh sửa và hoán đổi.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {TOOLS.map((tool, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -4, transition: { type: "spring", stiffness: 300 } }}
                  className="group relative rounded-2xl border border-border/60 bg-card/45 p-4 hover:bg-secondary/40 hover:border-border transition-colors duration-200 cursor-pointer"
                  onClick={() => router.push("/studio")}
                >
                  <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 mb-3 text-primary">
                    <tool.Icon className="size-4" />
                  </div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <h3 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">{tool.title}</h3>
                    {tool.badge && (
                      <span className="rounded-full bg-primary/20 text-primary text-[8px] px-1.5 py-0.5 font-bold">{tool.badge}</span>
                    )}
                  </div>
                  <p className="text-[10px] font-light text-muted-foreground leading-relaxed">{tool.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ 3. DEMO ═══════════════ */}
        <section className={`${SECTION} flex flex-col items-center justify-center border-t border-border/40 px-6 py-12`}>
          <div className="max-w-5xl w-full mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-16">

            {/* Text */}
            <div className="md:w-1/2 text-center md:text-left">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">SO SÁNH TRỰC QUAN</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-light tracking-tight text-foreground mt-2">
                Từ ảnh thô đến <span className="font-normal italic text-primary">ảnh chuyên nghiệp</span>
              </h2>
              <p className="mt-4 text-sm font-light text-muted-foreground leading-relaxed">
                Kéo thanh trượt để so sánh. Cùng một trang phục — khác biệt hoàn toàn khi qua GU.AI Studio.
              </p>

              <ul className="mt-6 space-y-3">
                {[
                  "Giữ nguyên 100% chi tiết vải & họa tiết",
                  "Phom dáng chuẩn Việt Nam & châu Á",
                  "Ánh sáng studio chuyên nghiệp tự động",
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <Check className="size-4 text-primary shrink-0" />
                    <span className="font-light">{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => router.push("/studio")}
                className="mt-8 rounded-full bg-primary px-6 py-5 text-sm font-semibold hover:bg-primary/90 transition-all"
              >
                Thử ngay miễn phí <ArrowRight className="size-4 ml-1" />
              </Button>
            </div>

            {/* Slider */}
            <div className="md:w-1/2 w-full max-w-xs mx-auto">
              <CompareSlider
                defaultValue={50}
                className="aspect-[3/4] rounded-2xl border border-border shadow-xl"
              >
                {/* After (AI render) — left side */}
                <CompareSliderAfter>
                  <img src="/images/after.jpg" alt="AI Model" className="absolute inset-0 size-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 rounded-full bg-primary/30 border border-primary/50 px-2.5 py-0.5 text-[9px] text-white font-mono backdrop-blur-sm">✦ AI RENDER</div>
                  <div className="absolute bottom-4 left-4">
                    <p className="text-[10px] text-primary font-mono uppercase tracking-wider">Kết quả AI</p>
                    <p className="text-sm font-serif text-white mt-0.5">Ảnh Model Hoàn Thiện</p>
                  </div>
                </CompareSliderAfter>

                {/* Before (raw product) — right side */}
                <CompareSliderBefore>
                  <img src="/images/before.jpg" alt="Raw Product" className="absolute inset-0 size-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute top-3 right-3 rounded-full bg-white/20 border border-white/30 px-2.5 py-0.5 text-[9px] text-white font-mono backdrop-blur-sm">ẢNH GỐC</div>
                  <div className="absolute bottom-4 right-4 text-right">
                    <p className="text-[10px] text-white/70 font-mono uppercase tracking-wider">Đầu vào</p>
                    <p className="text-sm font-serif text-white mt-0.5">Ảnh Sản Phẩm Thô</p>
                  </div>
                </CompareSliderBefore>

                <CompareSliderHandle />
              </CompareSlider>
            </div>
          </div>
        </section>

        {/* ═══════════════ 5. PRICING ═══════════════ */}
        <section id="pricing" className={`${SECTION} flex flex-col items-center justify-center border-t border-border/40 bg-secondary/15 px-6 py-10`}>
          <div className="max-w-5xl w-full mx-auto">
            <div className="text-center mb-7">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">BẢNG GIÁ</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-light tracking-tight text-foreground mt-2">
                Mua một lần, <span className="font-normal italic text-primary">dùng vĩnh viễn</span>
              </h2>
              <p className="mt-2 text-xs font-light text-muted-foreground">
                Top-up credits bất kỳ lúc nào — gói cao hơn = giảm giá nhiều hơn
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  name: "Dùng Thử", price: "Miễn phí", credits: "0 Credits",
                  badge: { label: "Free", color: "text-slate-400", bg: "bg-slate-400/10 border border-slate-400/20" },
                  discount: "0% top-up",
                  features: ["Top-up: 1.580đ / credit", "Mẫu ảo mặc định", "Tính năng cơ bản"],
                  popular: false, cta: "Bắt đầu ngay", href: "/register",
                },
                {
                  name: "Starter", price: "199.000đ", credits: "100 Credits",
                  badge: { label: "Basic", color: "text-blue-400", bg: "bg-blue-400/10 border border-blue-400/20" },
                  discount: "-5% top-up",
                  features: ["100 credits nạp ngay", "Top-up: 1.501đ / credit", "Mẫu ảo cơ bản"],
                  popular: false, cta: "Mua Starter", href: "/register",
                },
                {
                  name: "Gói Cơ Bản", price: "349.000đ", credits: "200 Credits",
                  badge: { label: "Pro", color: "text-violet-400", bg: "bg-violet-400/10 border border-violet-400/20" },
                  discount: "-10% top-up",
                  features: ["200 credits nạp ngay", "Top-up: 1.422đ / credit", "50+ mẫu ảo Việt Nam", "20+ bối cảnh cao cấp"],
                  popular: true, cta: "Mua Gói Cơ Bản", href: "/register",
                },
              ].map((plan, idx) => (
                <div
                  key={idx}
                  className={`relative rounded-2xl p-6 flex flex-col transition-all duration-200 ${
                    plan.popular
                      ? "border-2 border-primary bg-background shadow-[0_0_25px_rgba(var(--color-primary),0.07)] scale-[1.03]"
                      : "border border-border/80 bg-card hover:shadow-sm"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-[9px] font-bold text-primary-foreground uppercase tracking-wider">
                      Phổ biến nhất
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${plan.badge.bg} ${plan.badge.color}`}>
                      {plan.badge.label}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-foreground">{plan.name}</h3>
                  <div className="mt-3 pb-3 border-b border-border/40 flex items-baseline gap-1">
                    <span className="text-2xl font-serif font-semibold text-foreground">{plan.price}</span>
                  </div>
                  <div className="mt-3 mb-2 flex items-center gap-2">
                    <span className="text-xs font-semibold text-primary">{plan.credits}</span>
                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">{plan.discount}</span>
                  </div>
                  <ul className="space-y-2 flex-1">
                    {plan.features.map((f, fi) => (
                      <li key={fi} className="flex items-start gap-2 text-xs font-light text-muted-foreground">
                        <Check className="size-3.5 shrink-0 text-primary mt-0.5" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.href} className="mt-5">
                    <Button className={`w-full py-4 text-xs font-semibold rounded-xl ${
                      plan.popular
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-secondary text-foreground hover:bg-secondary/80"
                    }`}>
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>

            <p className="mt-5 text-center text-xs text-muted-foreground">
              Không muốn mua gói? <Link href="/register" className="text-primary hover:underline font-medium">Đăng ký miễn phí</Link> và top-up credits với giá 1.580đ / credit bất kỳ lúc nào.
            </p>
          </div>
        </section>

        {/* ═══════════════ 6. FOOTER ═══════════════ */}
        <footer className="snap-start snap-always min-h-[calc(100vh-4rem)] border-t border-border/40 bg-background flex flex-col">

          {/* CTA banner */}
          <div className="border-b border-border/40 py-14 px-6 text-center bg-gradient-to-b from-primary/5 to-transparent">
            <h2 className="font-serif text-3xl sm:text-4xl font-light text-foreground">
              Sẵn sàng tạo ảnh thời trang <span className="font-normal italic text-primary">đỉnh cao</span>?
            </h2>
            <p className="mt-3 text-sm font-light text-muted-foreground max-w-md mx-auto">
              Tham gia cùng hàng ngàn thương hiệu thời trang đang tin dùng GU.AI Studio.
            </p>
            <Button
              onClick={() => router.push("/register")}
              className="mt-6 rounded-full bg-primary px-8 py-6 text-sm font-semibold hover:bg-primary/90 hover:scale-[1.02] transition-all"
            >
              Bắt đầu miễn phí <ArrowRight className="size-4 ml-1" />
            </Button>
          </div>

          {/* Links */}
          <div className="flex-1 max-w-7xl mx-auto px-6 lg:px-8 py-10 w-full">
            <div className="grid md:grid-cols-4 gap-8">
              <div className="space-y-3 md:col-span-1">
                <Logo />
                <p className="text-xs font-light text-muted-foreground leading-relaxed max-w-xs">
                  Mang lại giá trị thẩm mỹ vượt bậc cho ngành thời trang Việt Nam thông qua Trí Tuệ Nhân Tạo.
                </p>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Sản phẩm</h4>
                <ul className="mt-3 space-y-2 text-xs font-light text-muted-foreground">
                  <li><Link href="/studio"  className="hover:text-primary transition-colors">GU.AI Studio</Link></li>
                  <li><Link href="/pricing"  className="hover:text-primary transition-colors">Bảng giá</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Tài khoản</h4>
                <ul className="mt-3 space-y-2 text-xs font-light text-muted-foreground">
                  <li><Link href="/login"     className="hover:text-primary transition-colors">Đăng nhập</Link></li>
                  <li><Link href="/register"  className="hover:text-primary transition-colors">Đăng ký</Link></li>
                  <li><Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Liên hệ</h4>
                <ul className="mt-3 space-y-2 text-xs font-light text-muted-foreground">
                  <li>contact@gu.ai</li>
                  <li>+84 799 165 330</li>
                  <li>Hồ Chí Minh, Việt Nam</li>
                </ul>
              </div>
            </div>
            <div className="mt-10 pt-6 border-t border-border/40 flex flex-col md:flex-row items-center justify-between text-xs font-light text-muted-foreground gap-4">
              <span>© 2026 GU.AI. Bảo lưu mọi quyền.</span>
              <div className="flex gap-6">
                <Link href="/privacy" className="hover:text-primary transition-colors">Chính sách bảo mật</Link>
                <Link href="/terms"   className="hover:text-primary transition-colors">Điều khoản dịch vụ</Link>
              </div>
            </div>
          </div>
        </footer>

      </div>

      <SupportChatWidget />
    </div>
  );
}
