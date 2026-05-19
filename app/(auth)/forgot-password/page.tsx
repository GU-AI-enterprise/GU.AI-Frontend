"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate link submission
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
    }, 1200);
  };

  if (success) {
    return (
      <div className="space-y-6">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary animate-pulse">
          <Mail className="size-5" />
        </div>
        
        <div className="space-y-2 text-center">
          <h2 className="font-serif text-2xl font-light text-foreground">Kiểm tra hộp thư!</h2>
          <p className="text-sm font-light text-muted-foreground leading-relaxed">
            Chúng tôi đã gửi đường dẫn khôi phục mật khẩu đến <strong className="font-normal text-foreground">{email}</strong>. Vui lòng kiểm tra email của bạn (bao gồm cả thư rác).
          </p>
        </div>

        <Link
          href="/login"
          className="flex items-center justify-center gap-2 text-sm text-primary hover:underline pt-2 font-normal"
        >
          <ArrowLeft className="size-4" />
          Quay lại Đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title & Description */}
      <div className="space-y-2">
        <h2 className="font-serif text-3xl font-light tracking-tight text-foreground">
          Quên <span className="font-normal italic text-primary">mật khẩu?</span>
        </h2>
        <p className="text-sm font-light text-muted-foreground">
          Đừng lo lắng, hãy nhập email đăng ký của bạn. Chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.
        </p>
      </div>

      {/* Forgot Password Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
            {error}
          </div>
        )}

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email đăng ký</label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ten@thuonghieu.com"
              className="w-full rounded-xl border border-border bg-background py-3 pr-4 pl-11 text-sm text-foreground placeholder-muted-foreground/40 outline-none transition-all duration-300 focus:border-primary/50 focus:bg-card focus:ring-1 focus:ring-primary/50"
            />
            <Mail className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground/60" />
          </div>
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="relative w-full rounded-xl bg-primary py-6 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:bg-primary/95 hover:shadow-[0_0_20px_rgba(var(--color-primary),0.15)] disabled:opacity-50"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Đang gửi...
            </div>
          ) : (
            <div className="flex items-center gap-1.5 justify-center">
              Gửi yêu cầu
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </div>
          )}
        </Button>
      </form>

      {/* Back to Login */}
      <div className="text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-xs font-light text-muted-foreground hover:text-primary transition-colors duration-200"
        >
          <ArrowLeft className="size-3.5" />
          Quay lại Đăng nhập
        </Link>
      </div>
    </div>
  );
}
