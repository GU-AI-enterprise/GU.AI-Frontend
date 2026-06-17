"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles, Image as ImageIcon, FolderHeart, Clock,
  ArrowRight, Coins, Upload, CheckCircle2, XCircle,
  Loader2, History,
} from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { selectCreditBalance } from "@/features/credit/creditSlice";
import { useDashboardStats } from "@/features/dashboard/hooks";
import { timeAgo } from "@/lib/utils";

const JOB_TYPE_LABEL: Record<string, string> = {
  try_on:           "Virtual Try-On",
  try_on_max:       "Try-On Max",
  product_to_model: "Product to Model",
  edit:             "Edit ảnh",
  remove_bg:        "Xóa nền",
  upscale:          "Upscale",
  reframe:          "Reframe",
  generate:         "Generate",
};

const STATUS_PILL: Record<string, { icon: React.ReactNode; cls: string; label: string }> = {
  completed:  { icon: <CheckCircle2 className="size-3" />,        cls: "bg-emerald-500/10 text-emerald-500", label: "Hoàn thành" },
  failed:     { icon: <XCircle className="size-3" />,              cls: "bg-red-500/10 text-red-500",         label: "Thất bại" },
  processing: { icon: <Loader2 className="size-3 animate-spin" />, cls: "bg-amber-500/10 text-amber-500",     label: "Đang xử lý" },
};

const QUICK_LINKS = [
  { href: "/studio",              icon: Sparkles,    title: "AI Studio",      desc: "Try-on, tạo model, chỉnh ảnh" },
  { href: "/archive/gallery",     icon: ImageIcon,   title: "Tất cả ảnh",     desc: "Quản lý kho ảnh của bạn" },
  { href: "/archive/collections", icon: FolderHeart, title: "Bộ sưu tập",    desc: "Sắp xếp ảnh thành album" },
  { href: "/archive/upload",      icon: Upload,      title: "Upload ảnh",     desc: "Tải lên kho lưu trữ" },
  { href: "/pricing",             icon: Coins,       title: "Nạp credits",   desc: "Mua thêm credits sử dụng" },
];

export default function DashboardPage() {
  const { user } = useAppSelector((s) => s.auth);
  const credit   = useAppSelector(selectCreditBalance);

  const { imageCount, collectionCount, recentJobs, loading: statsLoading } = useDashboardStats();

  const displayName = user?.user_metadata?.full_name
    || user?.user_metadata?.name
    || user?.email?.split("@")[0]
    || "bạn";

  const completedJobs = recentJobs.filter(j => j.status === "completed").length;

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">

      {/* ── Greeting ── */}
      <div>
        <h1 className="font-serif text-3xl font-light tracking-tight">
          Xin chào, <span className="font-normal italic text-primary">{displayName}</span>! 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Đây là tổng quan tài khoản của bạn.
        </p>
      </div>

      {/* ── Stat strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 rounded-lg border border-border divide-x divide-y sm:divide-y-0 divide-border overflow-hidden">
        <StatCell
          icon={<Coins className="size-4 text-primary" />}
          label="Credits còn lại"
          value={credit !== null ? credit.toLocaleString() : "—"}
          href="/topup"
          linkLabel="Nạp thêm"
        />
        <StatCell
          icon={<ImageIcon className="size-4 text-blue-500" />}
          label="Ảnh đã lưu"
          value={statsLoading ? "…" : (imageCount ?? 0).toString()}
          href="/archive/gallery"
          linkLabel="Xem kho"
        />
        <StatCell
          icon={<FolderHeart className="size-4 text-amber-500" />}
          label="Bộ sưu tập"
          value={statsLoading ? "…" : (collectionCount ?? 0).toString()}
          href="/archive/collections"
          linkLabel="Xem album"
        />
        <StatCell
          icon={<CheckCircle2 className="size-4 text-emerald-500" />}
          label="Tác vụ hoàn thành"
          value={statsLoading ? "…" : completedJobs.toString()}
          href="/history"
          linkLabel="Xem lịch sử"
        />
      </div>

      {/* ── Main grid ── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Left: Recent AI jobs table */}
        <div className="lg:col-span-2 rounded-lg border border-border overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <History className="size-4 text-muted-foreground" />
              Tác vụ AI gần đây
            </h2>
            <Link href="/history" className="text-xs text-primary hover:underline flex items-center gap-1">
              Xem tất cả <ArrowRight className="size-3" />
            </Link>
          </div>

          {statsLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="size-5 animate-spin mr-2" /> Đang tải...
            </div>
          ) : recentJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Sparkles className="size-8 text-primary/40 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">Chưa có tác vụ nào</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Hãy thử tính năng AI Studio!</p>
              <Link href="/studio"
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
              >
                <Sparkles className="size-3.5" /> Dùng thử Studio
              </Link>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Tác vụ</th>
                  <th className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Trạng thái</th>
                  <th className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Thời gian</th>
                  <th className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground text-right">Credit</th>
                </tr>
              </thead>
              <tbody>
                {recentJobs.map((job) => {
                  const pill = STATUS_PILL[job.status] ?? { icon: <Clock className="size-3" />, cls: "bg-secondary text-muted-foreground", label: job.status };
                  return (
                    <tr key={job.id} className="border-b border-border last:border-b-0 hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3 text-xs font-medium text-foreground">{JOB_TYPE_LABEL[job.type] ?? job.type}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${pill.cls}`}>
                          {pill.icon}{pill.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{timeAgo(job.created_at)}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground text-right font-mono">-{job.credit_cost}cr</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Right: Compact action list */}
        <div className="rounded-lg border border-border divide-y divide-border overflow-hidden self-start">
          {QUICK_LINKS.map(({ href, icon: Icon, title, desc }) => (
            <Link key={href} href={href}
              className="group flex items-center gap-3 px-4 py-3 hover:bg-secondary/30 transition-colors"
            >
              <Icon className="size-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">{title}</p>
                <p className="text-[11px] text-muted-foreground truncate">{desc}</p>
              </div>
              <ArrowRight className="size-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0" />
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}

// ── Stat cell ─────────────────────────────────────────────────────────────────

function StatCell({ icon, label, value, href, linkLabel }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <Link href={href} className="group flex flex-col gap-1.5 p-4 hover:bg-secondary/30 transition-colors">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-[11px]">{label}</span>
      </div>
      <p className="text-xl font-bold text-foreground tabular-nums leading-none">{value}</p>
      <span className="text-[10px] text-muted-foreground group-hover:text-primary transition-colors">{linkLabel} →</span>
    </Link>
  );
}
