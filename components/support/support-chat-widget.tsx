"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { MessageCircle, Send, X, Loader2, Headphones, ImageIcon, Check, CheckCheck } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useAppSelector } from "@/store/hooks";
import {
  getSupportConversation,
  sendSupportMessage,
  uploadSupportImage,
  type SupportMessage,
  type SupportConversation,
} from "@/features/support/supportService";
import { MessageType } from "@/constants/support";
import { io, Socket } from "socket.io-client";
import { useSupportUnread } from "@/contexts/SupportUnreadContext";

interface SupportChatWidgetProps {
  forceOpen?: boolean;
  hideFloatButton?: boolean;
}

export default function SupportChatWidget({ forceOpen, hideFloatButton }: SupportChatWidgetProps = {}) {
  const { session, loading } = useAppSelector((state) => state.auth);
  const { markRead } = useSupportUnread();

  const [open, setOpen] = useState(false);
  const [conversation, setConversation] = useState<SupportConversation | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Image upload
  const [imagePreview, setImagePreview] = useState<{ file: File; url: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const socketUrl = apiUrl.replace(/\/api$/, "").replace(/:5000$/, ":5000");
  const token = session?.access_token;

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchConversation = useCallback(async (silent = false) => {
    if (!token) return;
    try {
      if (!silent) setIsLoading(true);
      const data = await getSupportConversation();
      setConversation(data.conversation);
      setMessages(data.messages);
    } catch (err: any) {
      if (!silent) toast.error(err.message || "Không thể tải chat hỗ trợ.");
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (forceOpen) setOpen(true);
  }, [forceOpen]);

  useEffect(() => {
    if (open && token) fetchConversation();
  }, [open, token, fetchConversation]);

  // Mark read + clear badge when chat opens with a loaded conversation
  useEffect(() => {
    if (open && conversation?.id) {
      markRead(conversation.id);
    }
  }, [open, conversation?.id, markRead]);

  // ── Socket ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!open || !token || !conversation?.id) return;

    const socket = io(socketUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("join-conversation", conversation.id);
    });

    socket.on("disconnect", () => setIsConnected(false));
    socket.on("connect_error", () => setIsConnected(false));

    // New message from staff/admin
    socket.on("message", (payload: any) => {
      if (payload.conversationId === conversation.id) {
        fetchConversation(true);
        markRead(conversation.id);
      }
    });

    // Staff/admin read our messages → update is_read on our sent messages
    socket.on("support:read_receipt", (payload: any) => {
      if (payload.conversationId === conversation.id && payload.readBy === "staff") {
        setMessages((prev) =>
          prev.map((m) =>
            m.sender_type === "customer" ? { ...m, is_read: true } : m
          )
        );
      }
    });

    return () => {
      socket.emit("leave-conversation", conversation.id);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [open, token, conversation?.id, socketUrl, fetchConversation, markRead]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, open]);

  // ── Send text ──────────────────────────────────────────────────────────────

  const sendText = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!token || !conversation?.id || !message.trim() || isSending) return;
    try {
      setIsSending(true);
      const newMsg = await sendSupportMessage(conversation.id, message.trim());
      setMessage("");
      setMessages((prev) => [...prev, newMsg]);
    } catch (err: any) {
      toast.error(err.message || "Gửi tin nhắn thất bại.");
    } finally {
      setIsSending(false);
    }
  };

  // ── Image upload ───────────────────────────────────────────────────────────

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Chỉ chấp nhận file ảnh."); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Ảnh không được vượt quá 5MB."); return; }
    const url = URL.createObjectURL(file);
    setImagePreview({ file, url });
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const cancelImagePreview = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview.url);
    setImagePreview(null);
  };

  const sendImage = async () => {
    if (!imagePreview || !conversation?.id || isUploading) return;
    try {
      setIsUploading(true);
      const newMsg = await uploadSupportImage(conversation.id, imagePreview.file);
      URL.revokeObjectURL(imagePreview.url);
      setImagePreview(null);
      setMessages((prev) => [...prev, newMsg]);
    } catch (err: any) {
      toast.error(err.message || "Gửi ảnh thất bại.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSend = (e?: React.FormEvent) => {
    if (imagePreview) sendImage();
    else sendText(e);
  };

  // ── Read receipt helpers ───────────────────────────────────────────────────

  // Index of the last customer message that is read (for "Đã xem" indicator)
  const lastReadCustomerIdx = (() => {
    let idx = -1;
    messages.forEach((m, i) => {
      if (m.sender_type === "customer" && m.is_read) idx = i;
    });
    return idx;
  })();

  if (loading || !session) return null;

  return (
    <>
      {!open && !hideFloatButton && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-xl hover:bg-primary/90 transition-all"
        >
          <MessageCircle className="size-5" />
          Hỗ trợ
        </button>
      )}

      {open && (
        <div className="fixed bottom-5 right-5 z-50 flex h-[580px] w-[370px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-border bg-background shadow-2xl">

          {/* Header */}
          <div className="flex flex-shrink-0 items-center justify-between border-b border-border bg-card px-4 py-3">
            <div className="flex items-center gap-3">
              <div className={`flex size-9 items-center justify-center rounded-full ${isConnected ? "bg-green-500/10 text-green-500" : "bg-primary/10 text-primary"}`}>
                <Headphones className="size-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">GU.AI Support</p>
                  <span className={`size-2 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-amber-500"}`} />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {isConnected ? "Đã kết nối · Real-time" : "Đang kết nối..."}
                </p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground">
              <X className="size-4" />
            </button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 min-h-0">
          <div className="px-4 py-4 space-y-2.5">
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
              messages.map((msg, idx) => {
                const mine = msg.sender_type === "customer";
                const isStaff = msg.sender_type === "staff" || msg.sender_type === "admin";
                const isImage = msg.message_type === MessageType.IMAGE;
                const showReadReceipt = mine && idx === lastReadCustomerIdx;

                return (
                  <div key={msg.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
                    {!mine && (
                      <p className="mb-1 px-1 text-[10px] text-muted-foreground">
                        {isStaff ? "GU.AI Support" : "Hệ thống"}
                      </p>
                    )}

                    <div className={`max-w-[80%] ${isImage ? "" : `rounded-2xl px-3 py-2 text-sm ${mine ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}`}>
                      {isImage ? (
                        <div className="overflow-hidden rounded-2xl border border-border">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={msg.content}
                            alt="Ảnh"
                            className="block max-h-56 max-w-[260px] w-auto object-cover cursor-pointer"
                            onClick={() => window.open(msg.content, "_blank")}
                            loading="lazy"
                          />
                          <div className={`flex items-center justify-end gap-1 px-2.5 py-1 ${mine ? "bg-primary" : "bg-secondary"}`}>
                            <span className={`text-[10px] ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                              {new Date(msg.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            {mine && (showReadReceipt
                              ? <CheckCheck className="size-3 text-sky-300 shrink-0" />
                              : <Check className="size-3 text-primary-foreground/50 shrink-0" />
                            )}
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                          <div className={`mt-1 flex items-center justify-end gap-1 ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                            <span className="text-[10px]">
                              {new Date(msg.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            {mine && (showReadReceipt
                              ? <CheckCheck className="size-3 text-sky-300 shrink-0" />
                              : <Check className="size-3 opacity-60 shrink-0" />
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>
          </ScrollArea>

          {/* Image preview */}
          {imagePreview && (
            <div className="flex-shrink-0 border-t border-border bg-card px-4 py-2">
              <div className="relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview.url} alt="preview" className="h-20 rounded-xl object-cover" />
                <button
                  onClick={cancelImagePreview}
                  className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-red-500 text-white shadow"
                >
                  <X className="size-3" />
                </button>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">Nhấn gửi để upload ảnh này</p>
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={handleSend}
            className="flex-shrink-0 flex items-end gap-2 border-t border-border p-3"
          >
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />

            {/* Image button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSending || isUploading || !conversation}
              className="flex-shrink-0 flex size-10 items-center justify-center rounded-2xl border border-border text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-40 transition-colors"
              title="Gửi ảnh"
            >
              <ImageIcon className="size-4" />
            </button>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={imagePreview ? "Thêm chú thích... (tuỳ chọn)" : "Nhập tin nhắn..."}
              rows={1}
              disabled={isUploading}
              className="max-h-24 min-h-10 flex-1 resize-none rounded-2xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-50"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />

            <button
              type="submit"
              disabled={(!message.trim() && !imagePreview) || isSending || isUploading || !conversation}
              className="flex-shrink-0 flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground disabled:opacity-50 transition-opacity"
            >
              {isSending || isUploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
