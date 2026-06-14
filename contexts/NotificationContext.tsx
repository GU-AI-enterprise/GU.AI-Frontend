"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setBalance } from "@/features/credit/creditSlice";
import {
  patchActiveJob,
  removeJobFromStorage,
  setPendingLightbox,
} from "@/features/aiJob/aiJobSlice";
import {
  getNotifications,
  getUnreadCount,
  markRead as markReadAPI,
  markAllRead as markAllReadAPI,
  type AppNotification,
} from "@/features/notification/notificationService";
import { NotificationStatus } from "@/constants/notification";
import { useSocket } from "@/contexts/SocketContext";

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
  subscribeAIJob: (jobId: string, cb: AIJobCallback) => void;
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
  const router = useRouter();
  const { session } = useAppSelector((s) => s.auth);
  const token = session?.access_token;
  const socket = useSocket();

  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const aiJobCallbacksRef = useRef<Map<string, AIJobCallback>>(new Map());

  const playSound = useCallback(() => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio("/sounds/notification.mp3");
        audioRef.current.volume = 0.6;
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } catch {}
  }, []);

  // Attach/detach event handlers on the shared socket
  useEffect(() => {
    if (!socket) return;

    const onNotification = (payload: any) => {
      if (typeof payload.data?.newBalance === "number") {
        dispatch(setBalance(payload.data.newBalance));
      }
      setUnreadCount((n) => n + 1);
      const category = payload.data?.category ?? payload.type;
      setItems((prev) => [
        {
          id: payload.data?.notificationId ?? String(Date.now()),
          type: category,
          title: payload.title,
          content: payload.message,
          status: NotificationStatus.UNREAD,
          priority: "normal",
          data: payload.data ?? {},
          created_at: new Date().toISOString(),
        } as AppNotification,
        ...prev,
      ]);
    };

    const onAIJobUpdate = (payload: AIJobUpdatePayload) => {
      const cb = aiJobCallbacksRef.current.get(payload.jobId);

      if (payload.status === "completed" || payload.status === "failed") {
        dispatch(patchActiveJob({
          jobId:    payload.jobId,
          status:   payload.status,
          imageUrl: payload.imageUrl,
          assetId:  payload.assetId,
          error:    payload.error,
        }));
        removeJobFromStorage();
        playSound();

        if (!cb) {
          if (payload.status === "completed") {
            const { imageUrl, assetId } = payload;
            toast.success("Tác vụ AI hoàn thành!", {
              description: "Ảnh của bạn đã được tạo xong.",
              style: { borderLeft: "4px solid #22c55e", background: "rgba(34,197,94,0.06)" },
              classNames: { title: "text-green-400", description: "text-green-300/70" },
              ...(imageUrl && {
                action: {
                  label: "Xem ảnh",
                  onClick: () => {
                    dispatch(setPendingLightbox({ imageUrl, assetId }));
                    router.push("/archive/gallery");
                  },
                },
              }),
            });
          } else {
            toast.error("Tác vụ AI thất bại.", {
              description: payload.error || "Đã xảy ra lỗi trong quá trình xử lý.",
              style: { borderLeft: "4px solid #ef4444", background: "rgba(239,68,68,0.06)" },
              classNames: { title: "text-red-400", description: "text-red-300/70" },
            });
          }
        }
      }

      if (cb) cb(payload);
    };

    socket.on("notification", onNotification);
    socket.on("ai_job_update", onAIJobUpdate);
    return () => {
      socket.off("notification", onNotification);
      socket.off("ai_job_update", onAIJobUpdate);
    };
  }, [socket, dispatch, router, playSound]);

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
