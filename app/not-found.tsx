"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Home, MessageSquare } from "lucide-react";
import Logo from "@/components/shared/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background relative overflow-hidden items-center justify-center p-6 text-center">
      
      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 size-72 rounded-full bg-rose-500/5 blur-[100px] pointer-events-none" />

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="relative z-10 space-y-8 max-w-md">
        
        {/* Animated Lotus Logo container representing the lost stage */}
        <div className="mx-auto flex size-24 items-center justify-center rounded-2xl bg-primary/5 border border-primary/20 shadow-lg relative group">
          <div className="absolute inset-0 rounded-2xl bg-primary/10 blur-md opacity-50 animate-pulse" />
          <Logo iconOnly href="" className="scale-[2.5] animate-[spin_20s_linear_infinite]" />
        </div>

        {/* 404 Text */}
        <div className="space-y-3">
          <div className="font-mono text-xs uppercase tracking-widest text-primary font-bold">ERROR CODE: 404</div>
          <h1 className="font-serif text-4xl font-light text-foreground sm:text-5xl">
            Không tìm thấy <span className="font-normal italic text-primary">sàn diễn</span>
          </h1>
          <p className="text-sm font-light text-muted-foreground leading-relaxed">
            Đường dẫn bạn truy cập hiện tại không tồn tại, đã bị gỡ bỏ hoặc chuyển sang một bối cảnh photoshoot khác.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link href="/">
            <Button className="w-full sm:w-auto rounded-xl bg-primary px-6 py-5 text-xs font-semibold text-primary-foreground shadow-[0_0_20px_rgba(var(--color-primary),0.15)] hover:bg-primary/95 transition-all">
              <Home className="size-4 mr-1.5" />
              Quay lại Trang chủ
            </Button>
          </Link>
          <Link href="mailto:support@gu.ai">
            <Button variant="outline" className="w-full sm:w-auto rounded-xl px-6 py-5 text-xs border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-all">
              <MessageSquare className="size-4 mr-1.5" />
              Liên hệ Trợ giúp
            </Button>
          </Link>
        </div>

      </div>

    </div>
  );
}
