"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Coins, Sparkles, Crown, Loader2, CheckCircle2,
  TrendingDown, ShoppingBag, BadgePercent, Plus, Minus,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAppSelector } from "@/store/hooks";
import { selectCreditBalance } from "@/features/credit/creditSlice";
import {
  getPackages, createPaymentLink, getTopupInfo, createTopupPayment,
  type CreditPackage, type TopupInfo,
} from "@/features/payment/paymentService";
import GuaiLoader from "@/components/shared/guai-loader";

const TOPUP_BASE_RATE = 1580;
const PKG_ICONS = [ShoppingBag, Sparkles, Crown];
const PRESETS = [50, 100, 200, 500];
const MIN_CREDITS = 10;
const MAX_CREDITS = 5000;

type PlanType = 'free' | 'basic' | 'pro' | 'agency';

const PLAN_META: Record<PlanType, { label: string; color: string; bg: string }> = {
  free:   { label: 'Free',   color: 'text-slate-400',     bg: 'bg-slate-400/10 border border-slate-400/20' },
  basic:  { label: 'Basic',  color: 'text-blue-400',      bg: 'bg-blue-400/10 border border-blue-400/20' },
  pro:    { label: 'Pro',    color: 'text-violet-400',    bg: 'bg-violet-400/10 border border-violet-400/20' },
  agency: { label: 'Agency', color: 'text-amber-400',     bg: 'bg-amber-400/10 border border-amber-400/20' },
};

function perCredit(pkg: CreditPackage) {
  const total = pkg.credit_amount + (pkg.bonus_credit ?? 0);
  return total > 0 ? Math.round(pkg.price / total) : 0;
}

function fmt(n: number) { return n.toLocaleString('vi-VN'); }

