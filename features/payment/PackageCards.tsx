"use client";

// Card gói + bảng so sánh + lưu ý credit — dùng CHUNG cho /topup và /pricing
// để 2 trang luôn hiển thị gói giống hệt nhau (tránh lệch nội dung như trước).

import React from "react";
import {
  Coins, Sparkles, Crown, Loader2, CheckCircle2,
  TrendingDown, ShoppingBag, Bot, UsersRound, AlertTriangle,
} from "lucide-react";
import type { CreditPackage, PackageDescription } from "@/features/payment/paymentService";

export const TOPUP_BASE_RATE = 1580;
export const PLAN_DISCOUNTS: Record<string, number> = { free: 0, basic: 5, pro: 10 };

export type PlanType = "free" | "basic" | "pro";

export const PLAN_META: Record<PlanType, { label: string; color: string; bg: string }> = {
  free:  { label: "Free",  color: "text-slate-400",  bg: "bg-slate-400/10 border border-slate-400/20" },
  basic: { label: "Basic", color: "text-blue-400",   bg: "bg-blue-400/10 border border-blue-400/20" },
  pro:   { label: "Pro",   color: "text-violet-400", bg: "bg-violet-400/10 border border-violet-400/20" },
};

const PKG_ICONS = [ShoppingBag, Sparkles, Crown];

export function fmt(n: number) { return n.toLocaleString("vi-VN"); }

/** Diễn giải description JSON của gói thành các dòng ưu đãi hiển thị trên card. */
export function describePerks(desc: PackageDescription | null | undefined): string[] {
  if (!desc) return [];
  const lines: string[] = [];
  if (desc.models_unlocked !== undefined) {
    lines.push(
      desc.models_unlocked === "all"
        ? "Mở khóa toàn bộ người mẫu AI"
        : `Mở khóa ${desc.models_unlocked} người mẫu AI`
    );
  }
  if (desc.ai_assistant) lines.push("Trợ lý AI Studio (chat + gợi ý prompt)");
  if (Array.isArray(desc.perks)) lines.push(...desc.perks);
  return lines;
}

