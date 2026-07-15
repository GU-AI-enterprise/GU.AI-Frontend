"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Coins, Crown, Loader2, TrendingDown, BadgePercent, Plus, Minus,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAppSelector } from "@/store/hooks";
import { selectCreditBalance } from "@/features/credit/creditSlice";
import {
  getPackages, createPaymentLink, getTopupInfo, createTopupPayment,
  type CreditPackage, type TopupInfo,
} from "@/features/payment/paymentService";
import {
  PackageCards, PackageComparisonTable, NoRolloverNote,
  PLAN_META, TOPUP_BASE_RATE, fmt, type PlanType,
} from "@/features/payment/PackageCards";
import GuaiLoader from "@/components/shared/guai-loader";
import { daysRemaining } from "@/features/credit/planMeta";

const PRESETS = [50, 100, 200, 500];
const MIN_CREDITS = 10;
const MAX_CREDITS = 5000;

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
  const planType: PlanType = (topupInfo?.plan_type as PlanType) ?? 'free';
  const planMeta = PLAN_META[planType];
  const planDaysLeft = planType !== 'free' ? daysRemaining(topupInfo?.plan_expires_at ?? null) : null;
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
        <h1 className="font-serif text-3xl font-light tracking-tight text-foreground">
          Quản lý <span className="font-normal italic text-primary">credits</span>
        </h1>
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
      <div id="packages" className="mb-6 scroll-mt-6">
        <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-widest mb-2">
          <Crown className="size-4" />
          Gói nâng cấp
        </div>
        <h2 className="text-lg font-bold text-foreground mb-1">Mua gói để giảm giá top-up</h2>
        <p className="text-sm text-muted-foreground">
          Gói cao hơn → giá mỗi credit khi top-up càng rẻ. Credits trong gói dùng ngay.
        </p>
        <NoRolloverNote className="mt-3" />
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
          <PackageCards
            packages={sorted}
            planType={planType}
            buyingId={buying}
            disabled={topupping}
            onBuy={handleBuy}
          />

          {/* Comparison table */}
          <div className="mt-8">
            <PackageComparisonTable packages={sorted} planType={planType} />
          </div>
        </>
      )}

      <p className="mt-8 text-center text-xs text-muted-foreground/60">
        Thanh toán bảo mật qua PayOS · Credits cộng ngay sau khi thanh toán thành công
      </p>
    </div>
  );
}
