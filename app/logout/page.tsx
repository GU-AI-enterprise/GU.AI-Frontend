"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import GuaiLoader from "@/components/shared/guai-loader";

export default function LogoutPage() {
  const router = useRouter();
  const { signOut } = useAuth();

  useEffect(() => {
    const handleLogout = async () => {
      await signOut();
      router.push("/login");
    };

    handleLogout();
  }, [signOut, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <GuaiLoader size="lg" text="Đang đăng xuất..." />
    </div>
  );
}
