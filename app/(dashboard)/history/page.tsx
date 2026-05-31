"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  History,
  Sparkles,
  DollarSign,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw
} from "lucide-react";
import GuaiLoader from "@/components/shared/guai-loader";
import { supabase } from "@/lib/supabase";
import { getHistory, type AIJob, type Transaction } from "@/features/history/historyService";

export default function HistoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [aiJobs, setAiJobs] = useState<AIJob[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (error || !session?.user) {
          router.push("/login");
          return;
        }

        setAuthLoading(false);
        fetchHistory();
      } catch (err) {
        if (isMounted) router.push("/login");
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      if (event === "SIGNED_OUT" || !session?.user) {
        router.push("/login");
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await getHistory();
      setAiJobs(data.aiJobs);
      setTransactions(data.transactions);
    } catch (err) {
      console.error("Lỗi lấy lịch sử:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="size-4 text-green-400" />;
      case "failed":
        return <XCircle className="size-4 text-red-400" />;
      case "processing":
        return <RefreshCw className="size-4 text-primary animate-spin" />;
      default:
        return <Clock className="size-4 text-muted-foreground" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "failed":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "processing":
        return "bg-primary/10 text-primary border-primary/20";
      default:
        return "bg-zinc-800 text-muted-foreground";
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
        <GuaiLoader size="lg" text="Đang xác thực tài khoản..." />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-3">
            <History className="size-7 text-primary" />
            Lịch sử tác vụ
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Theo dõi tiến trình và lịch sử các tác vụ AI, giao dịch thanh toán.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <GuaiLoader size="md" text="Đang đồng bộ dữ liệu..." />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* AI Jobs History */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border border-border bg-card p-6 lg:p-8 space-y-6"
            >
              <h3 className="text-base font-bold flex items-center gap-2 border-b border-border pb-4">
                <Sparkles className="size-5 text-primary" />
                Lịch sử tác vụ AI
              </h3>

              {aiJobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
                  <Sparkles className="size-10 mb-2 text-muted-foreground" />
                  <p className="text-xs font-light text-muted-foreground">Chưa thực hiện tác vụ AI nào.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {aiJobs.map((job) => (
                    <div
                      key={job.id}
                      className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-primary">
                          Tác vụ: {job.type}
                        </span>
                        <p className="text-xs text-foreground font-semibold mt-1 truncate">
                          ID: {job.id.substr(0, 8)}...
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {new Date(job.created_at).toLocaleString("vi-VN")}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <span
                          className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${getStatusClass(job.status)}`}
                        >
                          <span className="flex items-center gap-1">
                            {getStatusIcon(job.status)}
                            {job.status}
                          </span>
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {job.credit_cost} Credits
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Transactions History */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-3xl border border-border bg-card p-6 lg:p-8 space-y-6"
            >
              <h3 className="text-base font-bold flex items-center gap-2 border-b border-border pb-4">
                <DollarSign className="size-5 text-emerald-400" />
                Lịch sử giao dịch
              </h3>

              {transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
                  <DollarSign className="size-10 mb-2 text-muted-foreground" />
                  <p className="text-xs font-light text-muted-foreground">Chưa có giao dịch nào.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                          {tx.package?.name || "Gói nạp Credit"}
                        </span>
                        <p className="text-xs text-foreground font-semibold mt-1">
                          {tx.amount.toLocaleString("vi-VN")} VNĐ
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {new Date(tx.created_at).toLocaleString("vi-VN")} &middot; {tx.provider}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <span
                          className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                            tx.status === "success"
                              ? "bg-green-500/10 text-green-400 border border-green-500/20"
                              : "bg-zinc-800 text-muted-foreground"
                          }`}
                        >
                          {tx.status === "success" ? "Thành công" : tx.status}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          +{tx.package?.credits || 0} Credits
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
