"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp.");
      return;
    }

    setIsLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setIsLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await supabase.auth.signOut();
    router.push("/login?reset=true");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="font-serif text-3xl font-light tracking-tight text-foreground">
          Đặt lại <span className="font-normal italic text-primary">mật khẩu</span>
        </h2>
        <p className="text-sm font-light text-muted-foreground">
          Nhập mật khẩu mới cho tài khoản của bạn.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Mật khẩu mới</label>
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
              onClick={() => setShowPassword((v) => !v)}
              className="absolute top-1/2 right-4 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nhập lại mật khẩu</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-border bg-background py-3 pr-4 pl-11 text-sm text-foreground placeholder-muted-foreground/40 outline-none transition-all duration-300 focus:border-primary/50 focus:bg-card focus:ring-1 focus:ring-primary/50"
            />
            <Lock className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground/60" />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="relative w-full rounded-xl bg-primary py-6 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:bg-primary/95 disabled:opacity-50"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Đang lưu...
            </div>
          ) : (
            <div className="flex items-center gap-1.5 justify-center">
              Lưu mật khẩu mới
              <ArrowRight className="size-4" />
            </div>
          )}
        </Button>
      </form>
    </div>
  );
}
