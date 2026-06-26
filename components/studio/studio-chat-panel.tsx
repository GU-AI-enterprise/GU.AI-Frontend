"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { X, Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { LoaderOne } from "@/components/ui/loader";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { studioChat, type StudioChatMessage } from "@/features/studio/studioService";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ChatMessage extends StudioChatMessage {
  id: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content: "Chào bạn! Mình là trợ lý AI của Studio. Bạn cần hỗ trợ chọn công cụ, prompt hay xử lý ảnh/video gì không?",
  },
];

const markdownComponents = {
  p: ({ children }: { children?: React.ReactNode }) => <p className="mb-2 last:mb-0">{children}</p>,
  ul: ({ children }: { children?: React.ReactNode }) => <ul className="mb-2 ml-4 list-disc space-y-0.5 last:mb-0">{children}</ul>,
  ol: ({ children }: { children?: React.ReactNode }) => <ol className="mb-2 ml-4 list-decimal space-y-0.5 last:mb-0">{children}</ol>,
  li: ({ children }: { children?: React.ReactNode }) => <li>{children}</li>,
  strong: ({ children }: { children?: React.ReactNode }) => <strong className="font-semibold">{children}</strong>,
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="underline text-primary">{children}</a>
  ),
  code: ({ children }: { children?: React.ReactNode }) => (
    <code className="rounded bg-muted px-1 py-0.5 text-[0.85em]">{children}</code>
  ),
};

const MIN_WIDTH = 320;
const MAX_WIDTH = 720;
const DEFAULT_WIDTH = 380;
const WIDTH_STORAGE_KEY = "studio-chat-width";

interface StudioChatPanelProps {
  open: boolean;
  onClose: () => void;
}

export function StudioChatPanel({ open, onClose }: StudioChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [panelWidth, setPanelWidth] = useState(DEFAULT_WIDTH);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = Number(localStorage.getItem(WIDTH_STORAGE_KEY));
    if (stored >= MIN_WIDTH && stored <= MAX_WIDTH) setPanelWidth(stored);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isTyping, open]);

  const handleResizeStart = (e: React.PointerEvent) => {
    e.preventDefault();
    const onMove = (ev: PointerEvent) => {
      const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, window.innerWidth - ev.clientX));
      setPanelWidth(next);
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      setPanelWidth((w) => {
        localStorage.setItem(WIDTH_STORAGE_KEY, String(w));
        return w;
      });
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || isTyping) return;

    const history = [...messages, { id: `${Date.now()}-user`, role: "user" as const, content: text }];
    setMessages(history);
    setInput("");
    setIsTyping(true);

    try {
      const reply = await studioChat(history.map(({ role, content }) => ({ role, content })));
      setMessages((prev) => [...prev, { id: `${Date.now()}-assistant`, role: "assistant", content: reply }]);
    } catch (err: any) {
      toast.error(err.message || "Trợ lý AI trả lời thất bại, thử lại sau.");
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(next) => { if (!next) onClose(); }} modal={false}>
      <SheetContent
        side="right"
        overlay={false}
        aria-label="Trợ lý AI Studio"
        className="border-l border-border max-w-none"
        style={{ width: panelWidth }}
      >
        {/* Resize handle */}
        <div
          onPointerDown={handleResizeStart}
          className="absolute inset-y-0 left-0 z-10 hidden w-1.5 -translate-x-1/2 cursor-ew-resize touch-none hover:bg-primary/30 active:bg-primary/50 transition-colors sm:block"
        />

        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-border bg-card px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="relative flex size-9 items-center justify-center overflow-hidden rounded-full bg-primary/10">
              <Image src="/icons/logo_only.png" alt="Trợ lý AI" fill className="object-contain p-1.5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Trợ lý AI Studio</p>
              <p className="text-[11px] text-muted-foreground">Hỏi đáp về công cụ &amp; prompt</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="relative flex-1 min-h-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="px-4 py-4 space-y-2.5">
              {messages.map((msg) => {
                const mine = msg.role === "user";
                return (
                  <div key={msg.id} className={cn("flex flex-col", mine ? "items-end" : "items-start")}>
                    {!mine && (
                      <p className="mb-1 px-1 text-[10px] text-muted-foreground">Trợ lý AI</p>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                        mine
                          ? "whitespace-pre-wrap break-words bg-primary text-primary-foreground"
                          : "bg-card text-foreground border border-border"
                      )}
                    >
                      {mine ? (
                        msg.content
                      ) : (
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                          {msg.content}
                        </ReactMarkdown>
                      )}
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex flex-col items-start">
                  <p className="mb-1 px-1 text-[10px] text-muted-foreground">Trợ lý AI</p>
                  <div className="flex items-center rounded-2xl border border-border bg-card px-3 py-2.5">
                    <LoaderOne />
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          </ScrollArea>
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="flex-shrink-0 flex items-end gap-2 border-t border-border bg-background p-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Nhập câu hỏi..."
            rows={1}
            className="max-h-24 min-h-10 flex-1 resize-none rounded-2xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isTyping} className="size-10 rounded-2xl cursor-pointer">
            <Send className="size-4" />
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
