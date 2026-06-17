"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  History,
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
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useHistoryData } from "@/features/history/hooks";
import type { AIJob, Transaction } from "@/features/history/historyService";
import { timeAgo } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

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

// Build a compact page list with ellipsis: 1 2 3 4 5 … N
function buildPageList(page: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages = new Set<number>([1, 2, totalPages - 1, totalPages, page - 1, page, page + 1]);
  const sorted = Array.from(pages).filter(p => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const result: (number | "...")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push("...");
    result.push(p);
    prev = p;
  }
  return result;
}

// ─── Status pill ────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { icon: React.ReactElement; cls: string; label: string }> = {
    completed:  { icon: <CheckCircle2 className="size-3" />, cls: "bg-emerald-500/10 text-emerald-500", label: "Hoàn thành" },
    success:    { icon: <CheckCircle2 className="size-3" />, cls: "bg-emerald-500/10 text-emerald-500", label: "Thành công" },
    failed:     { icon: <XCircle className="size-3" />,      cls: "bg-red-500/10 text-red-500",        label: "Thất bại" },
    processing: { icon: <RefreshCw className="size-3 animate-spin" />, cls: "bg-amber-500/10 text-amber-500", label: "Đang xử lý" },
    pending:    { icon: <Clock className="size-3" />,        cls: "bg-amber-500/10 text-amber-500",    label: "Chờ xử lý" },
    queued:     { icon: <Clock className="size-3" />,        cls: "bg-secondary text-muted-foreground", label: "Trong hàng đợi" },
    cancelled:  { icon: <X className="size-3" />,             cls: "bg-secondary text-muted-foreground", label: "Đã hủy" },
  };
  const m = map[status] ?? { icon: <Clock className="size-3" />, cls: "bg-secondary text-muted-foreground", label: status };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${m.cls}`}>
      {m.icon}{m.label}
    </span>
  );
}

// ─── AI Jobs table ──────────────────────────────────────────────────────────

function JobsTable({ jobs, loading, hasDateFilter }: { jobs: AIJob[]; loading: boolean; hasDateFilter: boolean }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (loading) {
    return <div className="flex items-center justify-center py-16"><GuaiLoader size="sm" text="Đang tải..." /></div>;
  }
  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-xs text-muted-foreground">
          {hasDateFilter ? "Không có tác vụ trong khoảng thời gian này." : "Chưa thực hiện tác vụ AI nào."}
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Tác vụ</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead>Bắt đầu</TableHead>
          <TableHead>Hoàn thành</TableHead>
          <TableHead>Thời lượng</TableHead>
          <TableHead className="text-right">Credit</TableHead>
          <TableHead className="w-8" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobs.map((job) => {
          const inputRows = formatInputParams(job.input_params);
          const duration = formatDuration(job.started_at, job.completed_at);
          const typeLabel = JOB_TYPE_LABELS[job.type] ?? job.type;
          const hasDetails = !!(job.started_at || job.completed_at || job.error_message || job.provider || inputRows.length);
          const expanded = expandedId === job.id;

          return (
            <React.Fragment key={job.id}>
              <TableRow
                onClick={() => hasDetails && setExpandedId(expanded ? null : job.id)}
                className={hasDetails ? "cursor-pointer" : ""}
              >
                <TableCell>
                  <p className="text-xs font-medium text-foreground">{typeLabel}</p>
                  <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{job.id.slice(0, 8)}…</p>
                </TableCell>
                <TableCell><StatusPill status={job.status} /></TableCell>
                <TableCell className="text-xs text-muted-foreground">{timeAgo(job.created_at)}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{job.completed_at ? timeAgo(job.completed_at) : "—"}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{duration ?? "—"}</TableCell>
                <TableCell className="text-xs text-muted-foreground text-right">{job.credit_cost} cr</TableCell>
                <TableCell className="px-2 text-right">
                  {hasDetails && (
                    expanded
                      ? <ChevronUp className="size-3.5 text-muted-foreground inline" />
                      : <ChevronDown className="size-3.5 text-muted-foreground inline" />
                  )}
                </TableCell>
              </TableRow>
              <AnimatePresence initial={false}>
                {expanded && hasDetails && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={7} className="p-0">
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="overflow-hidden bg-secondary/20"
                      >
                        <div className="px-4 py-3.5 space-y-2.5 text-[11px]">
                          <div className="flex flex-wrap gap-4">
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
                            <div className="flex flex-wrap gap-1.5">
                              {inputRows.map(([label, value]) => (
                                <span key={label} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-0.5 text-[10px]">
                                  <span className="text-muted-foreground">{label}:</span>
                                  <span className="text-foreground font-medium">{value}</span>
                                </span>
                              ))}
                            </div>
                          )}

                          {job.error_message && job.status === "failed" && (
                            <div className="flex items-start gap-2 rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-red-500">
                              <AlertCircle className="size-3.5 mt-0.5 flex-shrink-0" />
                              <p className="leading-relaxed break-words">{job.error_message}</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </TableCell>
                  </TableRow>
                )}
              </AnimatePresence>
            </React.Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
}

// ─── Transactions table ─────────────────────────────────────────────────────

function TransactionsTable({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-xs text-muted-foreground">Chưa có giao dịch nào.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Gói</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead>Số tiền</TableHead>
          <TableHead className="text-right">Credit</TableHead>
          <TableHead className="text-right">Thời gian</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((tx) => (
          <TableRow key={tx.id}>
            <TableCell>
              <p className="text-xs font-medium text-foreground">{tx.package?.name || "Gói nạp Credit"}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 capitalize">{tx.provider}</p>
            </TableCell>
            <TableCell><StatusPill status={tx.status} /></TableCell>
            <TableCell className="text-xs text-muted-foreground">{tx.amount.toLocaleString("vi-VN")} VNĐ</TableCell>
            <TableCell className="text-xs text-emerald-500 text-right">+{tx.package?.credit_amount || 0}</TableCell>
            <TableCell className="text-xs text-muted-foreground text-right">{timeAgo(tx.created_at)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ─── Pagination (numbered, flat) ────────────────────────────────────────────

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
  const pages = buildPageList(page, totalPages || 1);

  return (
    <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground select-none">
      <span className="text-[11px]">{total === 0 ? "0 kết quả" : `${from}–${to} / ${total}`}</span>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="size-3.5" />
        </button>
        {pages.map((p, i) => p === "..." ? (
          <span key={`e${i}`} className="text-[11px] text-muted-foreground/60">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`text-[11px] transition-colors ${p === page ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"}`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

type Tab = "jobs" | "transactions";

export default function HistoryPage() {
  const authReady = useRequireAuth();
  const {
    aiJobs, transactions, loading,
    totalPages: jobTotalPages, total: jobTotal,
    txTotalPages, txTotal,
    fetch: fetchHistory,
  } = useHistoryData();
  const [activeTab, setActiveTab] = useState<Tab>("jobs");
  const [jobPage, setJobPage] = useState(1);
  const [txPage, setTxPage] = useState(1);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    if (authReady) fetchHistory(1, "", "", 1);
  }, [authReady, fetchHistory]);

  const handleDateFrom = (val: string) => {
    setDateFrom(val);
    setJobPage(1);
    fetchHistory(1, val, dateTo, txPage);
  };

  const handleDateTo = (val: string) => {
    setDateTo(val);
    setJobPage(1);
    fetchHistory(1, dateFrom, val, txPage);
  };

  const clearDates = () => {
    setDateFrom("");
    setDateTo("");
    setJobPage(1);
    fetchHistory(1, "", "", txPage);
  };

  const handlePageChange = (page: number) => {
    setJobPage(page);
    fetchHistory(page, dateFrom, dateTo, txPage);
  };

  const handleTxPageChange = (page: number) => {
    setTxPage(page);
    fetchHistory(jobPage, dateFrom, dateTo, page);
  };

  if (!authReady) {
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
        <h1 className="font-serif text-3xl font-light tracking-tight text-foreground flex items-center gap-3">
          <History className="size-7 text-primary" />
          Lịch sử <span className="font-normal italic text-primary">tác vụ</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Theo dõi tiến trình và lịch sử các tác vụ AI, giao dịch thanh toán.
        </p>
      </div>

      {/* Card */}
      <div className="flex-1 min-h-0 flex flex-col rounded-lg border border-border overflow-hidden">
        {/* Tabs + filter */}
        <div className="flex-shrink-0 flex flex-wrap items-center justify-between gap-3 px-4 border-b border-border">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab("jobs")}
              className={`relative py-3 text-sm font-medium transition-colors cursor-pointer ${activeTab === "jobs" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Tác vụ AI
              {activeTab === "jobs" && <span className="absolute -bottom-px left-0 right-0 h-px bg-foreground" />}
            </button>
            <button
              onClick={() => setActiveTab("transactions")}
              className={`relative py-3 text-sm font-medium transition-colors cursor-pointer ${activeTab === "transactions" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Giao dịch
              {activeTab === "transactions" && <span className="absolute -bottom-px left-0 right-0 h-px bg-foreground" />}
            </button>
          </div>

          {activeTab === "jobs" && (
            <div className="flex items-center gap-1.5 py-2">
              <CalendarDays className="size-3.5 text-muted-foreground" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => handleDateFrom(e.target.value)}
                max={dateTo || undefined}
                className="rounded-md border border-border bg-background px-2 py-1 text-[11px] text-foreground outline-none focus:border-foreground"
              />
              <span className="text-[10px] text-muted-foreground">→</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => handleDateTo(e.target.value)}
                min={dateFrom || undefined}
                className="rounded-md border border-border bg-background px-2 py-1 text-[11px] text-foreground outline-none focus:border-foreground"
              />
              {hasDateFilter && (
                <button onClick={clearDates} className="text-muted-foreground hover:text-foreground transition-colors" title="Xóa bộ lọc">
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Scrollable table area */}
        <ScrollArea className="flex-1 min-h-0">
          {activeTab === "jobs"
            ? <JobsTable jobs={aiJobs} loading={loading} hasDateFilter={hasDateFilter} />
            : <TransactionsTable transactions={transactions} />}
        </ScrollArea>

        {/* Pagination */}
        <div className="flex-shrink-0 px-4 py-3 border-t border-border">
          {activeTab === "jobs"
            ? <Pagination page={jobPage} totalPages={jobTotalPages} total={jobTotal} limit={PAGE_SIZE} onPageChange={handlePageChange} />
            : <Pagination page={txPage} totalPages={txTotalPages} total={txTotal} limit={PAGE_SIZE} onPageChange={handleTxPageChange} />}
        </div>
      </div>
    </div>
  );
}
