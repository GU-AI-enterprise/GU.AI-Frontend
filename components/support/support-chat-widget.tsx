"use client";

import React, { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X, Loader2, Headphones } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface SupportUser {
  id: string;
  name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  role?: string | null;
}

interface SupportMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: "user" | "staff" | "admin" | "bot";
  content: string;
  message_type: string;
  is_read: boolean;
  created_at: string;
  sender?: SupportUser | SupportUser[] | null;
}

interface SupportConversation {
  id: string;
  status: string;
}

export default function SupportChatWidget() {
  const { session, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [conversation, setConversation] = useState<SupportConversation | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const token = session?.access_token;

  const fetchConversation = async (silent = false) => {
    if (!token) return;
    try {
      if (!silent) setIsLoading(true);
      const res = await fetch(`${apiUrl}/api/support/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Không thể tải hội thoại hỗ trợ.");
      setConversation(json.data.conversation);
      setMessages(json.data.messages || []);
    } catch (err: any) {
      if (!silent) toast.error(err.message || "Không thể tải chat hỗ trợ.");
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open && token) fetchConversation();
  }, [open, token]);

  useEffect(() => {
    if (!open || !token || !conversation?.id) return;
    const interval = window.setInterval(() => fetchConversation(true), 5000);
    return () => window.clearInterval(interval);
  }, [open, token, conversation?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, open]);

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!token || !conversation?.id || !message.trim() || isSending) return;

    try {
      setIsSending(true);
      const res = await fetch(`${apiUrl}/api/support/conversations/${conversation.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: message }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Gửi tin nhắn thất bại.");
      setMessage("");
      setMessages((prev) => [...prev, json.data]);
    } catch (err: any) {
      toast.error(err.message || "Gửi tin nhắn thất bại.");
    } finally {
      setIsSending(false);
    }
  };

  if (loading || !session) return null;

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-xl hover:bg-primary/90 transition-all"
        >
          <MessageCircle className="size-5" />
          Hỗ trợ
        </button>
      )}

      {open && (
        <div className="fixed bottom-5 right-5 z-50 flex h-[560px] w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-border bg-background shadow-2xl">
          <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Headphones className="size-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">GU.AI Support</p>
                <p className="text-[11px] text-muted-foreground">Admin sẽ phản hồi tại đây</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
              <X className="size-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isLoading ? (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-sm text-muted-foreground">
                <MessageCircle className="mb-3 size-10 text-primary/60" />
                <p className="font-medium text-foreground">Bạn cần hỗ trợ gì?</p>
                <p className="mt-1 text-xs">Nhắn vấn đề của bạn, admin sẽ phản hồi sớm.</p>
              </div>
            ) : (
              messages.map((msg) => {
                const mine = msg.sender_type === "user";
                return (
                  <div key={msg.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm ${
                      mine ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                    }`}>
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      <p className={`mt-1 text-[10px] ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {new Date(msg.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={sendMessage} className="flex items-end gap-2 border-t border-border p-3">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Nhập tin nhắn..."
              rows={1}
              className="max-h-24 min-h-10 flex-1 resize-none rounded-2xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <button
              type="submit"
              disabled={!message.trim() || isSending || !conversation}
              className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground disabled:opacity-50"
            >
              {isSending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
