"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Image from "next/image";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const handleCallback = async () => {
      // OAuth PKCE flow (Google, etc.) — exchange code then go to dashboard
      const code = searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          router.push("/login?error=oauth_failed");
          return;
        }
        router.push("/dashboard");
        return;
      }

      // Email verification callback — Supabase already confirmed the email
      // server-side when the user clicked the link. Just redirect to login.
      setTimeout(() => router.push("/login?verified=true"), 2500);
    };

    handleCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
