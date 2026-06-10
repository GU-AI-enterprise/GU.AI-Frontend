"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Sparkles, Image as ImageIcon, FolderHeart, Clock,
  ArrowRight, Coins, Upload, CheckCircle2, XCircle,
  Loader2, Shirt, Wand2,
} from "lucide-react";
import { apiClient } from "@/lib/apiFetch";
import { useAppSelector } from "@/store/hooks";
import { selectCreditBalance } from "@/features/credit/creditSlice";
import { getImages } from "@/features/archive/imageService";
import { getCollections } from "@/features/archive/collectionService";
import { getHistory, type AIJob } from "@/features/history/historyService";

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

const JOB_TYPE_ICON: Record<string, React.ReactNode> = {
  try_on:           <Shirt className="size-4 text-primary" />,
  try_on_max:       <Shirt className="size-4 text-violet-500" />,
  product_to_model: <Wand2 className="size-4 text-amber-500" />,
  edit:             <Sparkles className="size-4 text-blue-500" />,
  remove_bg:        <ImageIcon className="size-4 text-emerald-500" />,
  default:          <Sparkles className="size-4 text-muted-foreground" />,
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "Vừa xong";
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  const d = Math.floor(h / 24);
  return `${d} ngày trước`;
}

export default function DashboardPage() {
  const { user } = useAppSelector((s) => s.auth);
  const credit   = useAppSelector(selectCreditBalance);

  const [imageCount,      setImageCount]      = useState<number | null>(null);
  const [collectionCount, setCollectionCount] = useState<number | null>(null);
  const [recentJobs,      setRecentJobs]      = useState<AIJob[]>([]);
  const [statsLoading,    setStatsLoading]    = useState(true);

  const displayName = user?.user_metadata?.full_name
    || user?.user_metadata?.name
    || user?.email?.split("@")[0]
    || "bạn";

  useEffect(() => {
    let cancelled = false;
    setStatsLoading(true);
    Promise.all([
      getImages().catch(() => []),
      getCollections().catch(() => []),
      getHistory().catch(() => ({ aiJobs: [], transactions: [] })),
    ]).then(([imgs, cols, hist]) => {
      if (cancelled) return;
      setImageCount(imgs.length);
      setCollectionCount(cols.length);
      setRecentJobs(hist.aiJobs.slice(0, 6));
      setStatsLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const completedJobs = recentJobs.filter(j => j.status === "completed").length;

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">

      {/* ── Greeting ── */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Xin chào, {displayName}! 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Đây là tổng quan tài khoản của bạn.
        </p>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Coins className="size-5 text-primary" />}
          bg="bg-primary/10"
          label="Credits còn lại"
          value={credit !== null ? credit.toLocaleString() : "—"}
          sub={<Link href="/pricing" className="text-[11px] text-primary hover:underline">Nạp thêm</Link>}
        />
        <StatCard
          icon={<ImageIcon className="size-5 text-blue-500" />}
          bg="bg-blue-500/10"
          label="Ảnh đã lưu"
          value={statsLoading ? "…" : (imageCount ?? 0).toString()}
          sub={<Link href="/archive/gallery" className="text-[11px] text-muted-foreground hover:text-foreground">Xem kho →</Link>}
        />
        <StatCard
          icon={<FolderHeart className="size-5 text-amber-500" />}
          bg="bg-amber-500/10"
          label="Bộ sưu tập"
          value={statsLoading ? "…" : (collectionCount ?? 0).toString()}
          sub={<Link href="/archive/collections" className="text-[11px] text-muted-foreground hover:text-foreground">Xem album →</Link>}
        />
        <StatCard
          icon={<CheckCircle2 className="size-5 text-emerald-500" />}
          bg="bg-emerald-500/10"
          label="Tác vụ gần đây"
          value={statsLoading ? "…" : completedJobs.toString()}
          sub={<Link href="/history" className="text-[11px] text-muted-foreground hover:text-foreground">Xem lịch sử →</Link>}
        />
      </div>

      {/* ── Main grid ── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Left: Quick actions + Recent jobs */}
        <div className="lg:col-span-2 space-y-6">

          {/* Quick actions */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Thao tác nhanh
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { href: "/studio",      icon: <Sparkles className="size-5 text-primary" />,      bg: "bg-primary/10",     title: "AI Studio",       desc: "Try-on, tạo model, chỉnh ảnh" },
                { href: "/archive/gallery",    icon: <ImageIcon className="size-5 text-blue-500" />,    bg: "bg-blue-500/10",    title: "Tất cả ảnh",      desc: "Quản lý kho ảnh của bạn" },
                { href: "/archive/collections",icon: <FolderHeart className="size-5 text-amber-500" />, bg: "bg-amber-500/10",   title: "Bộ sưu tập",      desc: "Sắp xếp ảnh thành album" },
                { href: "/history",            icon: <Clock className="size-5 text-emerald-500" />,     bg: "bg-emerald-500/10", title: "Lịch sử tác vụ",  desc: "Xem kết quả AI đã tạo" },
              ].map(({ href, icon, bg, title, desc }) => (
                <Link key={href} href={href}
                  className="group flex items-center gap-3 p-4 rounded-xl border border-border/60 bg-background hover:border-primary/30 hover:bg-primary/5 transition-all"
                >
                  <div className={`size-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>{icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium group-hover:text-primary transition-colors">{title}</p>
                    <p className="text-xs text-muted-foreground truncate">{desc}</p>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>

          {/* Recent AI jobs */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tác vụ AI gần đây
              </h2>
              <Link href="/history" className="text-xs text-primary hover:underline flex items-center gap-1">
                Xem tất cả <ArrowRight className="size-3" />
              </Link>
            </div>

            {statsLoading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="size-5 animate-spin mr-2" /> Đang tải...
              </div>
            ) : recentJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Sparkles className="size-8 text-primary/40 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">Chưa có tác vụ nào</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Hãy thử tính năng AI Studio!</p>
                <Link href="/studio"
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
                >
                  <Sparkles className="size-3.5" /> Dùng thử Studio
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {recentJobs.map((job) => (
                  <div key={job.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="size-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      {JOB_TYPE_ICON[job.type] ?? JOB_TYPE_ICON.default}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {JOB_TYPE_LABEL[job.type] ?? job.type}
                      </p>
                      <p className="text-xs text-muted-foreground">{timeAgo(job.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {job.status === "completed" && (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900">
                          <CheckCircle2 className="size-3" /> Xong
                        </span>
                      )}
                      {job.status === "failed" && (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-red-600 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-full border border-red-100 dark:border-red-900">
                          <XCircle className="size-3" /> Thất bại
                        </span>
                      )}
                      {job.status === "processing" && (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-900">
                          <Loader2 className="size-3 animate-spin" /> Đang xử lý
                        </span>
                      )}
                      <span className="text-[11px] text-muted-foreground font-mono">-{job.credit_cost}cr</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Credit card + go to studio CTA */}
        <div className="space-y-5">

          {/* Credit card */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Coins className="size-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Credits</p>
                <p className="text-xs text-muted-foreground">Số dư hiện tại</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground tabular-nums mb-1">
              {credit !== null ? credit.toLocaleString() : "—"}
            </p>
            <p className="text-xs text-muted-foreground mb-4">credits</p>
            <Link
              href="/pricing"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <Coins className="size-4" /> Nạp thêm credits
            </Link>
          </div>

          {/* Studio CTA */}
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/8 to-violet-500/5 p-5">
            <div className="size-10 rounded-xl bg-primary/15 flex items-center justify-center mb-3">
              <Sparkles className="size-5 text-primary" />
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">Bắt đầu tạo ảnh AI</p>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              Dùng Try-On, Product to Model và các công cụ AI thời trang ngay hôm nay.
            </p>
            <Link
              href="/studio"
              className="flex items-center gap-2 text-xs font-semibold text-primary hover:gap-3 transition-all"
            >
              Vào AI Studio <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {/* Upload shortcut */}
          <Link
            href="/archive/upload"
            className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-card hover:border-primary/30 hover:bg-primary/5 transition-all group"
          >
            <div className="size-9 rounded-xl bg-secondary flex items-center justify-center shrink-0">
              <Upload className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium group-hover:text-primary transition-colors">Upload ảnh</p>
              <p className="text-xs text-muted-foreground">Tải lên kho lưu trữ</p>
            </div>
            <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
          </Link>
        </div>

      </div>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ icon, bg, label, value, sub }: {
  icon: React.ReactNode;
  bg: string;
  label: string;
  value: string;
  sub?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-3">
      <div className={`size-10 rounded-xl ${bg} flex items-center justify-center`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-foreground tabular-nums leading-none">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
      </div>
      {sub && <div>{sub}</div>}
    </div>
  );
}
