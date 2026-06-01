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

interface NotificationContextValue {
  unreadCount: number;
  items: AppNotification[];
  loading: boolean;
  loadItems: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
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

  return (
    <NotificationContext.Provider value={{ unreadCount, items, loading, loadItems, markRead, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
}
