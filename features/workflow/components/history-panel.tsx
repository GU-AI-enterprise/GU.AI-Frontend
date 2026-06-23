"use client";

import { Clock, Loader2, Workflow, ChevronLeft, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatusBadge } from "./message-bubble";
import { timeAgo } from "../constants";
import type { WorkflowHistory } from "../types";

interface Props {
  history: WorkflowHistory[];
  loading: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onSelect: (id: string) => void;
  selectedId?: string | null;
}

export function HistoryPanel({ history, loading, collapsed, onToggleCollapse, onSelect, selectedId }: Props) {
  return (
    <div className="relative flex shrink-0">
      {/* Sliding panel — width animates between 0 and 272px, content stays fixed-width inside so it doesn't reflow while collapsing */}
      <div
        className={`border-l border-border overflow-hidden transition-[width] duration-300 ease-in-out ${
          collapsed ? "w-0 border-l-0" : "w-[272px]"
        }`}
      >
        <div className="w-[272px] h-full flex flex-col">
          <div className="flex items-center justify-between px-4 h-12 border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              <Clock className="size-3.5 text-muted-foreground" />
              <span className="text-sm font-semibold">Lịch sử</span>
              {history.length > 0 && (
                <span className="text-[11px] text-muted-foreground">({history.length})</span>
              )}
            </div>
          </div>

          <ScrollArea className="flex-1 min-h-0">
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
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelect(item.id)}
                    className={`w-full text-left group px-3 py-3 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer mb-0.5 ${
                      selectedId === item.id ? "bg-secondary/60" : ""
                    }`}
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
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Toggle handle — floats on the panel boundary, vertically centered in the content area.
          When collapsed the wrapper has 0 width flush against the viewport edge, so the handle
          is anchored from the right instead of the left to keep it from poking off-screen. */}
      <button
        onClick={onToggleCollapse}
        title={collapsed ? "Mở lịch sử" : "Thu gọn lịch sử"}
        className={`cursor-pointer absolute top-1/2 -translate-y-1/2 z-10 flex items-center justify-center size-7 rounded-full border border-border bg-background shadow-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors ${
          collapsed ? "right-1.5" : "-left-3.5"
        }`}
      >
        {collapsed ? <ChevronLeft className="size-3.5" /> : <ChevronRight className="size-3.5" />}
      </button>
    </div>
  );
}
