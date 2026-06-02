"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setBalance } from "@/features/credit/creditSlice";
import {
  getNotifications,
  getUnreadCount,
  markRead as markReadAPI,
  markAllRead as markAllReadAPI,
  type AppNotification,
} from "@/features/notification/notificationService";
import { NotificationStatus } from "@/constants/notification";

const SOCKET_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/api$/, "");

export interface AIJobUpdatePayload {
  jobId: string;
  status: "completed" | "failed";
  imageUrl?: string;
  assetId?: string;
  creditsUsed?: number;
  error?: string;
}

type AIJobCallback = (payload: AIJobUpdatePayload) => void;

interface NotificationContextValue {
  unreadCount: number;
  items: AppNotification[];
  loading: boolean;
  loadItems: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  /** Subscribe to Socket.IO `ai_job_update` events for a specific jobId. */
  subscribeAIJob: (jobId: string, cb: AIJobCallback) => void;
  /** Unsubscribe a previously registered AI job callback. */
  unsubscribeAIJob: (jobId: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used inside NotificationProvider");
  return ctx;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { session } = useAppSelector((s) => s.auth);
  const token = session?.access_token;

  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Map of jobId → callback for AI job subscriptions
  const aiJobCallbacksRef = useRef<Map<string, AIJobCallback>>(new Map());

  // Single socket connection for the entire dashboard
  useEffect(() => {
    if (!token) return;
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
    });
    socketRef.current = socket;

    socket.on("notification", (payload: any) => {
      // Credit sync — dispatched exactly once per notification
      if (typeof payload.data?.newBalance === "number") {
        dispatch(setBalance(payload.data.newBalance));
      }
      setUnreadCount((n) => n + 1);
      setItems((prev) => [
        {
          id: payload.data?.notificationId ?? String(Date.now()),
          type: payload.type,
          title: payload.title,
          content: payload.message,
          status: NotificationStatus.UNREAD,
          priority: "normal",
          data: payload.data ?? {},
          created_at: new Date().toISOString(),
        } as AppNotification,
        ...prev,
      ]);
    });

    // AI job completion/failure events
    socket.on("ai_job_update", (payload: AIJobUpdatePayload) => {
      const cb = aiJobCallbacksRef.current.get(payload.jobId);
      if (cb) cb(payload);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, dispatch]);

  // Fetch initial unread count
  useEffect(() => {
    if (!token) return;
    getUnreadCount().then(setUnreadCount).catch(() => {});
  }, [token]);

  const loadItems = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const { notifications } = await getNotifications(20, 0);
      setItems(notifications);
    } catch {} finally {
      setLoading(false);
    }
  }, [token]);

  const markRead = useCallback(async (id: string) => {
    try {
      await markReadAPI(id);
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: NotificationStatus.READ } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await markAllReadAPI();
      setItems((prev) => prev.map((n) => ({ ...n, status: NotificationStatus.READ })));
      setUnreadCount(0);
    } catch {}
  }, []);

  const subscribeAIJob = useCallback((jobId: string, cb: AIJobCallback) => {
    aiJobCallbacksRef.current.set(jobId, cb);
  }, []);

  const unsubscribeAIJob = useCallback((jobId: string) => {
    aiJobCallbacksRef.current.delete(jobId);
  }, []);

  return (
    <NotificationContext.Provider value={{
      unreadCount, items, loading,
      loadItems, markRead, markAllRead,
      subscribeAIJob, unsubscribeAIJob,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}
