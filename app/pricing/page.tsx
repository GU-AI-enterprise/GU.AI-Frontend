"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Coins, Sparkles, Crown, Loader2, CheckCircle2,
  TrendingDown, ShoppingBag, BadgePercent, HelpCircle, ArrowRight, Zap,
} from "lucide-react";
import Header from "@/components/shared/header";
import { supabase } from "@/lib/supabase";
import {
  getPackages, createPaymentLink, getTopupInfo,
  type CreditPackage, type TopupInfo,
} from "@/features/payment/paymentService";
import { daysRemaining } from "@/features/credit/planMeta";

const TOPUP_BASE_RATE = 1580;
const PKG_ICONS = [ShoppingBag, Sparkles, Crown];

type PlanType = 'free' | 'basic' | 'pro';

const PLAN_META: Record<PlanType, { label: string; color: string; bg: string }> = {
  free:   { label: 'Free',   color: 'text-slate-400',   bg: 'bg-slate-400/10 border border-slate-400/20' },
  basic:  { label: 'Basic',  color: 'text-blue-400',    bg: 'bg-blue-400/10 border border-blue-400/20' },
  pro:    { label: 'Pro',    color: 'text-violet-400',  bg: 'bg-violet-400/10 border border-violet-400/20' },
};

const faqs = [
  {
    q: "Credit hoạt động như thế nào?",
    a: "Mỗi lần generate 1 ảnh người mẫu ảo từ 1 sản phẩm, hệ thống trừ 1 credit. Credits không có hạn sử dụng — mua rồi dùng thoải mái.",
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

function fmt(n: number) { return n.toLocaleString("vi-VN"); }

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
  const sorted = [...packages].filter(p => p.grants_plan_type !== 'free').sort((a, b) => a.sort_order - b.sort_order);
  const popularIdx = sorted.length >= 2 ? 1 : -1;
  const planType: PlanType = (topupInfo?.plan_type as PlanType) ?? 'free';
  const planMeta = PLAN_META[planType];
  const planDaysLeft = planType !== 'free' ? daysRemaining(topupInfo?.plan_expires_at ?? null) : null;
  const discountPct = topupInfo?.discount_pct ?? 0;

  // Static packages for guests (mirrors DB data)
  const staticPackages = [
    { id: 's1', name: "Starter",            price: 261000,  credits: 100, planLabel: "Basic",  planColor: "text-blue-400",   planBg: "bg-blue-400/10 border-blue-400/20",   topupDiscount: 5,  popular: false },
    { id: 's2', name: "Gói Cơ Bản",         price: 489000,  credits: 199, planLabel: "Pro",    planColor: "text-violet-400", planBg: "bg-violet-400/10 border-violet-400/20", topupDiscount: 10, popular: true  },
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
          {pkgLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : loggedIn && sorted.length > 0 ? (
            /* ── Logged-in: real packages from API ── */
            <>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {sorted.map((pkg, idx) => {
                  const Icon         = PKG_ICONS[idx % PKG_ICONS.length];
                  const isPopular    = idx === popularIdx;
                  const isBuying     = buying === pkg.id;
                  const totalCr      = pkg.credit_amount + (pkg.bonus_credit ?? 0);
                  const grantsPlan   = pkg.grants_plan_type as PlanType | null | undefined;
                  const grantMeta    = grantsPlan ? PLAN_META[grantsPlan] : null;
                  const isCurrentPlan = grantsPlan === planType;
                  const isFreePkg    = grantsPlan === 'free' || Number(pkg.price) <= 0;
                  const planDiscounts: Record<string, number> = { basic: 5, pro: 10 };
                  const unlockDiscount = grantsPlan ? (planDiscounts[grantsPlan] ?? 0) : 0;

                  return (
                    <div
                      key={pkg.id}
                      className={`relative flex flex-col rounded-2xl border-2 p-6 transition-all duration-200 ${
                        isCurrentPlan
                          ? "border-emerald-500/50 bg-emerald-500/[0.02]"
                          : isPopular
                            ? "border-primary bg-primary/[0.02] shadow-[0_0_28px_rgba(var(--color-primary),0.10)] scale-[1.02] z-10"
                            : "border-border hover:border-primary/40"
                      }`}
                    >
                      {isCurrentPlan && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-3 py-0.5 text-[9px] font-bold text-white uppercase tracking-widest whitespace-nowrap">
                          Gói hiện tại
                        </div>
                      )}
                      {!isCurrentPlan && isPopular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-[9px] font-bold text-primary-foreground uppercase tracking-widest whitespace-nowrap">
                          Phổ biến
                        </div>
                      )}

                      <div className="flex items-center gap-2.5 mb-4">
                        <div className={`flex items-center justify-center size-9 rounded-xl ${isPopular ? "bg-primary/15" : "bg-secondary"}`}>
                          <Icon className={`size-4 ${isPopular ? "text-primary" : "text-muted-foreground"}`} />
                        </div>
                        <div>
                          <span className="font-bold text-sm text-foreground block">{pkg.name}</span>
                          {grantMeta && (
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${grantMeta.bg} ${grantMeta.color}`}>
                              {grantMeta.label}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mb-1 flex items-baseline gap-1.5">
                        <span className="text-3xl font-bold text-foreground tabular-nums">{totalCr.toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground">credits</span>
                      </div>
                      {pkg.bonus_credit > 0 && (
                        <p className="text-xs text-emerald-500 font-medium mb-2">+{pkg.bonus_credit} bonus credits</p>
                      )}

                      {unlockDiscount > 0 && (
                        <div className="flex items-center gap-1.5 mt-2 mb-4">
                          <span className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full ${isPopular ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}>
                            <TrendingDown className="size-3" />
                            Giảm {unlockDiscount}% top-up vĩnh viễn
                          </span>
                        </div>
                      )}

                      <ul className="space-y-2 mb-5 flex-1">
                        <li className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                          {totalCr} credits cộng ngay
                        </li>
                        {unlockDiscount > 0 && (
                          <li className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                            Top-up giảm {unlockDiscount}% ({fmt(Math.round(TOPUP_BASE_RATE * (1 - unlockDiscount / 100)))}đ/credit)
                          </li>
                        )}
                        <li className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                          {isFreePkg ? "Không cần thanh toán" : "Thanh toán an toàn qua PayOS"}
                        </li>
                      </ul>

                      <div className="mt-auto">
                        <div className="mb-3">
                          <span className="text-2xl font-bold text-foreground tabular-nums">{Number(pkg.price).toLocaleString('vi-VN')}đ</span>
                          {!isFreePkg && <span className="text-xs text-muted-foreground ml-1">/ lần mua</span>}
                        </div>
                        {isFreePkg ? (
                          <div className="w-full flex items-center justify-center rounded-xl py-2.5 text-xs font-semibold bg-secondary/60 text-muted-foreground">
                            {isCurrentPlan ? "Gói đang dùng" : "Gói mặc định"}
                          </div>
                        ) : (
                          <button
                            onClick={() => handleBuy(pkg)}
                            disabled={!!buying}
                            className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                              isCurrentPlan
                                ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30"
                                : isPopular
                                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_12px_rgba(var(--color-primary),0.2)]"
                                  : "bg-secondary text-foreground hover:bg-secondary/70"
                            }`}
                          >
                            {isBuying ? (
                              <><Loader2 className="size-3.5 animate-spin" /><span>Đang xử lý...</span></>
                            ) : (
                              <span>{isCurrentPlan ? "Gia hạn / nâng cấp" : "Mua ngay"}</span>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Comparison table (logged-in) */}
              <div className="rounded-2xl border border-border bg-card overflow-hidden mb-6">
                <div className="px-5 py-4 border-b border-border/60">
                  <h3 className="text-sm font-semibold text-foreground">So sánh gói & giá top-up</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border/60 bg-muted/30">
                        <th className="text-left px-5 py-3 text-muted-foreground font-medium">Gói</th>
                        <th className="text-center px-4 py-3 text-muted-foreground font-medium">Credits gói</th>
                        <th className="text-center px-4 py-3 text-muted-foreground font-medium">Giá gói</th>
                        <th className="text-center px-4 py-3 text-muted-foreground font-medium">Giảm top-up</th>
                        <th className="text-center px-4 py-3 text-muted-foreground font-medium">Giá / credit top-up</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.map((pkg, idx) => {
                        const grantsPlan = pkg.grants_plan_type as PlanType | undefined;
                        const meta = grantsPlan ? PLAN_META[grantsPlan] : null;
                        const planDiscounts: Record<string, number> = { basic: 5, pro: 10 };
                        const disc = grantsPlan ? (planDiscounts[grantsPlan] ?? 0) : 0;
                        const rate = Math.round(TOPUP_BASE_RATE * (1 - disc / 100));
                        const isPopular = idx === popularIdx;
                        const isCurrent = grantsPlan === planType;
                        const totalCr = pkg.credit_amount + (pkg.bonus_credit ?? 0);
                        return (
                          <tr key={pkg.id} className={`border-b border-border/40 last:border-0 transition-colors ${isCurrent ? "bg-emerald-500/[0.03]" : isPopular ? "bg-primary/[0.03]" : "hover:bg-muted/20"}`}>
                            <td className="px-5 py-3.5 font-semibold text-foreground">
                              <div className="flex items-center gap-2">
                                {meta && <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>{meta.label}</span>}
                                {pkg.name}
                                {isCurrent && <span className="text-[9px] font-bold bg-emerald-500/15 text-emerald-500 px-1.5 py-0.5 rounded-full uppercase">Hiện tại</span>}
                                {!isCurrent && isPopular && <span className="text-[9px] font-bold bg-primary/15 text-primary px-1.5 py-0.5 rounded-full uppercase">Phổ biến</span>}
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-center tabular-nums text-foreground font-medium">{totalCr.toLocaleString()}</td>
                            <td className="px-4 py-3.5 text-center tabular-nums text-foreground font-medium">{Number(pkg.price).toLocaleString('vi-VN')}đ</td>
                            <td className="px-4 py-3.5 text-center">
                              {disc > 0 && (
                                <span className="inline-flex items-center gap-0.5 text-emerald-500 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                                  <TrendingDown className="size-2.5" />-{disc}%
                                </span>
                              )}
                            </td>
                            <td className={`px-4 py-3.5 text-center tabular-nums font-semibold ${isPopular ? "text-primary" : "text-foreground"}`}>
                              {fmt(rate)}đ
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
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
                    <p className="text-xs font-light text-muted-foreground/60 mt-1">Mua một lần · Credits không hết hạn</p>
                    <div className="mt-6 flex items-baseline gap-1 border-b border-border/40 pb-6">
                      <span className="text-3xl font-serif font-semibold text-foreground">{fmt(pkg.price)}đ</span>
                    </div>
                    <div className="mt-5 space-y-3 flex-1">
                      <div className="text-sm font-semibold text-primary">{pkg.credits} Credits</div>
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
