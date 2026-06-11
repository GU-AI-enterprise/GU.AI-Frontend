"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  History,
  Sparkles,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Cpu,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import GuaiLoader from "@/components/shared/guai-loader";
import { supabase } from "@/lib/supabase";
import { getHistory, type AIJob, type Transaction } from "@/features/history/historyService";
import { ScrollArea } from "@/components/ui/scroll-area";

// ─── Helpers ────────────────────────────────────────────────────────────────

const JOB_TYPE_LABELS: Record<string, string> = {
  try_on: "Virtual Try-On",
  try_on_max: "Try-On Max",
  remove_bg: "Xóa nền",
  product_to_model: "Product to Model",
  reframe: "Reframe",
  edit: "Chỉnh sửa ảnh",
};

function formatDuration(startedAt?: string, completedAt?: string): string | null {
  if (!startedAt || !completedAt) return null;
  const ms = new Date(completedAt).getTime() - new Date(startedAt).getTime();
  if (ms < 0) return null;
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
}

function formatInputParams(params?: Record<string, unknown>): [string, string][] {
  if (!params || Object.keys(params).length === 0) return [];
  const labelMap: Record<string, string> = {
    category: "Danh mục",
    mode: "Chế độ",
    resolution: "Độ phân giải",
    generationMode: "Chế độ tạo",
    numImages: "Số ảnh",
    aspectRatio: "Tỉ lệ khung",
  };
  return Object.entries(params)
    .filter(([, v]) => typeof v === "string" || typeof v === "number" || typeof v === "boolean")
    .map(([k, v]) => [labelMap[k] ?? k, String(v)]);
}

// ─── JobCard ─────────────────────────────────────────────────────────────────

