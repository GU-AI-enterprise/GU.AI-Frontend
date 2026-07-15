"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Coins, Loader2, CheckCircle2,
  TrendingDown, BadgePercent, HelpCircle, ArrowRight, Zap,
} from "lucide-react";
import Header from "@/components/shared/header";
import { supabase } from "@/lib/supabase";
import {
  getPackages, createPaymentLink, getTopupInfo,
  type CreditPackage, type TopupInfo,
} from "@/features/payment/paymentService";
import {
  PackageCards, PackageComparisonTable, NoRolloverNote,
  PLAN_META, TOPUP_BASE_RATE, fmt, type PlanType,
} from "@/features/payment/PackageCards";
import { daysRemaining } from "@/features/credit/planMeta";

const faqs = [
  {
    q: "Credit hoạt động như thế nào?",
    a: "Mỗi lần generate ảnh/video, hệ thống trừ credit theo công cụ sử dụng. Credits nhận từ gói có hiệu lực trong chu kỳ 30 ngày của gói — credits chưa dùng hết sẽ KHÔNG được chuyển tiếp qua tháng tiếp theo.",
  },
  {
    q: "Các gói khác nhau được dùng những gì?",
    a: "Free mở khóa 4 người mẫu AI. Basic mở khóa 9 người mẫu AI và Trợ lý AI Studio (chat + gợi ý prompt). Pro mở khóa toàn bộ người mẫu AI và Trợ lý AI Studio, kèm mức giảm giá top-up cao nhất.",
  },
  {
    q: "Top-up pay-as-you-go là gì?",
    a: "Sau khi đăng ký, bạn có thể nạp thêm credits bất kỳ lúc nào với số lượng tùy ý (tối thiểu 10 credits). Giá mỗi credit phụ thuộc vào gói bạn đang giữ — gói cao hơn = giảm giá nhiều hơn.",
  },
  {
    q: "Tôi có phải trả phí hàng tháng không?",
    a: "Không tự động trừ tiền hàng tháng. Mỗi gói có hiệu lực 30 ngày từ lúc mua/gia hạn — hết hạn bạn chỉ cần mua lại để tiếp tục nhận ưu đãi, không có phí ẩn hay tự động trừ tiền nếu bạn không chủ động mua.",
  },
  {
    q: "Discount top-up có bị mất không?",
    a: "Discount top-up gắn với gói đang hoạt động trong 30 ngày. Gia hạn trước khi hết hạn để không bị mất ưu đãi — gia hạn sớm sẽ được cộng thêm ngày vào hạn hiện tại, không mất ngày còn lại.",
  },
  {
    q: "Có hỗ trợ xuất hóa đơn VAT không?",
    a: "Có. Chúng tôi hỗ trợ xuất hóa đơn điện tử VAT cho doanh nghiệp đăng ký kinh doanh tại Việt Nam.",
  },
];

