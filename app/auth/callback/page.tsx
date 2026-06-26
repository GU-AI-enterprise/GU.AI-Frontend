"use client";

import { useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Image from "next/image";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const ranRef = useRef(false);

  useEffect(() => {
    // Tránh chạy 2 lần (React Strict Mode ở dev mount effect 2 lần) — code PKCE chỉ dùng được 1 lần,
    // chạy lần 2 sẽ luôn lỗi "invalid grant" và làm mất kết quả của lần chạy đầu (đã thành công).
    if (ranRef.current) return;
    ranRef.current = true;

    const handleCallback = async () => {
      try {
        // OAuth PKCE flow (Google, etc.) or password-recovery flow — both arrive with ?code=
        const code = searchParams.get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error("[auth/callback] exchangeCodeForSession lỗi:", error.message);
            router.push(`/login?error=oauth_failed&reason=${encodeURIComponent(error.message)}`);
            return;
          }
          if (searchParams.get("type") === "recovery") {
            router.push("/reset-password");
            return;
          }
          router.push("/dashboard");
          router.refresh();
          return;
        }

        // Email verification callback — Supabase đã xác nhận email server-side khi user bấm link.
        setTimeout(() => router.push("/login?verified=true"), 2500);
      } catch (err: any) {
        console.error("[auth/callback] exception:", err);
        router.push(`/login?error=oauth_failed&reason=${encodeURIComponent(err?.message ?? "unknown")}`);
      }
    };

    handleCallback();
  }, [router, searchParams, supabase]);

  return (
    <div className="flex flex-col min-h-[60vh] items-center justify-center text-center p-6 space-y-6 bg-background">
      <Image
        src="/animation/auth_animation2.gif"
        alt="Đang xác thực..."
        width={180}
        height={180}
        unoptimized
        className="object-contain"
      />
      <div className="space-y-2">
        <h3 className="font-serif text-xl font-medium text-foreground">
          Email đã được xác nhận!
        </h3>
        <p className="text-xs font-light text-muted-foreground animate-pulse">
          Đang chuyển đến trang đăng nhập...
        </p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