function JobCard({ job }: { job: AIJob }) {
  const [expanded, setExpanded] = useState(false);

  const statusIcon = ({
    completed: <CheckCircle2 className="size-3.5 text-green-400" />,
    failed: <XCircle className="size-3.5 text-red-400" />,
    processing: <RefreshCw className="size-3.5 text-primary animate-spin" />,
    cancelled: <X className="size-3.5 text-muted-foreground" />,
    queued: <Clock className="size-3.5 text-muted-foreground" />,
  } as Record<string, React.ReactElement>)[job.status] ?? <Clock className="size-3.5 text-muted-foreground" />;

  const statusClass = ({
    completed: "bg-green-500/10 text-green-400 border-green-500/20",
    failed: "bg-red-500/10 text-red-400 border-red-500/20",
    processing: "bg-primary/10 text-primary border-primary/20",
    cancelled: "bg-zinc-800 text-muted-foreground border-transparent",
    queued: "bg-zinc-800 text-muted-foreground border-transparent",
  } as Record<string, string>)[job.status] ?? "bg-zinc-800 text-muted-foreground border-transparent";

  const inputRows = formatInputParams(job.input_params);
  const duration = formatDuration(job.started_at, job.completed_at);
  const typeLabel = JOB_TYPE_LABELS[job.type] ?? job.type;
  const hasDetails = !!(job.started_at || job.completed_at || job.error_message || job.provider || inputRows.length);

  return (
    <div className="rounded-2xl bg-background border border-border overflow-hidden">
      <button
        type="button"
        onClick={() => hasDetails && setExpanded((p) => !p)}
        className={`w-full p-3.5 flex items-center justify-between gap-3 text-left transition-colors ${
          hasDetails ? "hover:bg-secondary/40 cursor-pointer" : "cursor-default"
        }`}
      >
        <div className="min-w-0 flex-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-primary">{typeLabel}</span>
          <p className="text-xs text-foreground font-semibold mt-0.5 font-mono">
            {job.id.substring(0, 8)}<span className="text-muted-foreground">…</span>
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {new Date(job.created_at).toLocaleString("vi-VN")}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border flex items-center gap-1 ${statusClass}`}>
            {statusIcon}
            {job.status}
          </span>
          <span className="text-[10px] text-muted-foreground">{job.credit_cost} Credits</span>
          {hasDetails && (
            expanded
              ? <ChevronUp className="size-3 text-muted-foreground" />
              : <ChevronDown className="size-3 text-muted-foreground" />
          )}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && hasDetails && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="px-3.5 pb-3.5 pt-1 border-t border-border space-y-2.5 text-[11px]">
              <div className="grid grid-cols-2 gap-2">
                {job.started_at && (
                  <div>
                    <p className="text-muted-foreground mb-0.5">Bắt đầu xử lý</p>
                    <p className="text-foreground font-medium">
                      {new Date(job.started_at).toLocaleTimeString("vi-VN")}
                    </p>
                  </div>
                )}
                {job.completed_at && (
                  <div>
                    <p className="text-muted-foreground mb-0.5">Hoàn thành</p>
                    <p className="text-foreground font-medium">
                      {new Date(job.completed_at).toLocaleTimeString("vi-VN")}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                {duration && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="size-3" />
                    <span>Thời gian: <span className="text-foreground font-medium">{duration}</span></span>
                  </div>
                )}
                {job.provider && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Cpu className="size-3" />
                    <span>Provider: <span className="text-foreground font-medium capitalize">{job.provider}</span></span>
                  </div>
                )}
              </div>

              {inputRows.length > 0 && (
                <div>
                  <p className="text-muted-foreground mb-1.5">Tham số</p>
                  <div className="flex flex-wrap gap-1.5">
                    {inputRows.map(([label, value]) => (
                      <span key={label} className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px]">
                        <span className="text-muted-foreground">{label}:</span>
                        <span className="text-foreground font-medium">{value}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {job.error_message && job.status === "failed" && (
                <div className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-red-400">
                  <AlertCircle className="size-3.5 mt-0.5 flex-shrink-0" />
                  <p className="leading-relaxed break-words">{job.error_message}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Pagination ──────────────────────────────────────────────────────────────

function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (p: number) => void;
}) {
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground select-none">
      <span className="text-[11px]">
        {total === 0 ? "0 kết quả" : `${from}–${to} / ${total}`}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex size-7 items-center justify-center rounded-lg border border-border hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="size-3.5" />
        </button>
        <span className="min-w-[56px] text-center text-[11px] font-medium text-foreground">
          {page} / {totalPages || 1}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="flex size-7 items-center justify-center rounded-lg border border-border hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

export default function HistoryPage() {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [aiJobs, setAiJobs] = useState<AIJob[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [jobPage, setJobPage] = useState(1);
  const [jobTotalPages, setJobTotalPages] = useState(1);
  const [jobTotal, setJobTotal] = useState(0);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const authedRef = useRef(false);

  const fetchHistory = useCallback(async (page: number, from: string, to: string) => {
    setLoading(true);
    try {
      const data = await getHistory({
        jobPage: page,
        jobLimit: PAGE_SIZE,
        jobDateFrom: from || undefined,
        jobDateTo: to || undefined,
      });
      setAiJobs(data.aiJobs);
      setJobTotalPages(data.aiJobsTotalPages);
      setJobTotal(data.aiJobsTotal);
      setTransactions(data.transactions);
    } catch (err) {
      console.error("Lỗi lấy lịch sử:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return;
      if (error || !session?.user) { router.push("/login"); return; }
      setAuthLoading(false);
      authedRef.current = true;
      fetchHistory(1, "", "");
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === "SIGNED_OUT" || !session?.user) router.push("/login");
    });

    return () => { mounted = false; subscription.unsubscribe(); };
  }, [router, fetchHistory]);

  const handleDateFrom = (val: string) => {
    setDateFrom(val);
    setJobPage(1);
    fetchHistory(1, val, dateTo);
  };

  const handleDateTo = (val: string) => {
    setDateTo(val);
    setJobPage(1);
    fetchHistory(1, dateFrom, val);
  };

  const clearDates = () => {
    setDateFrom("");
    setDateTo("");
    setJobPage(1);
    fetchHistory(1, "", "");
  };

  const handlePageChange = (page: number) => {
    setJobPage(page);
    fetchHistory(page, dateFrom, dateTo);
  };

  const txStatusClass = (status: string) => {
    if (status === "success")   return "bg-green-500/10 text-green-400 border border-green-500/20";
    if (status === "pending")   return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
    if (status === "failed")    return "bg-red-500/10 text-red-400 border border-red-500/20";
    if (status === "cancelled") return "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20";
    return "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20";
  };

  if (authLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <GuaiLoader size="lg" text="Đang xác thực tài khoản..." />
      </div>
    );
  }

  const hasDateFilter = !!(dateFrom || dateTo);

  return (
    <div className="h-full overflow-hidden flex flex-col px-6 py-8 lg:px-8">
      {/* Header */}
      <div className="flex-shrink-0 mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-3">
          <History className="size-7 text-primary" />
          Lịch sử tác vụ
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Theo dõi tiến trình và lịch sử các tác vụ AI, giao dịch thanh toán.
        </p>
      </div>

      {/* Grid */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── AI Jobs Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col rounded-3xl border border-border bg-card overflow-hidden min-h-[380px]"
        >
          {/* Card header */}
          <div className="flex-shrink-0 px-5 pt-5 pb-4 border-b border-border space-y-3">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              Lịch sử tác vụ AI
            </h3>

            {/* Date filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <CalendarDays className="size-3.5" />
                <span>Lọc theo ngày:</span>
              </div>
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => handleDateFrom(e.target.value)}
                  max={dateTo || undefined}
                  className="flex-1 min-w-0 rounded-lg border border-border bg-background px-2 py-1 text-[11px] text-foreground outline-none focus:border-primary"
                />
                <span className="text-[10px] text-muted-foreground flex-shrink-0">→</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => handleDateTo(e.target.value)}
                  min={dateFrom || undefined}
                  className="flex-1 min-w-0 rounded-lg border border-border bg-background px-2 py-1 text-[11px] text-foreground outline-none focus:border-primary"
                />
                {hasDateFilter && (
                  <button
                    onClick={clearDates}
                    className="flex-shrink-0 flex size-6 items-center justify-center rounded-lg border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                    title="Xóa bộ lọc"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* List */}
          <ScrollArea className="flex-1 min-h-0">
          <div className="px-5 py-4 space-y-2.5">
            {loading ? (
              <div className="flex h-full items-center justify-center py-10">
                <GuaiLoader size="sm" text="Đang tải..." />
              </div>
            ) : aiJobs.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center py-10 text-center">
                <Sparkles className="size-9 mb-2 text-muted-foreground/40" />
                <p className="text-xs text-muted-foreground">
                  {hasDateFilter ? "Không có tác vụ trong khoảng thời gian này." : "Chưa thực hiện tác vụ AI nào."}
                </p>
              </div>
            ) : (
              aiJobs.map((job) => <JobCard key={job.id} job={job} />)
            )}
          </div>
          </ScrollArea>

          {/* Pagination */}
          <div className="flex-shrink-0 px-5 py-3 border-t border-border">
            <Pagination
              page={jobPage}
              totalPages={jobTotalPages}
              total={jobTotal}
              limit={PAGE_SIZE}
              onPageChange={handlePageChange}
            />
          </div>
        </motion.div>

        {/* ── Transactions Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="flex flex-col rounded-3xl border border-border bg-card overflow-hidden min-h-[380px]"
        >
          {/* Card header */}
          <div className="flex-shrink-0 px-5 pt-5 pb-4 border-b border-border">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <DollarSign className="size-4 text-emerald-400" />
              Lịch sử giao dịch
            </h3>
          </div>

          {/* List */}
          <ScrollArea className="flex-1 min-h-0">
          <div className="px-5 py-4 space-y-2.5">
            {transactions.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center py-10 text-center">
                <DollarSign className="size-9 mb-2 text-muted-foreground/40" />
                <p className="text-xs text-muted-foreground">Chưa có giao dịch nào.</p>
              </div>
            ) : (
              transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3.5 rounded-2xl bg-background border border-border flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      {tx.package?.name || "Gói nạp Credit"}
                    </span>
                    <p className="text-xs text-foreground font-semibold mt-0.5">
                      {tx.amount.toLocaleString("vi-VN")} VNĐ
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {new Date(tx.created_at).toLocaleString("vi-VN")} &middot; {tx.provider}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${txStatusClass(tx.status)}`}>
                      {tx.status === "success" ? "Thành công" : tx.status}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      +{tx.package?.credits || 0} Credits
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          </ScrollArea>
        </motion.div>
      </div>
    </div>
  );
}