export default function PricingPage() {
  const [loggedIn, setLoggedIn]     = useState(false);
  const [packages, setPackages]     = useState<CreditPackage[]>([]);
  const [pkgLoading, setPkgLoading] = useState(true);
  const [topupInfo, setTopupInfo]   = useState<TopupInfo | null>(null);
  const [buying, setBuying]         = useState<string | null>(null);
  const [error, setError]           = useState<string | null>(null);
  const [topupCredits, setTopupCredits] = useState(200);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setLoggedIn(true);
        getTopupInfo().then(setTopupInfo).catch(() => {});
        getPackages()
          .then(setPackages)
          .catch(() => setError("Không thể tải gói credits"))
          .finally(() => setPkgLoading(false));
      } else {
        // Static fallback for guests
        setPkgLoading(false);
      }
    });
  }, []);

  const handleBuy = async (pkg: CreditPackage) => {
    if (!loggedIn) { window.location.href = "/register"; return; }
    setError(null);
    setBuying(pkg.id);
    try {
      const result = await createPaymentLink(pkg.id);
      window.location.href = result.checkoutUrl;
    } catch (e: any) {
      setError(e.message || "Có lỗi xảy ra khi tạo link thanh toán");
      setBuying(null);
    }
  };

  // Gói Free (price 0, grants_plan_type "free") chỉ dùng để hiển thị baseline trong bảng so sánh —
  // không cho mua qua PayOS vì không có gì để thanh toán.
  const sorted = [...packages].sort((a, b) => a.sort_order - b.sort_order);
  const planType: PlanType = (topupInfo?.plan_type as PlanType) ?? 'free';
  const planMeta = PLAN_META[planType];
  const planDaysLeft = planType !== 'free' ? daysRemaining(topupInfo?.plan_expires_at ?? null) : null;
  const discountPct = topupInfo?.discount_pct ?? 0;

  // Static packages for guests (mirrors DB data — kể cả description perks)
  const staticPackages = [
    { id: 's0', name: "Dùng Thử",           price: 0,       credits: 20,  planLabel: "Free",   planColor: "text-slate-400",  planBg: "bg-slate-400/10 border-slate-400/20", topupDiscount: 0,  popular: false, perks: ["Mở khóa 4 người mẫu AI"] },
    { id: 's1', name: "Starter",            price: 199000,  credits: 100, planLabel: "Basic",  planColor: "text-blue-400",   planBg: "bg-blue-400/10 border-blue-400/20",   topupDiscount: 5,  popular: false, perks: ["Mở khóa 9 người mẫu AI", "Trợ lý AI Studio (chat + gợi ý prompt)"] },
    { id: 's2', name: "Gói Cơ Bản",         price: 349000,  credits: 200, planLabel: "Pro",    planColor: "text-violet-400", planBg: "bg-violet-400/10 border-violet-400/20", topupDiscount: 10, popular: true,  perks: ["Mở khóa toàn bộ người mẫu AI", "Trợ lý AI Studio (chat + gợi ý prompt)"] },
  ];

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
            Mỗi gói có hiệu lực 30 ngày. Nạp thêm credits bất kỳ lúc nào — gói càng cao, giá top-up càng rẻ.
          </p>
          <div className="mt-8 inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-5 py-3">
            <Coins className="size-4 text-primary" />
            <span className="text-sm text-muted-foreground">Giá top-up không gói:</span>
            <span className="text-sm font-bold text-foreground tabular-nums">{fmt(TOPUP_BASE_RATE)}đ / credit</span>
          </div>
        </div>
      </section>

      {/* Current plan (logged-in only) */}
      {loggedIn && (
        <div className="max-w-5xl mx-auto px-6 lg:px-8 w-full mb-2">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 w-fit">
            <div className="flex items-center justify-center size-9 rounded-xl bg-secondary">
              <BadgePercent className="size-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Gói hiện tại của bạn</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${planMeta.bg} ${planMeta.color}`}>
                  {planMeta.label}
                </span>
                {discountPct > 0 && (
                  <span className="text-xs text-emerald-500 font-semibold">-{discountPct}% top-up</span>
                )}
              </div>
              {planDaysLeft !== null ? (
                <a href="#packages" className="mt-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                  Còn <span className="font-semibold tabular-nums">{planDaysLeft}</span> ngày · <span className="underline">Gia hạn ngay</span>
                </a>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">Chưa đăng ký gói nào</p>
              )}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-5xl mx-auto px-6 lg:px-8 w-full mb-4">
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</div>
        </div>
      )}

      {/* Package Cards */}
      <section id="packages" className="pb-16 relative z-10 scroll-mt-6">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <NoRolloverNote className="mb-6" />
          {pkgLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : loggedIn && sorted.length > 0 ? (
            /* ── Logged-in: real packages from API ── */
            <>
              <PackageCards
                packages={sorted}
                planType={planType}
                buyingId={buying}
                onBuy={handleBuy}
              />

              {/* Comparison table (logged-in) */}
              <div className="mt-8 mb-6">
                <PackageComparisonTable packages={sorted} planType={planType} />
              </div>
            </>
          ) : (
            /* ── Guest: static display + redirect to register on buy ── */
            <>
              <div className="grid md:grid-cols-3 gap-8 mb-8">
                {staticPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`relative rounded-2xl p-8 flex flex-col transition-all duration-300 ${
                      pkg.popular
                        ? "border-2 border-primary bg-primary/[0.02] shadow-[0_0_30px_rgba(var(--color-primary),0.08)] scale-105 z-10"
                        : "border border-border/80 bg-card hover:border-border hover:shadow-sm"
                    }`}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[9px] font-bold text-primary-foreground uppercase tracking-wider">
                        Phổ biến nhất
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${pkg.planBg} ${pkg.planColor}`}>
                        {pkg.planLabel}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{pkg.name}</h3>
                    <p className="text-xs font-light text-muted-foreground/60 mt-1">
                      {pkg.price === 0 ? "Miễn phí · Credits tặng khi đăng ký" : "Mua một lần · Hiệu lực 30 ngày, credits không chuyển tiếp"}
                    </p>
                    <div className="mt-6 flex items-baseline gap-1 border-b border-border/40 pb-6">
                      <span className="text-3xl font-serif font-semibold text-foreground">{fmt(pkg.price)}đ</span>
                    </div>
                    <div className="mt-5 space-y-3 flex-1">
                      <div className="text-sm font-semibold text-primary">{pkg.credits} Credits</div>
                      <ul className="space-y-2">
                        {pkg.perks.map((perk) => (
                          <li key={perk} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                            {perk}
                          </li>
                        ))}
                      </ul>
                      <div className="flex items-center gap-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
                        <TrendingDown className="size-3 text-emerald-500 shrink-0" />
                        <span className="text-xs text-emerald-500 font-semibold">
                          Giảm {pkg.topupDiscount}% top-up vĩnh viễn → {fmt(Math.round(TOPUP_BASE_RATE * (1 - pkg.topupDiscount / 100)))}đ/credit
                        </span>
                      </div>
                    </div>
                    <div className="mt-8">
                      <Link href="/register">
                        <button className={`w-full py-2.5 text-xs font-semibold rounded-xl transition-all ${
                          pkg.popular
                            ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(var(--color-primary),0.15)]"
                            : "bg-secondary text-foreground hover:bg-secondary/80"
                        }`}>
                          Đăng ký để mua
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Rate comparison table (guest) */}
              <div className="rounded-2xl border border-border bg-card overflow-hidden mb-6">
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
                        { label: "Free",              badge: null,                                                                                       disc: 0,  rate: TOPUP_BASE_RATE },
                        { label: "Starter",           badge: { label: "Basic",  color: "text-blue-400",   bg: "bg-blue-400/10 border-blue-400/20"   }, disc: 5,  rate: Math.round(TOPUP_BASE_RATE * 0.95) },
                        { label: "Gói Cơ Bản",        badge: { label: "Pro",    color: "text-violet-400", bg: "bg-violet-400/10 border-violet-400/20" }, disc: 10, rate: Math.round(TOPUP_BASE_RATE * 0.90) },
                      ].map((row, i) => (
                        <tr key={i} className={`border-b border-border/40 last:border-0 ${i === 2 ? "bg-primary/[0.02]" : "hover:bg-muted/20"} transition-colors`}>
                          <td className="px-6 py-4 font-semibold text-foreground text-sm">
                            <div className="flex items-center gap-2">
                              {row.badge && (
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${row.badge.bg} ${row.badge.color}`}>
                                  {row.badge.label}
                                </span>
                              )}
                              {row.label}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            {row.disc > 0 ? (
                              <span className="inline-flex items-center gap-0.5 text-emerald-500 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full text-xs">
                                <TrendingDown className="size-3" />-{row.disc}%
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </td>
                          <td className={`px-4 py-4 text-center tabular-nums font-semibold text-sm ${i === 2 ? "text-primary" : "text-foreground"}`}>
                            {fmt(row.rate)}đ
                          </td>
                          <td className="px-4 py-4 text-center tabular-nums text-xs text-muted-foreground">{fmt(row.rate * 100)}đ</td>
                          <td className="px-4 py-4 text-center tabular-nums text-xs text-muted-foreground">{fmt(row.rate * 500)}đ</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <p className="text-center text-xs text-muted-foreground mb-6">
                Chưa có tài khoản?{" "}
                <Link href="/register" className="text-primary hover:underline font-medium">Đăng ký miễn phí</Link>
                {" "}và top-up khi cần với giá {fmt(TOPUP_BASE_RATE)}đ / credit.
              </p>
            </>
          )}
        </div>
      </section>

      {/* Savings calculator */}
      <section className="py-16 border-t border-border/40 bg-secondary/15">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[10px] text-primary uppercase font-mono tracking-wider mb-4">
              Top-up Pay-as-you-go
            </div>
            <h2 className="font-serif text-3xl font-light text-foreground">
              Nạp thêm credits <span className="font-normal italic text-primary">bất kỳ lúc nào</span>
            </h2>
          </div>

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
              {staticPackages.map((pkg, i) => {
                const rate = Math.round(TOPUP_BASE_RATE * (1 - pkg.topupDiscount / 100));
                const saving = (TOPUP_BASE_RATE - rate) * topupCredits;
                return (
                  <div key={i} className={`rounded-xl border p-4 ${i === 1 ? "border-primary/30 bg-primary/[0.03]" : "border-border bg-secondary/30"}`}>
                    <div className={`text-[10px] font-bold mb-1 ${pkg.planColor}`}>{pkg.planLabel}</div>
                    <div className="text-sm font-semibold text-foreground mb-0.5">{pkg.name}</div>
                    <div className="text-xs text-muted-foreground">{fmt(rate)}đ / credit</div>
                    <div className="mt-3 pt-3 border-t border-border/40">
                      <div className="text-xs text-muted-foreground">Tổng top-up / tháng</div>
                      <div className="text-base font-bold text-foreground tabular-nums">{fmt(rate * topupCredits)}đ</div>
                      {saving > 0 && (
                        <div className="text-xs text-emerald-500 font-semibold mt-0.5">Tiết kiệm {fmt(saving)}đ/tháng</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 text-center">
              <Link href={loggedIn ? "/topup" : "/register"}>
                <button className="rounded-xl bg-primary text-primary-foreground text-xs font-semibold px-6 py-3 hover:bg-primary/95 shadow-[0_0_15px_rgba(var(--color-primary),0.15)] inline-flex items-center gap-1.5">
                  {loggedIn ? "Nạp credits ngay" : "Đăng ký & chọn gói ngay"}
                  <ArrowRight className="size-3.5" />
                </button>
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
          </div>
          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="rounded-xl border border-border bg-card/45 p-6 shadow-sm">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <HelpCircle className="size-4 shrink-0 text-primary" />
                  {faq.q}
                </h4>
                <p className="mt-3 text-xs font-light text-muted-foreground leading-relaxed pl-6">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="mt-auto border-t border-border/40 bg-background py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between text-xs font-light text-muted-foreground gap-4">
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
