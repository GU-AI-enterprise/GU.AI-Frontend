"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Coins, Sparkles, Zap, Crown, Loader2, CheckCircle2, Gift } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAppSelector } from "@/store/hooks";
import { selectCreditBalance } from "@/features/credit/creditSlice";
import { getPackages, createPaymentLink, type CreditPackage } from "@/features/payment/paymentService";
import GuaiLoader from "@/components/shared/guai-loader";

const PACKAGE_ICONS = [Zap, Sparkles, Crown];
const PACKAGE_COLORS = [
  "border-border hover:border-primary/40",
  "border-primary/60 bg-primary/[0.02] shadow-[0_0_24px_rgba(var(--color-primary),0.08)]",
  "border-border hover:border-primary/40",
];
const POPULAR_IDX = 1;

export default function TopupPage() {
  const router = useRouter();
  const credit = useAppSelector(selectCreditBalance);

  const [authLoading, setAuthLoading] = useState(true);
  const [packages, setPackages]       = useState<CreditPackage[]>([]);
  const [pkgLoading, setPkgLoading]   = useState(true);
  const [buying, setBuying]           = useState<string | null>(null);
  const [error, setError]             = useState<string | null>(null);

  // Auth guard
  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!alive) return;
      if (!session) { router.push("/login"); return; }
      setAuthLoading(false);
    });
    return () => { alive = false; };
  }, [router]);

  // Fetch packages
  useEffect(() => {
    if (authLoading) return;
    getPackages()
      .then(setPackages)
      .catch(() => setError("Không thể tải gói credits"))
      .finally(() => setPkgLoading(false));
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

  if (authLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <GuaiLoader size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-widest mb-2">
          <Coins className="size-4" />
          Nạp Credits
        </div>
        <h1 className="text-2xl font-bold text-foreground">Chọn gói credits</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Credits được dùng để tạo ảnh AI. Chọn gói phù hợp với nhu cầu của bạn.
        </p>
      </div>

      {/* Current balance */}
      {credit !== null && (
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 mb-8">
          <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10">
            <Coins className="size-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Số dư hiện tại</p>
            <p className="text-xl font-bold text-foreground tabular-nums">{credit.toLocaleString()} credits</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      {/* Packages */}
      {pkgLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : packages.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          Chưa có gói nào. Vui lòng quay lại sau.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          {packages.map((pkg, idx) => {
            const Icon = PACKAGE_ICONS[idx % PACKAGE_ICONS.length];
            const colorClass = PACKAGE_COLORS[idx % PACKAGE_COLORS.length];
            const isPopular = idx === POPULAR_IDX && packages.length >= 3;
            const totalCredits = pkg.credit_amount + (pkg.bonus_credit ?? 0);
            const isBuying = buying === pkg.id;

            return (
              <div
                key={pkg.id}
                className={`relative flex flex-col rounded-2xl border-2 p-5 transition-all duration-200 ${colorClass} ${isPopular ? "scale-[1.02] z-10" : ""}`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-[9px] font-bold text-primary-foreground uppercase tracking-widest whitespace-nowrap">
                    Phổ biến
                  </div>
                )}

                <div className="flex items-center gap-2.5 mb-4">
                  <div className={`flex items-center justify-center size-9 rounded-xl ${isPopular ? "bg-primary/15" : "bg-secondary"}`}>
                    <Icon className={`size-4 ${isPopular ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <span className="font-semibold text-sm text-foreground">{pkg.name}</span>
                </div>

                {/* Credits */}
                <div className="mb-1">
                  <span className="text-3xl font-bold text-foreground tabular-nums">
                    {pkg.credit_amount.toLocaleString()}
                  </span>
                  <span className="text-sm text-muted-foreground ml-1">credits</span>
                </div>
                {pkg.bonus_credit > 0 && (
                  <div className="flex items-center gap-1 text-xs text-emerald-500 font-medium mb-3">
                    <Gift className="size-3" />
                    +{pkg.bonus_credit} bonus ({totalCredits} tổng)
                  </div>
                )}

                {/* Features */}
                <ul className="space-y-1.5 mb-5 flex-1">
                  <li className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                    {totalCredits} lần tạo ảnh
                  </li>
                  <li className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                    Không hết hạn
                  </li>
                  <li className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                    Thanh toán an toàn qua PayOS
                  </li>
                </ul>

                {/* Price + CTA */}
                <div className="mt-auto">
                  <div className="text-lg font-bold text-foreground mb-3">
                    {Number(pkg.price).toLocaleString("vi-VN")}
                    <span className="text-xs font-normal text-muted-foreground ml-1">đ</span>
                  </div>
                  <button
                    onClick={() => handleBuy(pkg)}
                    disabled={!!buying}
                    className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition-all ${
                      isPopular
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_12px_rgba(var(--color-primary),0.2)]"
                        : "bg-secondary text-foreground hover:bg-secondary/70"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isBuying ? (
                      <><Loader2 className="size-3.5 animate-spin" /> Đang xử lý...</>
                    ) : (
                      "Mua ngay"
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer note */}
      <p className="mt-8 text-center text-xs text-muted-foreground/60">
        Thanh toán được bảo mật qua PayOS · Credits cộng ngay sau khi thanh toán thành công
      </p>
    </div>
  );
}
