"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/apiFetch";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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

      // Tài khoản đã xác nhận sẵn — đăng nhập luôn rồi vào dashboard
      const { createClient } = await import("@/lib/supabase");
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        router.push("/login");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Đăng ký thất bại. Vui lòng thử lại.");
      setIsLoading(false);
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
      <div className="space-y-5">
        <div className="space-y-1">
          <h2 className="font-serif text-3xl font-light tracking-tight text-foreground">
            Đăng ký <span className="font-normal italic text-primary">tài khoản</span>
          </h2>
          <p className="text-sm font-light text-muted-foreground">
            Bắt đầu hành trình tạo ảnh mẫu ảo với GU.AI.
          </p>
        </div>

        {/* Google */}
        <button onClick={handleGoogleSignup} type="button"
          className="cursor-pointer group relative flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-all duration-300 hover:bg-secondary hover:border-primary/30 hover:shadow-sm active:scale-[0.98]">
          <svg className="size-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
          </svg>
          Đăng ký bằng Google
        </button>

        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs uppercase tracking-wider text-muted-foreground/40 font-mono">hoặc</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5" autoComplete="off">
          {/* Error — always in DOM, CSS-toggled */}
          <div className={error ? "rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive" : "hidden"}>
            {error}
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Họ và tên / Thương hiệu</label>
            <div className="relative">
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Nguyen Van A" autoComplete="name"
                className="w-full rounded-xl border border-border bg-background py-3 pr-4 pl-11 text-sm text-foreground placeholder-muted-foreground/40 outline-none transition-all duration-300 focus:border-primary/50 focus:bg-card focus:ring-1 focus:ring-primary/50" />
              <User className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground/60" />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email liên hệ</label>
            <div className="relative">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="ten@thuonghieu.com" autoComplete="email"
                className="w-full rounded-xl border border-border bg-background py-3 pr-4 pl-11 text-sm text-foreground placeholder-muted-foreground/40 outline-none transition-all duration-300 focus:border-primary/50 focus:bg-card focus:ring-1 focus:ring-primary/50" />
              <Mail className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground/60" />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Mật khẩu</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} required value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password"
                className="w-full rounded-xl border border-border bg-background py-3 pr-11 pl-11 text-sm text-foreground placeholder-muted-foreground/40 outline-none transition-all duration-300 focus:border-primary/50 focus:bg-card focus:ring-1 focus:ring-primary/50" />
              <Lock className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground/60" />
              {/* Both icons always in DOM — CSS-toggled to avoid removeChild crash */}
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="cursor-pointer absolute top-1/2 right-4 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors">
                <Eye className={showPassword ? "hidden" : "size-4"} />
                <EyeOff className={showPassword ? "size-4" : "hidden"} />
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Xác nhận mật khẩu</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} required value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password"
                className="w-full rounded-xl border border-border bg-background py-3 pr-4 pl-11 text-sm text-foreground placeholder-muted-foreground/40 outline-none transition-all duration-300 focus:border-primary/50 focus:bg-card focus:ring-1 focus:ring-primary/50" />
              <Lock className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground/60" />
            </div>
          </div>

          {/* Terms */}
          <div className="flex items-start gap-2.5">
            <input type="checkbox" required id="terms"
              className="mt-0.5 size-4 rounded border-border bg-background text-primary focus:ring-primary/50 flex-shrink-0" />
            <label htmlFor="terms" className="text-xs font-light text-muted-foreground leading-normal select-none cursor-pointer">
              Tôi đồng ý với{" "}
              <Link href="/terms" className="text-primary hover:underline font-normal">Điều khoản Dịch vụ</Link>{" "}và{" "}
              <Link href="/privacy" className="text-primary hover:underline font-normal">Chính sách Bảo mật</Link>
            </label>
          </div>

          {/* Submit */}
          <Button type="submit" disabled={isLoading}
            className="relative w-full rounded-xl bg-primary py-6 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:bg-primary/95 hover:shadow-[0_0_20px_rgba(var(--color-primary),0.15)] disabled:opacity-50">
            <div className={isLoading ? "flex items-center gap-2" : "hidden"}>
              <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Đang đăng ký...
            </div>
            <div className={isLoading ? "hidden" : "flex items-center gap-1.5 justify-center"}>
              Đăng ký
              <ArrowRight className="size-4" />
            </div>
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
