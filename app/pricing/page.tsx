"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, HelpCircle, ArrowRight, Minus, Plus } from "lucide-react";
import Logo from "@/components/shared/logo";
import Header from "@/components/shared/header";
import { Button } from "@/components/ui/button";

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annually">("monthly");
  const [photoCount, setPhotoCount] = useState(200);

  // Credit calculation logic
  const calculatePlan = (photos: number) => {
    if (photos <= 10) return { name: "Free", price: 0, credits: 10 };
    if (photos <= 500) return { name: "Pro", price: billingPeriod === "monthly" ? 499000 : 399000, credits: 500 };
    
    // Custom enterprise estimation
    const pricePerExtraPhoto = 800; // 800đ/photo
    const baseProPrice = billingPeriod === "monthly" ? 499000 : 399000;
    const estimatedPrice = baseProPrice + (photos - 500) * pricePerExtraPhoto;
    return { name: "Enterprise Custom", price: estimatedPrice, credits: photos };
  };

  const currentEstimation = calculatePlan(photoCount);

  const faqs = [
    {
      q: "Credit hoạt động như thế nào?",
      a: "Mỗi khi bạn generate 1 ảnh người mẫu ảo từ 1 sản phẩm đầu vào, hệ thống sẽ trừ 1 credit. Với Batch generation (tạo hàng loạt), số credits trừ sẽ tương ứng với tổng số ảnh được xuất thành công."
    },
    {
      q: "Credits có được cộng dồn sang tháng sau không?",
      a: "Đối với tài khoản Pro trả phí theo tháng, credits chưa sử dụng hết sẽ không được cộng dồn để đảm bảo tính toán tài nguyên hệ thống. Tuy nhiên, nếu bạn mua thêm gói credits bổ sung (Add-on), số credits đó sẽ không bao giờ hết hạn."
    },
    {
      q: "Tôi có thể hủy gói đăng ký bất kỳ lúc nào không?",
      a: "Hoàn toàn được. Bạn có thể hủy gói Pro bất cứ lúc nào thông qua trang Quản lý Đăng ký. Gói của bạn sẽ tiếp tục có hiệu lực cho đến hết chu kỳ thanh toán hiện tại."
    },
    {
      q: "Có hỗ trợ xuất hóa đơn VAT không?",
      a: "Có. Chúng tôi hỗ trợ xuất hóa đơn điện tử VAT cho các doanh nghiệp và shop đăng ký kinh doanh tại Việt Nam đối với các giao dịch nâng cấp gói Pro và Enterprise."
    }
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background">
      
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-12 text-center">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 size-96 rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        
        <div className="mx-auto max-w-4xl px-6 relative z-10">
          <h1 className="font-serif text-4xl font-light tracking-tight text-foreground sm:text-5xl">
            Bảng giá <span className="font-normal italic text-primary">đơn giản, minh bạch</span>
          </h1>
          <p className="mt-4 text-base font-light text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Không phí ẩn, không ràng buộc. Chọn gói cước phù hợp với tần suất đăng tải sản phẩm của bạn.
          </p>

          {/* Toggle monthly / annually */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <span className={`text-xs font-light transition-colors ${billingPeriod === "monthly" ? "text-foreground" : "text-muted-foreground"}`}>Thanh toán hàng tháng</span>
            <button 
              onClick={() => setBillingPeriod(billingPeriod === "monthly" ? "annually" : "monthly")}
              className="relative h-6 w-11 rounded-full bg-foreground/10 p-0.5 transition-colors focus:outline-none cursor-pointer"
            >
              <div className={`h-5 w-5 rounded-full bg-primary transition-transform duration-300 ${billingPeriod === "annually" ? "translate-x-5" : ""}`} />
            </button>
            <span className={`text-xs font-light transition-colors ${billingPeriod === "annually" ? "text-foreground" : "text-muted-foreground"}`}>
              Thanh toán hàng năm <span className="rounded-full bg-primary/20 border border-primary/30 text-primary px-1.5 py-0.5 text-[9px] font-bold">TIẾT KIỆM 20%</span>
            </span>
          </div>
        </div>
      </section>

      {/* Main Pricing Cards */}
      <section className="pb-16 relative z-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Free / Starter",
                price: "0đ",
                credits: "10 Credits / tháng",
                desc: "Thích hợp cho nhu cầu tìm hiểu chất lượng render.",
                features: ["Sử dụng 5 mẫu ảo mặc định", "Độ phân giải HD tiêu chuẩn", "Phông nền trơn cơ bản", "Hỗ trợ cộng đồng"],
                popular: false,
                cta: "Đăng ký miễn phí",
                href: "/register"
              },
              {
                name: "Pro Creator",
                price: billingPeriod === "monthly" ? "499.000đ" : "399.000đ",
                credits: "500 Credits / tháng",
                desc: "Kế hoạch hoàn hảo nhất cho đa số shop và thương hiệu vừa.",
                features: [
                  "Bản quyền 50+ mẫu nam/nữ Việt Nam",
                  "25+ Bối cảnh cao cấp (Đường phố, Studio, Cafe...)",
                  "Xử lý queue tốc độ cao (Priority queue)",
                  "Xuất chuẩn kích thước Shopee, TikTok Shop, FB",
                  "Tải ảnh Ultra-HD sắc nét",
                  "2 Brand Kits quản lý logo & bộ lọc màu"
                ],
                popular: true,
                cta: "Bắt đầu trải nghiệm Pro",
                href: "/register"
              },
              {
                name: "Enterprise",
                price: "Liên hệ",
                credits: "Không giới hạn",
                desc: "Dành cho thương hiệu lớn cần tự động hóa và custom model.",
                features: [
                  "Huấn luyện mẫu ảo AI độc quyền của thương hiệu",
                  "Tích hợp API trực tiếp vào CRM/ERP",
                  "Ưu tiên xử lý hàng đầu trên server riêng",
                  "Không giới hạn Brand Kits & Member",
                  "Ký cam kết chất lượng dịch vụ SLA",
                  "Account manager hỗ trợ riêng 24/7"
                ],
                popular: false,
                cta: "Liên hệ với chúng tôi",
                href: "mailto:enterprise@gu.ai"
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
                    Phổ biến nhất
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

      {/* Interactive Credit Estimator Slider */}
      <section className="py-16 border-t border-border/40 bg-secondary/15">
        <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[10px] text-primary uppercase font-mono tracking-wider mb-4">
            Interactive Cost Calculator
          </div>
          <h2 className="font-serif text-3xl font-light text-foreground">
            Ước lượng <span className="font-normal italic text-primary">ngân sách</span> của bạn
          </h2>
          <p className="mt-3 text-sm font-light text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Kéo thanh trượt để nhập số lượng ảnh sản phẩm bạn cần tạo mỗi tháng. Hệ thống sẽ gợi ý gói cước tương ứng.
          </p>

          <div className="mt-12 bg-card border border-border/60 rounded-2xl p-8 text-left space-y-8 shadow-sm">
            
            {/* Slide control */}
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="font-light text-muted-foreground">Số lượng ảnh cần tạo / tháng:</span>
                <span className="font-mono text-lg font-bold text-foreground">{photoCount} ảnh</span>
              </div>
              <input
                type="range"
                min="10"
                max="2000"
                step="10"
                value={photoCount}
                onChange={(e) => setPhotoCount(parseInt(e.target.value))}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
              />
              <div className="flex justify-between text-[10px] font-mono text-muted-foreground/50">
                <span>10 ảnh</span>
                <span>500 ảnh (Mốc Pro)</span>
                <span>1000 ảnh</span>
                <span>2000 ảnh+</span>
              </div>
            </div>

            {/* Estimation Result */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-t border-border/40 pt-6">
              <div>
                <span className="text-[10px] font-mono text-muted-foreground uppercase">Gói cước gợi ý:</span>
                <h4 className="text-xl font-bold text-foreground mt-1">
                  {currentEstimation.name}{" "}
                  {currentEstimation.name === "Enterprise Custom" && (
                    <span className="text-xs font-normal text-primary">(Ước tính giá sỉ)</span>
                  )}
                </h4>
                <p className="text-xs font-light text-muted-foreground mt-0.5">
                  Cung cấp tối thiểu {currentEstimation.credits} credits để thoải mái thiết kế.
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] font-mono text-muted-foreground uppercase">Chi phí ước tính:</span>
                <div className="text-2xl font-serif font-bold text-primary mt-1">
                  {currentEstimation.price === 0 
                    ? "Miễn phí" 
                    : `${currentEstimation.price.toLocaleString("vi-VN")}đ`
                  }
                  {currentEstimation.price !== 0 && (
                    <span className="text-xs font-light text-muted-foreground font-sans">/tháng</span>
                  )}
                </div>
                <p className="text-[10px] font-light text-muted-foreground/60 mt-0.5">
                  ~{(currentEstimation.price / currentEstimation.credits).toFixed(0)}đ / 1 ảnh người mẫu ảo
                </p>
              </div>
            </div>

            <div className="text-center pt-2">
              <Link href="/register">
                <Button className="rounded-xl bg-primary text-xs font-semibold px-6 py-4 hover:bg-primary/95 shadow-[0_0_15px_rgba(var(--color-primary),0.15)]">
                  Đăng ký dùng gói này ngay <ArrowRight className="size-3.5 ml-1" />
                </Button>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 border-t border-border/40 bg-background">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl font-light text-foreground">
              Câu hỏi <span className="font-normal italic text-primary">thường gặp</span>
            </h2>
            <p className="mt-3 text-sm font-light text-muted-foreground">
              Giải đáp nhanh các thắc mắc về hệ thống thanh toán và credits.
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="rounded-xl border border-border bg-card/45 p-6 hover:border-border transition-colors shadow-sm"
              >
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <HelpCircle className="size-4 shrink-0 text-primary" />
                  {faq.q}
                </h4>
                <p className="mt-3 text-xs font-light text-muted-foreground leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border/40 bg-background py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mt-8 pt-8 flex flex-col md:flex-row items-center justify-between text-xs font-light text-muted-foreground gap-4">
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
