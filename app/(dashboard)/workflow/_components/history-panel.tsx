"use client";

import { Clock, Loader2, Workflow } from "lucide-react";
import { StatusBadge } from "./message-bubble";
import { timeAgo } from "./constants";
import type { WorkflowHistory } from "./types";

interface Props {
  history: WorkflowHistory[];
  loading: boolean;
}

export function HistoryPanel({ history, loading }: Props) {
  return (
    <div className="w-[272px] shrink-0 border-l border-border flex flex-col">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <Clock className="size-3.5 text-muted-foreground" />
          <span className="text-sm font-semibold">Lịch sử</span>
          {history.length > 0 && (
            <span className="text-[11px] text-muted-foreground">({history.length})</span>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="p-2">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <div className="size-10 rounded-xl bg-secondary flex items-center justify-center mb-3">
                <Workflow className="size-5 text-muted-foreground/50" />
              </div>
              <p className="text-xs text-muted-foreground">Chưa có workflow nào</p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="group px-3 py-3 rounded-xl hover:bg-secondary/50 transition-colors cursor-default mb-0.5"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-[13px] font-medium text-foreground leading-snug line-clamp-2 flex-1">
                    {item.prompt}
                  </p>
                  <StatusBadge status={item.status} />
                </div>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <Clock className="size-3 shrink-0" />
                  <span>{timeAgo(item.created_at)}</span>
                  {(item.actual_credit ?? item.estimated_credit) > 0 && (
                    <>
                      <span>·</span>
                      <span>{item.actual_credit ?? item.estimated_credit} cr</span>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
