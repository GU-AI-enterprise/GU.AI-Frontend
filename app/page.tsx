"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Layers, 
  Zap, 
  ChevronRight, 
  ArrowRight, 
  Play, 
  Check, 
  HelpCircle,
  ExternalLink,
  ChevronLeft
} from "lucide-react";
import Logo from "@/components/shared/logo";
import Header from "@/components/shared/header";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annually">("monthly");

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(position);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background">
      
      {/* Top Banner (Optional promo) */}
      <div className="relative z-50 bg-gradient-to-r from-primary/10 via-primary/20 to-rose-500/10 py-2.5 text-center text-xs font-light tracking-wide text-foreground border-b border-primary/20">
        🎉 Giới thiệu GU.AI Studio v1.0 - Trải nghiệm AI Virtual Shoot miễn phí ngay hôm nay.{" "}
        <Link href="/register" className="font-semibold text-primary underline hover:text-primary/80 transition-colors">
          Thử ngay <ArrowRight className="inline size-3" />
        </Link>
      </div>

      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-32 md:pb-36 lg:pt-40">
        
        {/* Glow circles & grid backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full bg-primary/5 blur-[150px] pointer-events-none" />
        <div className="absolute top-10 right-10 size-[300px] rounded-full bg-rose-500/5 blur-[100px] pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-full bg-[linear-gradient(to_right,rgba(var(--color-primary),0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(var(--color-primary),0.02)_1px,transparent_1px)] bg-[size:30px_30px]" />

        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10 text-center">
          
          {/* Badge */}
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary font-medium tracking-wider uppercase mb-6 animate-fade-in">
            <Sparkles className="size-3.5" /> Nền tảng mẫu ảo AI số 1 Việt Nam
          </div>

          {/* Headline */}
          <h1 className="font-serif text-4xl font-light tracking-tight text-foreground sm:text-6xl lg:text-7xl leading-[1.1] max-w-4xl mx-auto">
            Biến ảnh treo sản phẩm <br /> thành{" "}
            <span className="font-normal italic text-primary relative">
              Ảnh người mẫu AI
              <span className="absolute bottom-1 left-0 w-full h-[6px] bg-primary/20 rounded-full blur-[1px]" />
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-8 text-base sm:text-lg font-light text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Không còn tốn kém thuê mẫu, studio hay chỉnh sửa photoshop thủ công. Chỉ cần tải lên ảnh áo/quần, GU.AI sẽ tự động sinh mẫu nam/nữ mặc đồ với vóc dáng chuẩn Việt Nam trong 3 giây.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/register">
              <Button className="rounded-full bg-primary px-8 py-6 text-sm font-semibold text-primary-foreground shadow-[0_0_25px_rgba(var(--color-primary),0.2)] hover:bg-primary/90 hover:scale-[1.02] transition-all">
                Tạo ảnh ngay lập tức
                <ArrowRight className="size-4 ml-1" />
              </Button>
            </Link>
            <Link href="#interactive-demo">
              <Button variant="outline" className="rounded-full px-8 py-6 text-sm border-border hover:bg-secondary hover:text-foreground transition-all text-muted-foreground">
                <Play className="size-3.5 mr-2 fill-current" /> Xem cách hoạt động
              </Button>
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border border-border/60 py-8 max-w-4xl mx-auto bg-card/45 rounded-2xl px-6 backdrop-blur-sm shadow-sm">
            {[
              { num: "90%", label: "Chi phí tiết kiệm" },
              { num: "3 giây", label: "Thời gian tạo ảnh" },
              { num: "1.2 Triệu", label: "Ảnh mẫu đã tạo" },
              { num: "500+", label: "Shop thời trang tin dùng" }
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="font-serif text-3xl font-light text-foreground">{stat.num}</div>
                <div className="text-xs font-light text-muted-foreground mt-1 tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Interactive Demo (Slider Section) */}
      <section id="interactive-demo" className="py-20 border-t border-border/40 bg-secondary/15">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-serif text-3xl font-light tracking-tight text-foreground sm:text-4xl">
              Trực quan hóa <span className="font-normal italic text-primary">Sức mạnh của AI</span>
            </h2>
            <p className="mt-4 text-sm font-light text-muted-foreground leading-relaxed">
              Kéo thanh trượt để so sánh sự khác biệt vượt trội giữa ảnh chụp móc áo phẳng thông thường và ảnh được tạo bởi mô hình AI cao cấp của GU.AI.
            </p>
          </div>

          {/* Comparison Slider Component */}
          <div className="max-w-xl mx-auto">
            <div 
              ref={containerRef}
              className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-border shadow-xl select-none cursor-ew-resize bg-background"
              onMouseDown={() => setIsDragging(true)}
              onTouchStart={() => setIsDragging(true)}
            >
              
              {/* After: AI generated model (Left/Visible side when slider goes right) */}
              <div className="absolute inset-0 bg-secondary/10 flex flex-col justify-end p-8 text-left bg-gradient-to-t from-background/95 via-background/10 to-transparent">
                {/* Simulated AI Fashion Model render */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-tr from-primary/10 via-rose-500/5 to-amber-500/5">
                  {/* Lotus flower silhouette or minimalist model wireframe */}
                  <div className="relative size-64 flex items-center justify-center opacity-30">
                    <div className="absolute inset-0 rounded-full border border-primary/30 animate-ping" />
                    <div className="size-48 rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center">
                      <Logo iconOnly href="" className="scale-[2.5]" />
                    </div>
                  </div>
                  <div className="absolute top-8 left-8 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-[10px] text-primary uppercase font-mono tracking-wider font-semibold">
                    Model: Ngoc Trinh (Vietnamese AI)
                  </div>
                  <div className="absolute top-8 right-8 rounded-full bg-card border border-border px-3 py-1 text-[10px] text-foreground uppercase font-mono tracking-wider">
                    Lighting: Soft Studio Warm
                  </div>
                </div>
                
                <div className="relative z-10">
                  <span className="text-[10px] font-mono tracking-wider uppercase text-primary font-bold">KẾT QUẢ AI RENDER</span>
                  <h4 className="font-serif text-2xl text-foreground mt-1">Ảnh Mẫu Mặc Đồ Hoàn Thiện</h4>
                  <p className="text-xs font-light text-muted-foreground mt-1">Họa tiết vải chính xác 99%, chuẩn phom dáng, ảnh sáng tự nhiên.</p>
                </div>
              </div>

              {/* Before: Raw product on hanger (Right side, cropped by clipPath) */}
              <div 
                className="absolute inset-0 bg-secondary/20 flex flex-col justify-end p-8 text-left transition-all duration-75 select-none"
                style={{ clipPath: `polygon(${sliderPosition}% 0, 100% 0, 100% 100%, ${sliderPosition}% 100%)` }}
              >
                {/* Simulated Raw Product Photo */}
                <div className="absolute inset-0 flex items-center justify-center bg-secondary/5">
                  <div className="size-48 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 text-muted-foreground/45 bg-background">
                    <Layers className="size-10" />
                    <span className="text-[11px] uppercase tracking-wider font-mono">Ảnh Chụp Treo Móc</span>
                  </div>
                  <div className="absolute top-8 right-8 rounded-full bg-card border border-border px-3 py-1 text-[10px] text-foreground uppercase font-mono tracking-wider">
                    Flatlay / Hanger Only
                  </div>
                </div>
                
                <div className="relative z-10">
                  <span className="text-[10px] font-mono tracking-wider uppercase text-muted-foreground">ẢNH ĐẦU VÀO</span>
                  <h4 className="font-serif text-2xl text-foreground/80 mt-1">Ảnh Chụp Thô Sản Phẩm</h4>
                  <p className="text-xs font-light text-muted-foreground mt-1">Ảnh chụp tự chụp bằng điện thoại hoặc móc treo, phông trắng thô sơ.</p>
                </div>
              </div>

              {/* Drag line overlay */}
              <div 
                className="absolute inset-y-0 w-1 bg-primary cursor-ew-resize select-none"
                style={{ left: `${sliderPosition}%` }}
              >
                {/* Handle button */}
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-10 rounded-full border border-primary bg-background shadow-lg flex items-center justify-between px-1.5 text-primary">
                  <ChevronLeft className="size-4" />
                  <ChevronRight className="size-4" />
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Services / Features Section */}
      <section id="features" className="py-24 border-t border-border/40 relative bg-background">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div className="max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">SẢN PHẨM & DỊCH VỤ</span>
              <h2 className="font-serif text-3xl font-light tracking-tight text-foreground sm:text-4xl mt-2">
                Các giải pháp tạo mẫu <span className="font-normal italic text-primary">đột phá</span>
              </h2>
            </div>
            <p className="text-sm font-light text-muted-foreground max-w-md leading-relaxed">
              Được thiết kế tỉ mỉ để tối ưu hóa quy trình làm ảnh của các shop bán lẻ, thương hiệu nội địa và sàn TMĐT Việt Nam.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Sparkles className="size-6 text-primary" />,
                title: "Tạo Mẫu Đơn Lẻ (Single AI Model)",
                desc: "Đăng tải 1 ảnh sản phẩm thô, chọn mẫu nam/nữ, thay đổi bối cảnh linh hoạt theo phong cách thương hiệu chỉ với 3 click."
              },
              {
                icon: <Layers className="size-6 text-primary" />,
                title: "Xử Lý Hàng Loạt (Batch Queue)",
                desc: "Hệ thống queue BullMQ tiên tiến cho phép bạn đăng tải 100+ sản phẩm cùng lúc. AI tự động tách và xử lý bất chấp thời gian."
              },
              {
                icon: <Zap className="size-6 text-primary" />,
                title: "Bộ Nhận Diện Thương Hiệu (Brand Kit)",
                desc: "Lưu giữ phong cách chiếu sáng, phông màu, logo, tỷ lệ khung hình Shopee/TikTok Shop để tạo loạt ảnh đồng nhất tuyệt đối."
              }
            ].map((service, idx) => (
              <div 
                key={idx} 
                className="group relative rounded-2xl border border-border/60 bg-card/45 p-8 transition-all duration-300 hover:bg-secondary/40 hover:border-border hover:-translate-y-1 shadow-sm"
              >
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 shadow-inner mb-6">
                  {service.icon}
                </div>
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                <p className="mt-3 text-sm font-light text-muted-foreground leading-relaxed">
                  {service.desc}
                </p>
              </div>
            ))}
          </div>

          {/* More details CTA */}
          <div className="mt-12 text-center">
            <Link href="/services">
              <Button variant="ghost" className="group rounded-full hover:bg-secondary text-primary text-sm font-semibold">
                Khám phá toàn bộ dịch vụ
                <ChevronRight className="size-4 ml-1 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
          </div>

        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 border-t border-border/40 bg-secondary/15">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">BẢNG GIÁ DỊCH VỤ</span>
            <h2 className="font-serif text-3xl font-light tracking-tight text-foreground sm:text-4xl mt-2">
              Kế hoạch giá trị <span className="font-normal italic text-primary">phù hợp</span>
            </h2>
            
            {/* Toggle monthly / annually */}
            <div className="mt-6 flex items-center justify-center gap-3">
              <span className={`text-xs font-light transition-colors ${billingPeriod === "monthly" ? "text-foreground" : "text-muted-foreground"}`}>Mỗi tháng</span>
              <button 
                onClick={() => setBillingPeriod(billingPeriod === "monthly" ? "annually" : "monthly")}
                className="relative h-6 w-11 rounded-full bg-foreground/10 p-0.5 transition-colors focus:outline-none"
              >
                <div className={`h-5 w-5 rounded-full bg-primary transition-transform duration-300 ${billingPeriod === "annually" ? "translate-x-5" : ""}`} />
              </button>
              <span className={`text-xs font-light transition-colors ${billingPeriod === "annually" ? "text-foreground" : "text-muted-foreground"}`}>
                Mỗi năm <span className="rounded-full bg-primary/20 border border-primary/30 text-primary px-1.5 py-0.5 text-[9px] font-bold">TIẾT KIỆM 20%</span>
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Thử Nghiệm (Free)",
                price: "0đ",
                credits: "10 Credits/tháng",
                desc: "Dành cho shop nhỏ thử nghiệm chất lượng mẫu ảnh AI.",
                features: ["Mẫu nam/nữ cơ bản", "Độ phân giải tiêu chuẩn", "1 Bối cảnh mặc định", "Tải xuống chuẩn 1:1"],
                popular: false,
                cta: "Bắt đầu miễn phí",
                href: "/register"
              },
              {
                name: "Chuyên Nghiệp (Pro)",
                price: billingPeriod === "monthly" ? "499.000đ" : "399.000đ",
                credits: "500 Credits/tháng",
                desc: "Thích hợp cho thương hiệu thời trang local phát hành BST đều đặn.",
                features: [
                  "Truy cập toàn bộ kho 50+ mẫu ảo Việt Nam",
                  "Mở khóa 20+ bối cảnh (Cafe, Streetwear, Studio...)",
                  "Xử lý hàng loạt (Priority Queue)",
                  "Tải ảnh Ultra-HD (Shopee 1:1, TikTok 9:16, FB 4:5)",
                  "Quản lý 2 Brand Kits"
                ],
                popular: true,
                cta: "Nâng cấp Pro ngay",
                href: "/register"
              },
              {
                name: "Doanh Nghiệp (Enterprise)",
                price: "Liên hệ",
                credits: "Không giới hạn credits",
                desc: "Dành cho hãng thời trang lớn, Agency cần tích hợp API tự động hóa.",
                features: [
                  "Mô hình AI độc quyền thiết kế riêng theo mẫu thật",
                  "API tích hợp hệ thống quản trị sản phẩm",
                  "Hỗ trợ 24/7 với nhân sự kỹ thuật riêng",
                  "Không giới hạn số lượng Brand Kits & Thành viên",
                  "Hợp đồng SLA cam kết thời gian phản hồi"
                ],
                popular: false,
                cta: "Kết nối trực tiếp",
                href: "mailto:contact@gu.ai"
              }
            ].map((plan, idx) => (
              <div 
                key={idx} 
                className={`relative rounded-2xl p-8 flex flex-col justify-between transition-all duration-300 ${
                  plan.popular 
                    ? "border-2 border-primary bg-primary/[0.02] shadow-[0_0_30px_rgba(var(--color-primary),0.08)] scale-105 z-10 bg-background" 
                    : "border border-border/80 bg-card hover:border-border hover:shadow-sm"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[9px] font-bold text-primary-foreground uppercase tracking-wider">
                    Khuyên dùng
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                  <p className="text-xs font-light text-muted-foreground/60 mt-1">{plan.desc}</p>
                  
                  <div className="mt-6 flex items-baseline gap-1 border-b border-border/40 pb-6">
                    <span className="text-3xl font-serif font-semibold text-foreground">{plan.price}</span>
                    {plan.price !== "Liên hệ" && (
                      <span className="text-xs font-light text-muted-foreground">/tháng</span>
                    )}
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="text-sm font-semibold text-primary">{plan.credits}</div>
                    <ul className="space-y-3">
                      {plan.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2.5 text-xs font-light text-muted-foreground">
                          <Check className="size-4 shrink-0 text-primary mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8">
                  <Link href={plan.href}>
                    <Button 
                      className={`w-full py-5 text-xs font-semibold rounded-xl transition-all ${
                        plan.popular 
                          ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--color-primary),0.15)] hover:bg-primary/90" 
                          : "bg-secondary text-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border/40 bg-background py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4 md:col-span-1">
              <Logo />
              <p className="text-xs font-light text-muted-foreground leading-relaxed max-w-xs">
                Mạng lại giá trị thẩm mỹ vượt bậc cho ngành thời trang Việt Nam thông qua Trí Tuệ Nhân Tạo.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Sản phẩm</h4>
              <ul className="mt-4 space-y-2 text-xs font-light text-muted-foreground">
                <li><Link href="/register" className="hover:text-primary transition-colors font-normal">Trình tạo mẫu đơn</Link></li>
                <li><Link href="/register" className="hover:text-primary transition-colors font-normal">Tạo ảnh hàng loạt</Link></li>
                <li><Link href="/services" className="hover:text-primary transition-colors font-normal">Tính năng Brand Kit</Link></li>
                <li><Link href="/pricing" className="hover:text-primary transition-colors font-normal">Bảng giá Credits</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Liên kết</h4>
              <ul className="mt-4 space-y-2 text-xs font-light text-muted-foreground">
                <li><Link href="/services" className="hover:text-primary transition-colors font-normal">Dịch vụ</Link></li>
                <li><Link href="/pricing" className="hover:text-primary transition-colors font-normal">Bảng giá</Link></li>
                <li><Link href="/login" className="hover:text-primary transition-colors font-normal">Cổng đăng nhập</Link></li>
                <li><Link href="/register" className="hover:text-primary transition-colors font-normal">Đăng ký thành viên</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Liên hệ</h4>
              <ul className="mt-4 space-y-2 text-xs font-light text-muted-foreground">
                <li>Email: contact@gu.ai</li>
                <li>Hotline: +84 987 654 321</li>
                <li>Địa chỉ: Tháp Lotte, Hà Nội, Việt Nam</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between text-xs font-light text-muted-foreground gap-4">
            <span>© 2026 GU.AI. Bảo lưu mọi quyền.</span>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-primary transition-colors font-normal">Chính sách bảo mật</Link>
              <Link href="/terms" className="hover:text-primary transition-colors font-normal">Điều khoản dịch vụ</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
