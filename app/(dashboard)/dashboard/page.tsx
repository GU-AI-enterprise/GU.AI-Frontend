"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  Image as ImageIcon,
  FolderOpen,
  Zap,
  TrendingUp,
  Clock,
  CreditCard,
  ArrowRight,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tổng quan</h1>
        <p className="text-sm text-muted-foreground mt-1">Chào mừng trở lại! Đây là bảng điều khiển của bạn.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Credits còn lại", value: "120", icon: CreditCard, color: "text-primary" },
          { label: "Ảnh đã tạo", value: "45", icon: ImageIcon, color: "text-blue-500" },
          { label: "Bộ sưu tập", value: "8", icon: FolderOpen, color: "text-amber-500" },
          { label: "Tác vụ đang chạy", value: "2", icon: Zap, color: "text-emerald-500" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-card p-5 flex items-center gap-4"
          >
            <div className="size-10 rounded-lg bg-secondary flex items-center justify-center">
              <stat.icon className={`size-5 ${stat.color}`} />
            </div>
            <div>
              <div className="text-2xl font-semibold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Thao tác nhanh
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <Link
                href="/studio"
                className="group flex items-center gap-4 p-4 rounded-lg border border-border/60 bg-background hover:border-primary/30 hover:bg-primary/5 transition-all"
              >
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="size-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium group-hover:text-primary transition-colors">
                    Studio
                  </div>
                  <div className="text-xs text-muted-foreground">Tạo ảnh mẫu AI mới</div>
                </div>
                <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>

              <Link
                href="/archive/upload"
                className="group flex items-center gap-4 p-4 rounded-lg border border-border/60 bg-background hover:border-primary/30 hover:bg-primary/5 transition-all"
              >
                <div className="size-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <ImageIcon className="size-5 text-blue-500" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium group-hover:text-primary transition-colors">
                    Upload
                  </div>
                  <div className="text-xs text-muted-foreground">Tải ảnh lên kho lưu trữ</div>
                </div>
                <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>

              <Link
                href="/archive/gallery"
                className="group flex items-center gap-4 p-4 rounded-lg border border-border/60 bg-background hover:border-primary/30 hover:bg-primary/5 transition-all"
              >
                <div className="size-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <FolderOpen className="size-5 text-amber-500" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium group-hover:text-primary transition-colors">
                    Kho lưu trữ
                  </div>
                  <div className="text-xs text-muted-foreground">Xem tất cả ảnh đã tạo</div>
                </div>
                <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>

              <Link
                href="/history"
                className="group flex items-center gap-4 p-4 rounded-lg border border-border/60 bg-background hover:border-primary/30 hover:bg-primary/5 transition-all"
              >
                <div className="size-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Clock className="size-5 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium group-hover:text-primary transition-colors">
                    Lịch sử
                  </div>
                  <div className="text-xs text-muted-foreground">Xem lịch sử tác vụ</div>
                </div>
                <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Hoạt động gần đây
              </h2>
              <Link href="/history" className="text-xs text-primary hover:underline">
                Xem tất cả
              </Link>
            </div>
            <div className="space-y-3">
              {[
                { action: "Tạo ảnh mẫu", detail: "Áo dài lụa - Model nữ", time: "2 phút trước", status: "Hoàn thành" },
                { action: "Upload ảnh", detail: "BST Hè 2024 (12 ảnh)", time: "1 giờ trước", status: "Hoàn thành" },
                { action: "Tạo ảnh mẫu", detail: "Vest nam công sở", time: "3 giờ trước", status: "Hoàn thành" },
                { action: "Tạo bộ sưu tập", detail: "BST Thu Đông 2024", time: "Hôm qua", status: "Hoàn thành" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
                >
                  <div>
                    <div className="text-sm font-medium">{item.action}</div>
                    <div className="text-xs text-muted-foreground">{item.detail}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">{item.time}</div>
                    <div className="text-xs text-emerald-500 font-medium">{item.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar cards */}
        <div className="space-y-6">
          {/* Usage */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Sử dụng tháng này
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Credits đã dùng</span>
                  <span className="font-medium">380 / 500</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full w-[76%] rounded-full bg-primary" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Ảnh đã tạo</span>
                  <span className="font-medium">45 / 100</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full w-[45%] rounded-full bg-blue-500" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Dung lượng lưu trữ</span>
                  <span className="font-medium">1.2 / 5 GB</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full w-[24%] rounded-full bg-amber-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Trend */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Xu hướng
            </h2>
            <div className="flex items-center gap-3 mb-3">
              <div className="size-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="size-5 text-emerald-500" />
              </div>
              <div>
                <div className="text-sm font-medium">+24% so với tháng trước</div>
                <div className="text-xs text-muted-foreground">Số ảnh được tạo</div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground leading-relaxed">
              Bạn đang tích cực sử dụng nền tảng. Hãy tiếp tục tạo thêm nhiều mẫu ảnh đẹp nhé!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
