"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { XCircle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

function CancelContent() {
  const searchParams = useSearchParams();
  const orderCode = searchParams.get("orderCode");

  return (
    <div className="flex h-full items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">

        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center justify-center size-20 rounded-full bg-muted border-2 border-border">
            <XCircle className="size-10 text-muted-foreground" />
          </div>
        </div>

        <h1 className="text-xl font-bold text-foreground mb-2">Thanh toán đã hủy</h1>
        <p className="text-sm text-muted-foreground mb-1">
          Bạn đã hủy giao dịch. Không có khoản nào bị trừ.
        </p>
        {orderCode && (
          <p className="text-xs text-muted-foreground/60 font-mono mb-8">
            Mã đơn: #{orderCode}
          </p>
        )}

        <div className="flex flex-col gap-3 mt-6">
          <Link href="/topup">
            <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-3 text-sm font-semibold hover:bg-primary/90 transition-colors">
              <RotateCcw className="size-4" />
              Thử lại
            </button>
          </Link>
          <Link href="/dashboard">
            <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-secondary text-foreground py-3 text-sm font-medium hover:bg-secondary/70 transition-colors">
              <Home className="size-4" />
              Về trang chủ
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense>
      <CancelContent />
    </Suspense>
  );
}
