"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Mail, Calendar, Coins, Sparkles, Edit,
  Shield, FolderHeart, Image as ImageIcon,
  Clock, ArrowRight, CheckCircle2,
} from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { selectCreditBalance } from "@/features/credit/creditSlice";
import { getImages } from "@/features/archive/imageService";
import { getCollections } from "@/features/archive/collectionService";
import { getHistory } from "@/features/history/historyService";
import GuaiLoader from "@/components/shared/guai-loader";
import { supabase } from "@/lib/supabase";

interface UserProfile {
  email: string;
  name: string | null;
  avatar_url: string | null;
  plan_type: string;
  created_at: string;
}

const PLAN_LABEL: Record<string, string> = {
  free: "Miễn phí", pro: "Pro", business: "Business",
};

const JOB_TYPE_LABEL: Record<string, string> = {
  try_on: "Virtual Try-On", try_on_max: "Try-On Max",
  product_to_model: "Product to Model", edit: "Edit ảnh",
  remove_bg: "Xóa nền", upscale: "Upscale", reframe: "Reframe",
};

function timeAgo(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1)  return "Vừa xong";
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 px-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground text-right">{children}</span>
    </div>
  );
}

export default function ProfilePage() {
  const { user }  = useAppSelector((s) => s.auth);
  const credit    = useAppSelector(selectCreditBalance);

  const [profile,     setProfile]     = useState<UserProfile | null>(null);
  const [imageCount,  setImageCount]  = useState<number | null>(null);
  const [colCount,    setColCount]    = useState<number | null>(null);
  const [jobCount,    setJobCount]    = useState<number | null>(null);
  const [recentJobs,  setRecentJobs]  = useState<{ type: string; created_at: string; status: string }[]>([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const { data } = await supabase
        .from("users")
        .select("email, name, avatar_url, plan_type, created_at")
        .eq("id", user.id)
        .single();
      if (data) setProfile(data);
    };

    Promise.all([
      fetchProfile(),
      getImages().then(imgs => setImageCount(imgs.length)).catch(() => {}),
      getCollections().then(cols => setColCount(cols.length)).catch(() => {}),
      getHistory().then(h => {
        setJobCount(h.aiJobs.filter(j => j.status === "completed").length);
        setRecentJobs(h.aiJobs.slice(0, 5));
      }).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [user]);

  const displayName = profile?.name
    || user?.user_metadata?.full_name
    || user?.user_metadata?.name
    || user?.email?.split("@")[0]
    || "Người dùng";

  const initials  = displayName.charAt(0).toUpperCase();
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <GuaiLoader size="lg" text="Đang tải hồ sơ..." />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-light tracking-tight">
            Hồ sơ <span className="font-normal italic text-primary">cá nhân</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Thông tin tài khoản của bạn</p>
        </div>
        <Link href="/profile/edit"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-accent transition-all">
          <Edit className="size-4"/> Chỉnh sửa
        </Link>
      </div>

      {/* ── Avatar & name card ── */}
      <div className="rounded-2xl border border-border bg-card p-6 flex items-center gap-5">
        {avatarUrl ? (
          <img src={avatarUrl} alt={displayName} referrerPolicy="no-referrer"
            className="size-20 rounded-full object-cover border-2 border-border/60 shrink-0"/>
        ) : (
          <div className="size-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-2xl font-bold text-primary shrink-0">
            {initials}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xl font-semibold text-foreground truncate">{displayName}</p>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1 truncate">
            <Mail className="size-3.5 shrink-0"/>{profile?.email ?? user?.email}
          </p>
          {profile?.created_at && (
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
              <Calendar className="size-3.5 shrink-0"/>
              Tham gia {new Date(profile.created_at).toLocaleDateString("vi-VN",{month:"long",year:"numeric"})}
            </p>
          )}
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: <Coins className="size-4 text-primary"/>,         bg: "bg-primary/10",     label: "Credits",        value: credit !== null ? credit.toLocaleString() : "—" },
          { icon: <ImageIcon className="size-4 text-blue-500"/>,    bg: "bg-blue-500/10",    label: "Ảnh đã lưu",     value: imageCount !== null ? imageCount.toString() : "…" },
          { icon: <FolderHeart className="size-4 text-amber-500"/>, bg: "bg-amber-500/10",   label: "Bộ sưu tập",     value: colCount !== null ? colCount.toString() : "…" },
          { icon: <CheckCircle2 className="size-4 text-emerald-500"/>, bg: "bg-emerald-500/10", label: "Tác vụ xong", value: jobCount !== null ? jobCount.toString() : "…" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-4 flex flex-col gap-2">
            <div className={`size-8 rounded-lg ${s.bg} flex items-center justify-center`}>{s.icon}</div>
            <p className="text-xl font-bold text-foreground tabular-nums">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Account info ── */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/20">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Thông tin tài khoản</p>
        </div>
        <div className="divide-y divide-border/60">
          <InfoRow label="Gói dịch vụ">
            <span className="flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-primary"/>
              {PLAN_LABEL[profile?.plan_type ?? "free"] ?? profile?.plan_type ?? "Miễn phí"}
            </span>
          </InfoRow>
          <InfoRow label="Credits hiện có">
            <span className="flex items-center gap-1.5 font-bold">
              <Coins className="size-3.5 text-primary"/>
              {credit !== null ? credit.toLocaleString() : "—"}
            </span>
          </InfoRow>
          <InfoRow label="Bảo mật">
            <Link href="/profile/password"
              className="flex items-center gap-1 text-primary hover:underline text-sm">
              <Shield className="size-3.5"/> Đổi mật khẩu
            </Link>
          </InfoRow>
        </div>
      </div>

      {/* ── Recent activity ── */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hoạt động gần đây</p>
          <Link href="/history" className="text-xs text-primary hover:underline flex items-center gap-1">
            Xem tất cả <ArrowRight className="size-3"/>
          </Link>
        </div>
        {recentJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
            <Clock className="size-8 opacity-30"/>
            <p className="text-sm">Chưa có tác vụ nào</p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {recentJobs.map(job => (
              <div key={job.created_at + job.type} className="flex items-center gap-3 px-4 py-3">
                <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles className="size-3.5 text-primary"/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {JOB_TYPE_LABEL[job.type] ?? job.type}
                  </p>
                  <p className="text-xs text-muted-foreground">{timeAgo(job.created_at)}</p>
                </div>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                  job.status === "completed"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-900"
                    : job.status === "failed"
                    ? "bg-red-50 text-red-700 border-red-100 dark:bg-red-950/40 dark:border-red-900"
                    : "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/40 dark:border-blue-900"
                }`}>
                  {job.status === "completed" ? "Xong" : job.status === "failed" ? "Thất bại" : "Đang xử lý"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
