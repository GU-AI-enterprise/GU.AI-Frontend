"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      setIsLoading(false);
      return;
    }

    // Simulate signup for frontend demonstration
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }, 1500);
  };

  const handleGoogleSignup = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/oauth/google`;
  };

  if (success) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
          <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="space-y-2">
          <h3 className="font-serif text-2xl font-light text-white">Đăng ký thành công!</h3>
          <p className="text-sm font-light text-muted-foreground leading-relaxed">
            Chào mừng bạn đến với GU.AI. Chúng tôi đang chuyển hướng bạn đến trang đăng nhập...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title & Description */}
      <div className="space-y-2">
        <h2 className="font-serif text-3xl font-light tracking-tight text-foreground">
          Đăng ký <span className="font-normal italic text-primary">tài khoản</span>
        </h2>
        <p className="text-sm font-light text-muted-foreground">
          Bắt đầu hành trình tạo ảnh mẫu ảo đột phá cho thương hiệu của bạn.
        </p>
      </div>

      {/* Social Register */}
      <button
        onClick={handleGoogleSignup}
        type="button"
        className="group relative flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-all duration-300 hover:bg-secondary hover:border-primary/30 hover:shadow-sm active:scale-[0.98]"
      >
        <svg className="size-5 transition-transform duration-300 group-hover:scale-105" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            fill="#EA4335"
          />
        </svg>
        Đăng ký bằng Google
      </button>

      {/* Divider */}
      <div className="flex items-center gap-4 py-1">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs uppercase tracking-wider text-muted-foreground/40 font-mono">hoặc</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Register Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
            {error}
          </div>
        )}

        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Họ và tên / Thương hiệu</label>
          <div className="relative">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nguyen Van A"
              className="w-full rounded-xl border border-border bg-background py-3 pr-4 pl-11 text-sm text-foreground placeholder-muted-foreground/40 outline-none transition-all duration-300 focus:border-primary/50 focus:bg-card focus:ring-1 focus:ring-primary/50"
            />
            <User className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground/60" />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email liên hệ</label>
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

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Mật khẩu</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-border bg-background py-3 pr-11 pl-11 text-sm text-foreground placeholder-muted-foreground/40 outline-none transition-all duration-300 focus:border-primary/50 focus:bg-card focus:ring-1 focus:ring-primary/50"
            />
            <Lock className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground/60" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-4 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Xác nhận mật khẩu</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-border bg-background py-3 pr-11 pl-11 text-sm text-foreground placeholder-muted-foreground/40 outline-none transition-all duration-300 focus:border-primary/50 focus:bg-card focus:ring-1 focus:ring-primary/50"
            />
            <Lock className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground/60" />
          </div>
        </div>

        {/* Terms checkbox */}
        <div className="flex items-start gap-2.5 pt-1">
          <input
            type="checkbox"
            required
            id="terms"
            className="mt-0.5 size-4 rounded border-border bg-background text-primary focus:ring-primary/50"
          />
          <label htmlFor="terms" className="text-xs font-light text-muted-foreground leading-normal select-none cursor-pointer">
            Tôi đồng ý với{" "}
            <Link href="/terms" className="text-primary hover:underline font-normal">
              Điều khoản Dịch vụ
            </Link>{" "}
            và{" "}
            <Link href="/privacy" className="text-primary hover:underline font-normal">
              Chính sách Bảo mật
            </Link>
          </label>
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
              Đang đăng ký...
            </div>
          ) : (
            <div className="flex items-center gap-1.5 justify-center">
              Đăng ký
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </div>
          )}
        </Button>
      </form>

      {/* Switch to Login */}
      <div className="text-center text-xs font-light text-muted-foreground">
        Đã có tài khoản?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline font-normal">
          Đăng nhập ngay
        </Link>
      </div>
    </div>
  );
}
