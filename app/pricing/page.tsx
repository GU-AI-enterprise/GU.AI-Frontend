"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, HelpCircle, ArrowRight, TrendingDown, Coins, Zap } from "lucide-react";
import Header from "@/components/shared/header";
import { Button } from "@/components/ui/button";

const BASE_RATE = 1580; // đ / credit (no plan)

const PACKAGES = [
  {
    name: "Starter",
    price: 261000,
    credits: 100,
    planType: "basic",
    planLabel: "Basic",
    planColor: "text-blue-400",
    planBg: "bg-blue-400/10 border-blue-400/20",
    topupDiscount: 5,
    topupRate: Math.round(BASE_RATE * 0.95),
    features: [
      "100 credits nạp ngay",
      "Giảm 5% vĩnh viễn khi top-up",
      "Giá top-up: 1.501đ / credit",
      "Mẫu ảo nam/nữ cơ bản",
      "Độ phân giải HD tiêu chuẩn",
    ],
    popular: false,
    cta: "Mua Starter",
  },
  {
    name: "Gói Cơ Bản",
    price: 489000,
    credits: 199,
    planType: "pro",
    planLabel: "Pro",
    planColor: "text-violet-400",
    planBg: "bg-violet-400/10 border-violet-400/20",
    topupDiscount: 10,
    topupRate: Math.round(BASE_RATE * 0.90),
    features: [
      "199 credits nạp ngay",
      "Giảm 10% vĩnh viễn khi top-up",
      "Giá top-up: 1.422đ / credit",
      "50+ mẫu ảo Việt Nam",
      "20+ bối cảnh phong phú",
      "Xuất ảnh Ultra-HD đa tỉ lệ",
    ],
    popular: true,
    cta: "Mua Gói Cơ Bản",
  },
  {
    name: "Gói Chuyên Nghiệp",
    price: 1100000,
    credits: 499,
    planType: "agency",
    planLabel: "Agency",
    planColor: "text-amber-400",
    planBg: "bg-amber-400/10 border-amber-400/20",
    topupDiscount: 15,
    topupRate: Math.round(BASE_RATE * 0.85),
    features: [
      "499 credits nạp ngay",
      "Giảm 15% vĩnh viễn khi top-up",
      "Giá top-up: 1.343đ / credit",
      "Toàn bộ mẫu ảo & bối cảnh",
      "Xử lý ưu tiên hàng đầu",
      "Hỗ trợ API & xuất hàng loạt",
    ],
    popular: false,
    cta: "Mua Gói Chuyên Nghiệp",
  },
];

const faqs = [
  {
    q: "Credit hoạt động như thế nào?",
    a: "Mỗi lần generate 1 ảnh người mẫu ảo từ 1 sản phẩm, hệ thống trừ 1 credit. Credits không có hạn sử dụng — mua rồi dùng thoải mái.",
  },
  {
    q: "Top-up pay-as-you-go là gì?",
    a: "Sau khi đăng ký, bạn có thể nạp thêm credits bất kỳ lúc nào với số lượng tùy ý (tối thiểu 10 credits). Giá mỗi credit phụ thuộc vào gói bạn đang giữ — gói cao hơn = giảm giá nhiều hơn vĩnh viễn.",
  },
  {
    q: "Tôi có phải trả phí hàng tháng không?",
    a: "Không. Các gói là mua một lần duy nhất. Bạn nhận credits + unlock tier giảm giá top-up vĩnh viễn. Không có phí ẩn hay gia hạn tự động.",
  },
  {
    q: "Discount top-up có bị mất không?",
    a: "Không. Một khi bạn mua gói, tier giảm giá top-up được kích hoạt vĩnh viễn trên tài khoản. Bạn có thể nâng lên gói cao hơn bất kỳ lúc nào để nhận discount tốt hơn.",
  },
  {
    q: "Có hỗ trợ xuất hóa đơn VAT không?",
    a: "Có. Chúng tôi hỗ trợ xuất hóa đơn điện tử VAT cho doanh nghiệp đăng ký kinh doanh tại Việt Nam.",
  },
];

function fmt(n: number) { return n.toLocaleString("vi-VN"); }

