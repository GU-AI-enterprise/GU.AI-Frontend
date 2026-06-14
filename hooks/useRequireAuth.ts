"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function useRequireAuth() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return;
      if (error || !session?.user) { router.push("/login"); return; }
      setReady(true);
    }).catch(() => { if (mounted) router.push("/login"); });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === "SIGNED_OUT" || !session?.user) router.push("/login");
    });

    return () => { mounted = false; subscription.unsubscribe(); };
  }, [router]);

  return ready;
}
