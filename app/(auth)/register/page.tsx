"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/apiFetch";

export default function RegisterPage() {
  // Keep both UIs in the DOM at all times — toggling CSS only.
  // Conditional unmounting causes removeChild crashes when browser extensions
  // inject extra DOM nodes into password inputs.
  const [isPending, setIsPending] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [resendMessage, setResendMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await apiClient.post("/api/auth/register", { email, password, name });

      if (res.status >= 400) {
        setError(res.data?.error || "Đăng ký thất bại. Vui lòng thử lại.");
        setIsLoading(false);
        return;
      }

      // Switch to verification view via CSS — form stays in DOM, no unmount
      setIsPending(true);
    } catch {
      setError("Đăng ký thất bại. Vui lòng thử lại.");
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setResendMessage("");
    try {
      const res = await apiClient.post("/api/auth/resend-verification", { email });
      if (res.status >= 400) {
        setResendMessage(res.data?.error || "Không thể gửi lại email.");
      } else {
        setResendMessage("Email xác nhận đã được gửi lại! Kiểm tra hộp thư của bạn.");
      }
    } catch {
      setResendMessage("Lỗi kết nối, vui lòng thử lại.");
    } finally {
      setIsResending(false);
    }
  };

  const handleGoogleSignup = async () => {
    const { createClient } = await import("@/lib/supabase");
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setError(error.message); return; }
    if (data.url) window.location.href = data.url;
  };

  return (
    <div>
      {/* ── Pending verification (CSS-visible only when isPending) ──────────── */}
      <div className={isPending ? "space-y-6 text-center" : "hidden"}>
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary">
          <svg className="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <div className="space-y-2">
          <h3 className="font-serif text-2xl font-light text-foreground">Kiểm tra email của bạn</h3>
          <p className="text-sm font-light text-muted-foreground leading-relaxed">
            Chúng tôi đã gửi link xác nhận đến
          </p>
          <p className="text-sm font-semibold text-primary">{email}</p>
          <p className="text-xs text-muted-foreground/70 leading-relaxed pt-1">
            Nhấn vào link trong email để kích hoạt tài khoản.<br />
            Link có hiệu lực trong <strong>24 giờ</strong>.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card/50 p-4 text-left space-y-2.5">
          {[
            { n: "1", text: "Mở email từ GU.AI trong hộp thư của bạn" },
            { n: "2", text: 'Nhấn nút "Xác nhận Email" trong email' },
            { n: "3", text: "Quay lại trang đăng nhập và đăng nhập vào tài khoản" },
          ].map(({ n, text }) => (
            <div key={n} className="flex items-start gap-3">
              <span className="flex-shrink-0 flex size-5 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-bold">
                {n}
              </span>
              <span className="text-xs text-muted-foreground leading-relaxed">{text}</span>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground/60">
          Không thấy email? Kiểm tra thư mục <strong>Spam / Junk</strong>.
        </p>

        {resendMessage && (
          <p className={`text-xs font-medium ${resendMessage.includes("Lỗi") || resendMessage.includes("thể") ? "text-destructive" : "text-emerald-500"}`}>
            {resendMessage}
          </p>
        )}

        <button
          onClick={handleResend}
          disabled={isResending}
          className="inline-flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`size-3 ${isResending ? "animate-spin" : ""}`} />
          {isResending ? "Đang gửi..." : "Gửi lại email xác nhận"}
        </button>

        <div className="pt-2">
          <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            ← Quay lại đăng nhập
          </Link>
        </div>
      </div>

      {/* ── Register form (CSS-visible only when !isPending) ─────────────────── */}
      <div className={isPending ? "hidden" : "space-y-6"}>
        <div className="space-y-2">
          <h2 className="font-serif text-3xl font-light tracking-tight text-foreground">
            Đăng ký <span className="font-normal italic text-primary">tài khoản</span>
          </h2>
          <p className="text-sm font-light text-muted-foreground">
            Bắt đầu hành trình tạo ảnh mẫu ảo đột phá cho thương hiệu của bạn.
          </p>
        </div>

        <button
          onClick={handleGoogleSignup}
          type="button"
          className="cursor-pointer group relative flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-all duration-300 hover:bg-secondary hover:border-primary/30 hover:shadow-sm active:scale-[0.98]"
        >
          <svg className="size-5 transition-transform duration-300 group-hover:scale-105" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
          </svg>
          Đăng ký bằng Google
        </button>

        <div className="flex items-center gap-4 py-1">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs uppercase tracking-wider text-muted-foreground/40 font-mono">hoặc</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          {error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Họ và tên / Thương hiệu</label>
            <div className="relative">
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Nguyen Van A" autoComplete="name"
                className="w-full rounded-xl border border-border bg-background py-3 pr-4 pl-11 text-sm text-foreground placeholder-muted-foreground/40 outline-none transition-all duration-300 focus:border-primary/50 focus:bg-card focus:ring-1 focus:ring-primary/50" />
              <User className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground/60" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email liên hệ</label>
            <div className="relative">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="ten@thuonghieu.com" autoComplete="email"
                className="w-full rounded-xl border border-border bg-background py-3 pr-4 pl-11 text-sm text-foreground placeholder-muted-foreground/40 outline-none transition-all duration-300 focus:border-primary/50 focus:bg-card focus:ring-1 focus:ring-primary/50" />
              <Mail className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground/60" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Mật khẩu</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} required value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password"
                className="w-full rounded-xl border border-border bg-background py-3 pr-11 pl-11 text-sm text-foreground placeholder-muted-foreground/40 outline-none transition-all duration-300 focus:border-primary/50 focus:bg-card focus:ring-1 focus:ring-primary/50" />
              <Lock className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground/60" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="cursor-pointer absolute top-1/2 right-4 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors">
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Xác nhận mật khẩu</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} required value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password"
                className="w-full rounded-xl border border-border bg-background py-3 pr-11 pl-11 text-sm text-foreground placeholder-muted-foreground/40 outline-none transition-all duration-300 focus:border-primary/50 focus:bg-card focus:ring-1 focus:ring-primary/50" />
              <Lock className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground/60" />
            </div>
          </div>

          <div className="flex items-start gap-2.5 pt-1">
            <input type="checkbox" required id="terms"
              className="mt-0.5 size-4 rounded border-border bg-background text-primary focus:ring-primary/50" />
            <label htmlFor="terms" className="text-xs font-light text-muted-foreground leading-normal select-none cursor-pointer">
              Tôi đồng ý với{" "}
              <Link href="/terms" className="text-primary hover:underline font-normal">Điều khoản Dịch vụ</Link>{" "}
              và{" "}
              <Link href="/privacy" className="text-primary hover:underline font-normal">Chính sách Bảo mật</Link>
            </label>
          </div>

          <Button type="submit" disabled={isLoading}
            className="relative w-full rounded-xl bg-primary py-6 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:bg-primary/95 hover:shadow-[0_0_20px_rgba(var(--color-primary),0.15)] disabled:opacity-50">
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

        <div className="text-center text-xs font-light text-muted-foreground">
          Đã có tài khoản?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">Đăng nhập ngay</Link>
        </div>
      </div>
    </div>
  );
}
