"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { PLAN_VISUALS } from "./planMeta";
import type { PlanType } from "./creditSlice";

// Two keyframes (not a there-and-back triple) so the sweep keeps moving the same direction,
// snapping back to the start each loop instead of ping-ponging left-right.
const SWEEP_ANIMATE = { backgroundPosition: ["0% 50%", "200% 50%"] };
const SWEEP_TRANSITION = { duration: 4.5, repeat: Infinity, ease: "linear" as const };
const SWEEP_STYLE = { backgroundSize: "300% 100%" };

const SPIN_ANIMATE = { rotate: 360 };
const SPIN_TRANSITION = { duration: 5, repeat: Infinity, ease: "linear" as const };

interface PlanBadgeWrapProps {
  planType: PlanType;
  className?: string;
  children: React.ReactNode;
}

/** Wraps a plan tier badge's contents with its gradient background; animates the gradient for paid tiers. */
export function PlanBadgeWrap({ planType, className, children }: PlanBadgeWrapProps) {
  const plan = PLAN_VISUALS[planType];
  if (!plan.ringClass) return <span className={cn(plan.badgeClass, className)}>{children}</span>;
  return (
    <motion.span
      className={cn(plan.badgeClass, className)}
      style={SWEEP_STYLE}
      animate={SWEEP_ANIMATE}
      transition={SWEEP_TRANSITION}
    >
      {children}
    </motion.span>
  );
}

interface PlanAvatarRingProps {
  planType: PlanType;
  className?: string;
  children: React.ReactNode;
}

/**
 * Wraps an avatar with a spinning gradient ring matching the user's plan tier.
 * The conic-gradient layer sits behind the avatar and spins; the avatar itself stays upright —
 * only the thin ring revealed by the padding gap appears to rotate.
 */
export function PlanAvatarRing({ planType, className, children }: PlanAvatarRingProps) {
  const plan = PLAN_VISUALS[planType];
  if (!plan.ringClass) return <>{children}</>;
  return (
    <div className={cn("relative inline-flex shrink-0 items-center justify-center rounded-full p-[2.5px] overflow-hidden", className)}>
      <motion.div
        className={cn("absolute -inset-1/2", plan.ringClass)}
        animate={SPIN_ANIMATE}
        transition={SPIN_TRANSITION}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
