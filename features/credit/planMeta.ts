import type { PlanType } from "./creditSlice";

interface PlanVisual {
  label: string;
  /** Gradient background + text, for the small plan tier badge (sweeps left-to-right) */
  badgeClass: string;
  /** Solid color dot used in compact/collapsed contexts */
  dotClass: string;
  /** Conic gradient used to spin behind the user avatar; null for the free tier (no special ring) */
  ringClass: string | null;
}

export const PLAN_VISUALS: Record<PlanType, PlanVisual> = {
  free: {
    label: "Free",
    badgeClass: "bg-slate-400/10 text-slate-400",
    dotClass: "bg-slate-400",
    ringClass: null,
  },
  basic: {
    label: "Basic",
    badgeClass: "bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 text-white shadow-[0_0_6px_-1px_rgba(59,130,246,0.35)]",
    dotClass: "bg-white",
    ringClass: "bg-[conic-gradient(from_0deg,#3b82f6,#67e8f9,#3b82f6,#1d4ed8,#3b82f6)]",
  },
  pro: {
    label: "Pro",
    badgeClass: "bg-gradient-to-r from-violet-500 via-fuchsia-500 to-purple-600 text-white shadow-[0_0_6px_-1px_rgba(168,85,247,0.35)]",
    dotClass: "bg-white",
    ringClass: "bg-[conic-gradient(from_0deg,#8b5cf6,#f0abfc,#8b5cf6,#7e22ce,#8b5cf6)]",
  },
};

/** Số ngày còn lại tới khi hết hạn gói; null nếu không có hạn (free / chưa từng mua gói). */
export function daysRemaining(expiresAt: string | null): number | null {
  if (!expiresAt) return null;
  const ms = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}
