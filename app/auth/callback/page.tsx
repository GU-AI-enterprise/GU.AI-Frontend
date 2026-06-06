"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Logo from "@/components/shared/logo";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [statusMessage, setStatusMessage] = useState("Đang thiết lập phiên đăng nhập...");
  const supabase = createClient();

  useEffect(() => {
    // Supabase will automatically parse the hash parameters (implicit flow #access_token=...)
    // on client-side and set the session.
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Lỗi lấy session:", error.message);
          setStatusMessage("Xác thực thất bại. Đang chuyển hướng về trang đăng nhập...");
          setTimeout(() => {
            router.push("/login?error=OAuthFailed");
          }, 2000);
          return;
        }

        if (session) {
          setStatusMessage("Đăng nhập thành công! Đang chuyển hướng về trang chủ...");
          setTimeout(() => {
            router.push("/dashboard");
          }, 1500);
        } else {
          // If no session found yet, wait for state to settle (sometimes hash parse takes a tick)
          const { data: authListener } = supabase.auth.onAuthStateChange((event: any, session: any) => {
            if (event === "SIGNED_IN" && session) {
              setStatusMessage("Đăng nhập thành công! Đang chuyển hướng...");
              router.push("/");
              authListener.subscription.unsubscribe();
            }
          });

          // Fallback timeout
          const timeout = setTimeout(() => {
            setStatusMessage("Đang hoàn tất đăng nhập...");
            router.push("/");
          }, 3000);

          return () => {
            clearTimeout(timeout);
            authListener.subscription.unsubscribe();
          };
        }
      } catch (err: any) {
        console.error("Callback exception:", err);
        router.push("/login?error=Exception");
      }
    };

    checkSession();
  }, [router, supabase]);

  return (
    <div className="flex flex-col min-h-[60vh] items-center justify-center text-center p-6 space-y-6 bg-background">
      {/* Animated Glowing Lotus Logo */}
      <div className="relative flex size-20 items-center justify-center rounded-2xl bg-primary/5 border border-primary/20 shadow-md">
        <div className="absolute inset-0 rounded-2xl bg-primary/10 blur-md opacity-75 animate-pulse" />
        <Logo iconOnly href="" className="scale-[2] animate-[spin_8s_linear_infinite]" />
      </div>

      <div className="space-y-2">
        <h3 className="font-serif text-xl font-medium text-foreground">
          Đang xác thực tài khoản
        </h3>
        <p className="text-xs font-light text-muted-foreground animate-pulse">
          {statusMessage}
        </p>
      </div>

      {/* Spinner */}
      <div className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}
