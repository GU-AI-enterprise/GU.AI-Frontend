"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase";
import { apiClient } from "@/lib/apiFetch";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const supabase = createClient();
  
  const emailVerified = searchParams.get("verified") === "true";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const handleResendVerification = async () => {
    setIsResending(true);
    setResendMessage("");
    try {
      const res = await apiClient.post("/api/auth/resend-verification", { email });
      if (res.status >= 400) {
        setResendMessage(res.data?.error || "Không thể gửi lại email.");
      } else {
        setResendMessage("Email xác nhận đã được gửi! Kiểm tra hộp thư của bạn.");
      }
    } catch {
      setResendMessage("Lỗi kết nối, vui lòng thử lại.");
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Supabase returns "Email not confirmed" when user hasn't verified their email
        if (error.message.toLowerCase().includes('email not confirmed') ||
            error.message.toLowerCase().includes('email_not_confirmed')) {
          setEmailNotConfirmed(true);
          setError("");
        } else {
          setError(error.message);
        }
        setIsLoading(false);
        return;
      }

      // Redirect to the page user was trying to access or dashboard
      router.push(redirect);
      router.refresh();
    } catch (err: any) {
      setError("Đăng nhập thất bại. Vui lòng thử lại.");
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      return;
    }

    if (data.url) {
      window.location.href = data.url;
    }
  };

  return (
    <div className="space-y-6">
      {/* Email verified success banner */}
      {emailVerified && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 flex items-center gap-2.5">
          <span className="text-emerald-500 text-base leading-none">✓</span>
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            Email đã được xác nhận thành công! Bạn có thể đăng nhập ngay bây giờ.
          </p>
        </div>
      )}

      {/* Title & Description */}
      <div className="space-y-2">
        <h2 className="font-serif text-3xl font-light tracking-tight text-foreground">
          Chào mừng <span className="font-normal italic text-primary">quay lại</span>
        </h2>
        <p className="text-sm font-light text-muted-foreground">
          Đăng nhập vào tài khoản GU.AI của bạn để bắt đầu tạo mẫu ảo.
        </p>
      </div>

      {/* Social Login */}
      <button
        onClick={handleGoogleLogin}
        type="button"
        className="cursor-pointer group relative flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-all duration-300 hover:bg-secondary hover:border-primary/30 hover:shadow-sm active:scale-[0.98]"
      >
        {/* Google Icon */}
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
        Đăng nhập với Google
      </button>

      {/* Divider */}
      <div className="flex items-center gap-4 py-1">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs uppercase tracking-wider text-muted-foreground/40 font-mono">hoặc</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
            {error}
          </div>
        )}

        {emailNotConfirmed && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-2.5">
            <div className="flex items-start gap-2.5">
              <span className="text-amber-500 text-base leading-none mt-0.5">⚠️</span>
              <div>
                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-0.5">
                  Email chưa được xác nhận
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Vui lòng kiểm tra hộp thư <strong>{email}</strong> và nhấn link xác nhận để đăng nhập.
                </p>
              </div>
            </div>
            {resendMessage && (
              <p className={`text-xs font-medium pl-7 ${resendMessage.includes("Lỗi") || resendMessage.includes("thể") ? "text-destructive" : "text-emerald-500"}`}>
                {resendMessage}
              </p>
            )}
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={isResending}
              className="pl-7 text-xs text-primary hover:text-primary/80 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {isResending ? (
                <><span className="size-3 animate-spin rounded-full border-2 border-primary border-t-transparent" /> Đang gửi...</>
              ) : (
                "→ Gửi lại email xác nhận"
              )}
            </button>
          </div>
        )}

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</label>
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
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Mật khẩu</label>
            <Link
              href="/forgot-password"
              className="text-xs text-primary/80 hover:text-primary transition-colors duration-200"
            >
              Quên mật khẩu?
            </Link>
          </div>
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
              className="cursor-pointer absolute top-1/2 right-4 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        {/* Remember me */}
        <div className="flex items-center gap-2.5 pt-1">
          <input
            type="checkbox"
            id="remember-me"
            className="size-4 rounded border-border bg-background text-primary focus:ring-primary/50"
          />
          <label htmlFor="remember-me" className="text-xs font-light text-muted-foreground select-none cursor-pointer">
            Ghi nhớ đăng nhập
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
              Đang xác thực...
            </div>
          ) : (
            <div className="flex items-center gap-1.5 justify-center">
              Đăng nhập
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </div>
          )}
        </Button>
      </form>

      {/* Switch to Signup */}
      <div className="text-center text-xs font-light text-muted-foreground">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-8">
        <span className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