/** Lưu ý bắt buộc hiển thị ở trang pricing + top-up: credit gói không chuyển tiếp qua tháng sau. */
export function NoRolloverNote({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-start gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 ${className}`}>
      <AlertTriangle className="size-4 shrink-0 text-amber-500 mt-0.5" />
      <p className="text-xs text-amber-600 dark:text-amber-400 leading-relaxed">
        <span className="font-semibold">Lưu ý:</span> credits nhận từ gói chỉ có hiệu lực trong chu kỳ
        30 ngày của gói — credits chưa dùng hết sẽ <span className="font-semibold">không được chuyển tiếp</span> qua
        tháng/chu kỳ tiếp theo.
      </p>
    </div>
  );
}

interface PackageCardsProps {
  packages: CreditPackage[];          // đã sort theo sort_order
  planType: PlanType;                 // gói hiện tại của user
  buyingId: string | null;
  disabled?: boolean;                 // vd. đang xử lý top-up
  onBuy: (pkg: CreditPackage) => void;
}

/** Gói "Phổ biến": gói grants pro (tier bán chạy) — fallback gói giữa nếu không có. */
function popularIndex(sorted: CreditPackage[]): number {
  const proIdx = sorted.findIndex((p) => p.grants_plan_type === "pro");
  if (proIdx !== -1) return proIdx;
  return sorted.length >= 3 ? 1 : -1;
}

export function PackageCards({ packages, planType, buyingId, disabled = false, onBuy }: PackageCardsProps) {
  const popularIdx = popularIndex(packages);

  return (
    <div className="grid gap-5 sm:grid-cols-3">
      {packages.map((pkg, idx) => {
        const Icon          = PKG_ICONS[idx % PKG_ICONS.length];
        const isPopular     = idx === popularIdx;
        const isBuying      = buyingId === pkg.id;
        const totalCr       = pkg.credit_amount + (pkg.bonus_credit ?? 0);
        const grantsPlan    = pkg.grants_plan_type as PlanType | null | undefined;
        const grantMeta     = grantsPlan ? PLAN_META[grantsPlan] : null;
        const isCurrentPlan = grantsPlan === planType;
        const isFreePkg     = grantsPlan === "free" || Number(pkg.price) <= 0;
        const unlockDiscount = grantsPlan ? (PLAN_DISCOUNTS[grantsPlan] ?? 0) : 0;
        const perks         = describePerks(pkg.description);

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
              <span className="text-3xl font-bold text-foreground tabular-nums">{totalCr.toLocaleString()}</span>
              <span className="text-sm text-muted-foreground">credits</span>
            </div>

            {pkg.bonus_credit > 0 && (
              <p className="text-xs text-emerald-500 font-medium mb-2">+{pkg.bonus_credit} bonus credits</p>
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
                {isFreePkg
                  ? `${totalCr} credits tặng khi đăng ký`
                  : `${totalCr} credits cộng ngay (hiệu lực trong 30 ngày của gói)`}
              </li>
              {perks.map((perk) => (
                <li key={perk} className="flex items-center gap-2 text-xs text-muted-foreground">
                  {perk.includes("Trợ lý AI") ? (
                    <Bot className="size-3.5 text-primary shrink-0" />
                  ) : perk.includes("người mẫu") ? (
                    <UsersRound className="size-3.5 text-primary shrink-0" />
                  ) : (
                    <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                  )}
                  {perk}
                </li>
              ))}
              {unlockDiscount > 0 && (
                <li className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                  Mỗi lần top-up giảm {unlockDiscount}% ({fmt(Math.round(TOPUP_BASE_RATE * (1 - unlockDiscount / 100)))}đ/credit)
                </li>
              )}
              <li className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                {isFreePkg ? "Không cần thanh toán" : "Thanh toán an toàn qua PayOS"}
              </li>
            </ul>

            {/* Price + CTA */}
            <div className="mt-auto">
              <div className="mb-3">
                <span className="text-2xl font-bold text-foreground tabular-nums">
                  {Number(pkg.price).toLocaleString("vi-VN")}đ
                </span>
                {!isFreePkg && <span className="text-xs text-muted-foreground ml-1">/ lần mua</span>}
              </div>
              {isFreePkg ? (
                <div className="w-full flex items-center justify-center rounded-xl py-2.5 text-xs font-semibold bg-secondary/60 text-muted-foreground">
                  {isCurrentPlan ? "Gói đang dùng" : "Gói mặc định"}
                </div>
              ) : (
                <button
                  onClick={() => onBuy(pkg)}
                  disabled={!!buyingId || disabled}
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
  );
}

export function PackageComparisonTable({ packages, planType }: { packages: CreditPackage[]; planType: PlanType }) {
  const popularIdx = popularIndex(packages);

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
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
              <th className="text-center px-4 py-3 text-muted-foreground font-medium">Người mẫu AI</th>
              <th className="text-center px-4 py-3 text-muted-foreground font-medium">Trợ lý AI</th>
              <th className="text-center px-4 py-3 text-muted-foreground font-medium">Giảm top-up</th>
              <th className="text-center px-4 py-3 text-muted-foreground font-medium">Giá / credit top-up</th>
            </tr>
          </thead>
          <tbody>
            {packages.map((pkg, idx) => {
              const grantsPlan = pkg.grants_plan_type as PlanType | undefined;
              const meta       = grantsPlan ? PLAN_META[grantsPlan] : null;
              const disc       = grantsPlan ? (PLAN_DISCOUNTS[grantsPlan] ?? 0) : 0;
              const rate       = Math.round(TOPUP_BASE_RATE * (1 - disc / 100));
              const isPopular  = idx === popularIdx;
              const isCurrent  = grantsPlan === planType;
              const totalCr    = pkg.credit_amount + (pkg.bonus_credit ?? 0);
              const desc       = pkg.description;

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
                  <td className="px-4 py-3.5 text-center tabular-nums text-foreground font-medium">{Number(pkg.price).toLocaleString("vi-VN")}đ</td>
                  <td className="px-4 py-3.5 text-center text-foreground font-medium">
                    {desc?.models_unlocked === "all" ? "Tất cả" : desc?.models_unlocked ?? "—"}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    {desc?.ai_assistant ? (
                      <CheckCircle2 className="size-3.5 text-emerald-500 inline" />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
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
  );
}