export default function TopupPage() {
  const router = useRouter();
  const credit = useAppSelector(selectCreditBalance);

  const [authLoading, setAuthLoading] = useState(true);
  const [packages, setPackages]       = useState<CreditPackage[]>([]);
  const [pkgLoading, setPkgLoading]   = useState(true);
  const [buying, setBuying]           = useState<string | null>(null);
  const [error, setError]             = useState<string | null>(null);

  const [topupInfo, setTopupInfo]         = useState<TopupInfo | null>(null);
  const [topupLoading, setTopupLoading]   = useState(true);
  const [creditAmount, setCreditAmount]   = useState<number>(100);
  const [topupping, setTopupping]         = useState(false);

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!alive) return;
      if (!session) { router.push("/login"); return; }
      setAuthLoading(false);
    });
    return () => { alive = false; };
  }, [router]);

  useEffect(() => {
    if (authLoading) return;
    getPackages()
      .then(pkgs => setPackages(pkgs))
      .catch(() => setError("Không thể tải gói credits"))
      .finally(() => setPkgLoading(false));
    getTopupInfo()
      .then(setTopupInfo)
      .catch(() => {})
      .finally(() => setTopupLoading(false));
  }, [authLoading]);

  const handleBuy = async (pkg: CreditPackage) => {
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

  const handleTopup = async () => {
    if (creditAmount < MIN_CREDITS || creditAmount > MAX_CREDITS) return;
    setError(null);
    setTopupping(true);
    try {
      const result = await createTopupPayment(creditAmount);
      window.location.href = result.checkoutUrl;
    } catch (e: any) {
      setError(e.message || "Có lỗi xảy ra khi tạo link thanh toán top-up");
      setTopupping(false);
    }
  };

  const adjustAmount = useCallback((delta: number) => {
    setCreditAmount(v => Math.min(MAX_CREDITS, Math.max(MIN_CREDITS, v + delta)));
  }, []);

  if (authLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <GuaiLoader size="lg" />
      </div>
    );
  }

  const sorted = [...packages].sort((a, b) => a.sort_order - b.sort_order);
  const popularIdx = sorted.length >= 3 ? 1 : -1;
  const planType: PlanType = (topupInfo?.plan_type as PlanType) ?? 'free';
  const planMeta = PLAN_META[planType];
  const discountPct = topupInfo?.discount_pct ?? 0;
  const ratePerCredit = topupInfo?.rate ?? TOPUP_BASE_RATE;
  const totalPrice = ratePerCredit * creditAmount;
  const basePrice  = TOPUP_BASE_RATE * creditAmount;
  const savings    = basePrice - totalPrice;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 sm:px-6">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-widest mb-2">
          <Coins className="size-4" />
          Nạp Credits
        </div>
        <h1 className="text-2xl font-bold text-foreground">Quản lý credits</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Nạp credits để tạo ảnh & video AI. Mua gói để nhận ưu đãi mỗi lần top-up.
        </p>
      </div>

      {/* Balance + Plan badge row */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        {credit !== null && (
          <div className="flex items-center gap-3 flex-1 rounded-2xl border border-border bg-card px-5 py-4">
            <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10">
              <Coins className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Số dư hiện tại</p>
              <p className="text-xl font-bold text-foreground tabular-nums">{fmt(credit)} credits</p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4">
          <div className="flex items-center justify-center size-10 rounded-xl bg-secondary">
            <BadgePercent className="size-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Gói hiện tại</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${planMeta.bg} ${planMeta.color}`}>
                {planMeta.label}
              </span>
              {discountPct > 0 && (
                <span className="text-xs text-emerald-500 font-semibold">
                  -{discountPct}% top-up
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      {/* ─── Top-up Section ─── */}
      <div className="rounded-2xl border border-border bg-card p-6 mb-10">
        <div className="flex items-center gap-2 mb-1">
          <Coins className="size-4 text-primary" />
          <h2 className="text-base font-bold text-foreground">Nạp credits</h2>
        </div>
        <p className="text-xs text-muted-foreground mb-6">
          Nhập số lượng credits bạn muốn nạp. Giá tính theo gói đang đăng ký.
        </p>

        {/* Rate info */}
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-2">
            <span className="text-xs text-muted-foreground">Giá gốc:</span>
            <span className="text-xs font-semibold text-foreground tabular-nums">{fmt(TOPUP_BASE_RATE)}đ / credit</span>
          </div>
          {discountPct > 0 ? (
            <div className="flex items-center gap-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
              <TrendingDown className="size-3 text-emerald-500" />
              <span className="text-xs text-emerald-500 font-semibold">
                Giá của bạn: {fmt(ratePerCredit)}đ / credit (-{discountPct}%)
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-2">
              <span className="text-xs text-muted-foreground">Giá của bạn:</span>
              <span className="text-xs font-semibold text-foreground tabular-nums">{fmt(ratePerCredit)}đ / credit</span>
            </div>
          )}
        </div>

        {/* Preset buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {PRESETS.map(p => (
            <button
              key={p}
              onClick={() => setCreditAmount(p)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                creditAmount === p
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-foreground hover:bg-secondary/70'
              }`}
            >
              {p} cr
            </button>
          ))}
        </div>

        {/* Amount input */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => adjustAmount(-10)}
            disabled={creditAmount <= MIN_CREDITS}
            className="flex items-center justify-center size-9 rounded-xl bg-secondary text-foreground hover:bg-secondary/70 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Minus className="size-3.5" />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              value={creditAmount}
              onChange={e => {
                const raw = e.target.value.replace(/\D/g, '');
                if (raw === '') { setCreditAmount(MIN_CREDITS); return; }
                const v = parseInt(raw, 10);
                if (!isNaN(v)) setCreditAmount(Math.min(MAX_CREDITS, Math.max(MIN_CREDITS, v)));
              }}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-center text-lg font-bold text-foreground tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">credits</span>
          </div>
          <button
            onClick={() => adjustAmount(10)}
            disabled={creditAmount >= MAX_CREDITS}
            className="flex items-center justify-center size-9 rounded-xl bg-secondary text-foreground hover:bg-secondary/70 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Plus className="size-3.5" />
          </button>
        </div>

        {/* Price breakdown */}
        <div className="rounded-xl bg-secondary/50 border border-border/60 px-4 py-3.5 mb-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span translate="no"><span className="tabular-nums">{fmt(creditAmount)}</span> credits × <span className="tabular-nums">{fmt(ratePerCredit)}</span>đ</span>
            <span className="tabular-nums" translate="no">{fmt(totalPrice)}đ</span>
          </div>
          <div className={`flex items-center justify-between text-xs text-emerald-500 ${savings > 0 ? '' : 'hidden'}`}>
            <span>Tiết kiệm (<span className="tabular-nums">{discountPct}</span>%)</span>
            <span className="tabular-nums" translate="no">-{fmt(savings)}đ</span>
          </div>
          <div className="pt-1.5 border-t border-border/60 flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Tổng cộng</span>
            <span className="text-base font-bold text-foreground tabular-nums" translate="no">{fmt(totalPrice)}đ</span>
          </div>
        </div>

        <button
          onClick={handleTopup}
          disabled={topupping || !!buying || creditAmount < MIN_CREDITS || creditAmount > MAX_CREDITS}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_16px_rgba(var(--color-primary),0.2)]"
        >
          {topupping ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Đang xử lý...</span>
            </>
          ) : (
            <>
              <Coins className="size-4" />
              <span translate="no">
                Nạp <span className="tabular-nums">{fmt(creditAmount)}</span> credits
                {" — "}
                <span className="tabular-nums">{fmt(totalPrice)}</span>đ
              </span>
            </>
          )}
        </button>

        {discountPct === 0 && (
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Đăng ký gói bên dưới để nhận ưu đãi giảm giá khi top-up
          </p>
        )}
      </div>

      {/* ─── Packages / Plan upgrade section ─── */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-widest mb-2">
          <Crown className="size-4" />
          Gói nâng cấp
        </div>
        <h2 className="text-lg font-bold text-foreground mb-1">Mua gói để giảm giá top-up</h2>
        <p className="text-sm text-muted-foreground">
          Gói cao hơn → giá mỗi credit khi top-up càng rẻ. Credits trong gói dùng ngay.
        </p>
      </div>

      {pkgLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          Chưa có gói nào. Vui lòng quay lại sau.
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-3">
            {sorted.map((pkg, idx) => {
              const Icon        = PKG_ICONS[idx % PKG_ICONS.length];
              const isPopular   = idx === popularIdx;
              const isBuying    = buying === pkg.id;
              const totalCr     = pkg.credit_amount + (pkg.bonus_credit ?? 0);
              const grantsPlan  = pkg.grants_plan_type as PlanType | null | undefined;
              const grantMeta   = grantsPlan ? PLAN_META[grantsPlan] : null;
              const isCurrentPlan = grantsPlan === planType && planType !== 'free';

              // Compute discount this plan unlocks
              const planDiscounts: Record<string, number> = { basic: 5, pro: 10, agency: 15 };
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

                  {/* Icon + Name */}
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

                  {/* Credits */}
                  <div className="mb-1 flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold text-foreground tabular-nums">
                      {totalCr.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground">credits</span>
                  </div>

                  {pkg.bonus_credit > 0 && (
                    <p className="text-xs text-emerald-500 font-medium mb-2">
                      +{pkg.bonus_credit} bonus credits
                    </p>
                  )}

                  {/* Unlock benefit */}
                  {unlockDiscount > 0 && (
                    <div className="flex items-center gap-1.5 mt-2 mb-4">
                      <span className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full ${isPopular ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}>
                        <TrendingDown className="size-3" />
                        Giảm {unlockDiscount}% top-up vĩnh viễn
                      </span>
                    </div>
                  )}

                  {/* Features */}
                  <ul className="space-y-2 mb-5 flex-1">
                    <li className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                      {totalCr} credits cộng ngay
                    </li>
                    {unlockDiscount > 0 && (
                      <li className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                        Mỗi lần top-up giảm {unlockDiscount}% ({fmt(Math.round(TOPUP_BASE_RATE * (1 - unlockDiscount / 100)))}đ/credit)
                      </li>
                    )}
                    <li className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                      Thanh toán an toàn qua PayOS
                    </li>
                  </ul>

                  {/* Price + CTA */}
                  <div className="mt-auto">
                    <div className="mb-3">
                      <span className="text-2xl font-bold text-foreground tabular-nums">
                        {Number(pkg.price).toLocaleString("vi-VN")}đ
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">/ lần mua</span>
                    </div>
                    <button
                      onClick={() => handleBuy(pkg)}
                      disabled={!!buying || !!topupping}
                      className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        isCurrentPlan
                          ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30"
                          : isPopular
                            ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_12px_rgba(var(--color-primary),0.2)]"
                            : "bg-secondary text-foreground hover:bg-secondary/70"
                      }`}
                    >
                      {isBuying ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          <span>Đang xử lý...</span>
                        </>
                      ) : (
                        <span>{isCurrentPlan ? "Gia hạn / nâng cấp" : "Mua ngay"}</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Comparison table */}
          <div className="mt-8 rounded-2xl border border-border bg-card overflow-hidden">
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
                  <tr className="border-b border-border/40 hover:bg-muted/20">
                    <td className="px-5 py-3.5 font-semibold text-foreground">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full mr-2 ${PLAN_META.free.bg} ${PLAN_META.free.color}`}>Free</span>
                      —
                    </td>
                    <td className="px-4 py-3.5 text-center text-muted-foreground">—</td>
                    <td className="px-4 py-3.5 text-center text-muted-foreground">—</td>
                    <td className="px-4 py-3.5 text-center text-muted-foreground">0%</td>
                    <td className="px-4 py-3.5 text-center tabular-nums text-foreground font-medium">{fmt(TOPUP_BASE_RATE)}đ</td>
                  </tr>
                  {sorted.map((pkg, idx) => {
                    const grantsPlan  = pkg.grants_plan_type as PlanType | undefined;
                    const meta        = grantsPlan ? PLAN_META[grantsPlan] : null;
                    const planDiscounts: Record<string, number> = { basic: 5, pro: 10, agency: 15 };
                    const disc        = grantsPlan ? (planDiscounts[grantsPlan] ?? 0) : 0;
                    const rate        = Math.round(TOPUP_BASE_RATE * (1 - disc / 100));
                    const isPopular   = idx === popularIdx;
                    const totalCr     = pkg.credit_amount + (pkg.bonus_credit ?? 0);
                    return (
                      <tr key={pkg.id} className={`border-b border-border/40 last:border-0 transition-colors ${isPopular ? "bg-primary/[0.03]" : "hover:bg-muted/20"}`}>
                        <td className="px-5 py-3.5 font-semibold text-foreground flex items-center gap-2">
                          {meta && <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>{meta.label}</span>}
                          {pkg.name}
                          {isPopular && <span className="text-[9px] font-bold bg-primary/15 text-primary px-1.5 py-0.5 rounded-full uppercase">Phổ biến</span>}
                        </td>
                        <td className="px-4 py-3.5 text-center tabular-nums text-foreground font-medium">
                          {totalCr.toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5 text-center tabular-nums text-foreground font-medium">
                          {Number(pkg.price).toLocaleString('vi-VN')}đ
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          {disc > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-emerald-500 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                              <TrendingDown className="size-2.5" />
                              -{disc}%
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
      )}

      <p className="mt-8 text-center text-xs text-muted-foreground/60">
        Thanh toán bảo mật qua PayOS · Credits cộng ngay sau khi thanh toán thành công
      </p>
    </div>
  );
}