export default function PricingPage() {
  const [topupCredits, setTopupCredits] = useState(200);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden pt-16 pb-12 text-center">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 size-96 rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="mx-auto max-w-4xl px-6 relative z-10">
          <h1 className="font-serif text-4xl font-light tracking-tight text-foreground sm:text-5xl">
            Bảng giá <span className="font-normal italic text-primary">đơn giản, minh bạch</span>
          </h1>
          <p className="mt-4 text-base font-light text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Mua một lần, dùng vĩnh viễn. Nạp thêm credits bất kỳ lúc nào — gói càng cao, giá top-up càng rẻ.
          </p>

          {/* Top-up base rate callout */}
          <div className="mt-8 inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-5 py-3">
            <Coins className="size-4 text-primary" />
            <span className="text-sm text-muted-foreground">Giá top-up không gói:</span>
            <span className="text-sm font-bold text-foreground tabular-nums">{fmt(BASE_RATE)}đ / credit</span>
          </div>
        </div>
      </section>

      {/* Package Cards */}
      <section className="pb-16 relative z-10">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {PACKAGES.map((pkg, idx) => (
              <div
                key={idx}
                className={`relative rounded-2xl p-8 flex flex-col transition-all duration-300 ${
                  pkg.popular
                    ? "border-2 border-primary bg-primary/[0.02] shadow-[0_0_30px_rgba(var(--color-primary),0.08)] scale-105 z-10 bg-background"
                    : "border border-border/80 bg-card hover:border-border hover:shadow-sm"
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[9px] font-bold text-primary-foreground uppercase tracking-wider">
                    Phổ biến nhất
                  </div>
                )}

                {/* Plan badge */}
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${pkg.planBg} ${pkg.planColor}`}>
                    {pkg.planLabel}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-foreground">{pkg.name}</h3>
                <p className="text-xs font-light text-muted-foreground/60 mt-1">Mua một lần · Credits không hết hạn</p>

                <div className="mt-6 flex items-baseline gap-1 border-b border-border/40 pb-6">
                  <span className="text-3xl font-serif font-semibold text-foreground">{fmt(pkg.price)}đ</span>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="text-sm font-semibold text-primary">{pkg.credits} Credits</div>

                  {/* Top-up discount badge */}
                  <div className="flex items-center gap-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
                    <TrendingDown className="size-3 text-emerald-500 shrink-0" />
                    <span className="text-xs text-emerald-500 font-semibold">
                      Giảm {pkg.topupDiscount}% top-up vĩnh viễn → {fmt(pkg.topupRate)}đ/credit
                    </span>
                  </div>

                  <ul className="space-y-3 mt-2">
                    {pkg.features.map((f, fi) => (
                      <li key={fi} className="flex items-start gap-2.5 text-xs font-light text-muted-foreground">
                        <Check className="size-4 shrink-0 text-primary mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <Link href="/register">
                    <Button
                      className={`w-full py-5 text-xs font-semibold rounded-xl transition-all ${
                        pkg.popular
                          ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--color-primary),0.15)] hover:bg-primary/90"
                          : "bg-secondary text-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {pkg.cta}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Free tier note */}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Chưa chắc? <Link href="/register" className="text-primary hover:underline font-medium">Đăng ký miễn phí</Link> và top-up khi cần với giá {fmt(BASE_RATE)}đ / credit — không yêu cầu gói.
          </p>
        </div>
      </section>

      {/* Top-up comparison table */}
      <section className="py-16 border-t border-border/40 bg-secondary/15">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[10px] text-primary uppercase font-mono tracking-wider mb-4">
              Top-up Pay-as-you-go
            </div>
            <h2 className="font-serif text-3xl font-light text-foreground">
              Nạp thêm credits <span className="font-normal italic text-primary">bất kỳ lúc nào</span>
            </h2>
            <p className="mt-3 text-sm font-light text-muted-foreground max-w-xl mx-auto">
              Sau khi mua gói, bạn được giảm giá vĩnh viễn trên mỗi credit nạp thêm. Không giới hạn số lần top-up.
            </p>
          </div>

          {/* Rate comparison */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden mb-10">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30">
                    <th className="text-left px-6 py-4 text-muted-foreground font-medium text-xs">Tài khoản</th>
                    <th className="text-center px-4 py-4 text-muted-foreground font-medium text-xs">Giảm giá top-up</th>
                    <th className="text-center px-4 py-4 text-muted-foreground font-medium text-xs">Giá / credit</th>
                    <th className="text-center px-4 py-4 text-muted-foreground font-medium text-xs">100 credits</th>
                    <th className="text-center px-4 py-4 text-muted-foreground font-medium text-xs">500 credits</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "Free", badge: null, disc: 0, rate: BASE_RATE },
                    { label: "Starter", badge: { label: "Basic", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" }, disc: 5, rate: Math.round(BASE_RATE * 0.95) },
                    { label: "Gói Cơ Bản", badge: { label: "Pro", color: "text-violet-400", bg: "bg-violet-400/10 border-violet-400/20" }, disc: 10, rate: Math.round(BASE_RATE * 0.90) },
                    { label: "Gói Chuyên Nghiệp", badge: { label: "Agency", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20" }, disc: 15, rate: Math.round(BASE_RATE * 0.85) },
                  ].map((row, i) => (
                    <tr key={i} className={`border-b border-border/40 last:border-0 ${i === 2 ? "bg-primary/[0.02]" : "hover:bg-muted/20"} transition-colors`}>
                      <td className="px-6 py-4 font-semibold text-foreground text-sm flex items-center gap-2">
                        {row.badge && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${row.badge.bg} ${row.badge.color}`}>
                            {row.badge.label}
                          </span>
                        )}
                        {row.label}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {row.disc > 0 ? (
                          <span className="inline-flex items-center gap-0.5 text-emerald-500 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full text-xs">
                            <TrendingDown className="size-3" />
                            -{row.disc}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>
                      <td className={`px-4 py-4 text-center tabular-nums font-semibold text-sm ${i === 2 ? "text-primary" : "text-foreground"}`}>
                        {fmt(row.rate)}đ
                      </td>
                      <td className="px-4 py-4 text-center tabular-nums text-xs text-muted-foreground">
                        {fmt(row.rate * 100)}đ
                      </td>
                      <td className="px-4 py-4 text-center tabular-nums text-xs text-muted-foreground">
                        {fmt(row.rate * 500)}đ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Savings calculator */}
          <div className="bg-card border border-border/60 rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="size-4 text-primary" />
              <h3 className="text-base font-bold text-foreground">Tính tiết kiệm khi top-up</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-6">Nhập số credits bạn cần top-up mỗi tháng để xem mức tiết kiệm theo từng gói.</p>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="font-light text-muted-foreground">Credits top-up / tháng:</span>
                <span className="font-mono font-bold text-foreground">{topupCredits} credits</span>
              </div>
              <input
                type="range" min="50" max="2000" step="50"
                value={topupCredits}
                onChange={e => setTopupCredits(parseInt(e.target.value))}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
              />
              <div className="flex justify-between text-[10px] font-mono text-muted-foreground/50">
                <span>50</span><span>500</span><span>1,000</span><span>2,000</span>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {PACKAGES.map((pkg, i) => {
                const saving = (BASE_RATE - pkg.topupRate) * topupCredits;
                return (
                  <div key={i} className={`rounded-xl border p-4 ${i === 1 ? "border-primary/30 bg-primary/[0.03]" : "border-border bg-secondary/30"}`}>
                    <div className={`text-[10px] font-bold mb-1 ${pkg.planColor}`}>{pkg.planLabel}</div>
                    <div className="text-sm font-semibold text-foreground mb-0.5">{pkg.name}</div>
                    <div className="text-xs text-muted-foreground">{fmt(pkg.topupRate)}đ / credit</div>
                    <div className="mt-3 pt-3 border-t border-border/40">
                      <div className="text-xs text-muted-foreground">Tổng top-up / tháng</div>
                      <div className="text-base font-bold text-foreground tabular-nums">{fmt(pkg.topupRate * topupCredits)}đ</div>
                      {saving > 0 && (
                        <div className="text-xs text-emerald-500 font-semibold mt-0.5">
                          Tiết kiệm {fmt(saving)}đ/tháng
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 text-center">
              <Link href="/register">
                <Button className="rounded-xl bg-primary text-xs font-semibold px-6 py-4 hover:bg-primary/95 shadow-[0_0_15px_rgba(var(--color-primary),0.15)]">
                  Đăng ký & chọn gói ngay <ArrowRight className="size-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 border-t border-border/40 bg-background">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl font-light text-foreground">
              Câu hỏi <span className="font-normal italic text-primary">thường gặp</span>
            </h2>
            <p className="mt-3 text-sm font-light text-muted-foreground">
              Giải đáp nhanh về credits và thanh toán.
            </p>
          </div>
          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="rounded-xl border border-border bg-card/45 p-6 hover:border-border transition-colors shadow-sm">
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
