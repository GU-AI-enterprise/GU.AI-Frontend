"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useAppDispatch } from "@/store/hooks";
import { setAuth, setLoading, clearAuth } from "@/features/auth/authSlice";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          dispatch(setAuth({ user: session.user, session }));
        } else {
          dispatch(clearAuth());
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
        dispatch(clearAuth());
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        if (session) {
          dispatch(setAuth({ user: session.user, session }));
        } else {
          dispatch(clearAuth());
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, dispatch]);

  return <>{children}</>;
}
