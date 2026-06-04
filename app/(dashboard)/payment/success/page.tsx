"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Coins, ArrowRight, Home, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAppDispatch } from "@/store/hooks";
import { setBalance } from "@/features/credit/creditSlice";
import { apiFetch } from "@/lib/apiFetch";

type State = "processing" | "success" | "already" | "error";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const dispatch     = useAppDispatch();
  const orderCode    = searchParams.get("orderCode");

  const [state,       setState]       = useState<State>("processing");
  const [creditsGot,  setCreditsGot]  = useState<number | null>(null);
  const [newBalance,  setNewBalance]  = useState<number | null>(null);
  const [errorMsg,    setErrorMsg]    = useState<string | null>(null);

  useEffect(() => {
    if (!orderCode) { setState("error"); return; }

    const run = async () => {
      try {
        // Ask backend to verify with PayOS and credit the user if PAID
        const res  = await apiFetch(`/api/payments/${orderCode}/process`, { method: 'POST' });
        const json = await res.json();

        if (json.alreadyProcessed) {
          // Webhook already handled it — just refresh balance
          const profileRes  = await apiFetch('/api/users/profile');
          const profileJson = await profileRes.json();
          if (typeof profileJson.current_credit === 'number') {
            dispatch(setBalance(profileJson.current_credit));
            setNewBalance(profileJson.current_credit);
          }
          setState("already");
          return;
        }

        if (json.success) {
          dispatch(setBalance(json.newBalance));
          setNewBalance(json.newBalance);
          setCreditsGot(json.credits);
          setState("success");
          return;
        }

        // Not paid yet (user navigated directly or payment failed)
        setErrorMsg(json.error ?? 'Giao dịch chưa được xác nhận.');
        setState("error");
      } catch (e: any) {
        setErrorMsg(e.message ?? 'Lỗi kết nối');
        setState("error");
      }
    };

    run();
  }, [orderCode, dispatch]);

  return (
    <div className="flex h-full items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">

        {state === "processing" && (
          <>
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center justify-center size-20 rounded-full bg-muted border-2 border-border">
                <Loader2 className="size-10 text-muted-foreground animate-spin" />
              </div>
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">Đang xác nhận thanh toán...</h1>
            <p className="text-sm text-muted-foreground">Vui lòng đợi trong giây lát.</p>
          </>
        )}

        {(state === "success" || state === "already") && (
          <>
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center justify-center size-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30">
                <CheckCircle2 className="size-10 text-emerald-500" />
              </div>
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">Thanh toán thành công!</h1>
            <p className="text-sm text-muted-foreground mb-1">
              Credits đã được cộng vào tài khoản của bạn.
            </p>
            {orderCode && (
              <p className="text-xs text-muted-foreground/60 font-mono mb-4">Mã đơn: #{orderCode}</p>
            )}

            <div className="flex items-center justify-center gap-3 rounded-2xl bg-primary/8 border border-primary/15 px-5 py-3 mb-8">
              <Coins className="size-4 text-primary" />
              <div className="text-left">
                {creditsGot !== null && (
                  <p className="text-sm font-semibold text-foreground">+{creditsGot} credits</p>
                )}
                {newBalance !== null && (
                  <p className="text-xs text-muted-foreground">Số dư: {newBalance.toLocaleString()} credits</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Link href="/studio">
                <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-3 text-sm font-semibold hover:bg-primary/90 transition-colors">
                  Bắt đầu tạo ảnh ngay <ArrowRight className="size-4" />
                </button>
              </Link>
              <Link href="/dashboard">
                <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-secondary text-foreground py-3 text-sm font-medium hover:bg-secondary/70 transition-colors">
                  <Home className="size-4" /> Về trang chủ
                </button>
              </Link>
            </div>
          </>
        )}

        {state === "error" && (
          <>
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center justify-center size-20 rounded-full bg-amber-500/10 border-2 border-amber-500/30">
                <Coins className="size-10 text-amber-500" />
              </div>
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">Chưa xác nhận được</h1>
            <p className="text-sm text-muted-foreground mb-2">
              {errorMsg ?? 'Giao dịch đang chờ xử lý.'}
            </p>
            <p className="text-xs text-muted-foreground/60 mb-6">
              Nếu đã thanh toán, credits sẽ được cộng tự động trong vài phút.
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/topup">
                <button className="w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-semibold hover:bg-primary/90 transition-colors">
                  Thử lại
                </button>
              </Link>
              <Link href="/dashboard">
                <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-secondary text-foreground py-3 text-sm font-medium hover:bg-secondary/70 transition-colors">
                  <Home className="size-4" /> Về trang chủ
                </button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
