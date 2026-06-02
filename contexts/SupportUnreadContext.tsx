"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAppSelector } from "@/store/hooks";
import { getSupportBadgeCount, markSupportRead } from "@/features/support/supportService";

interface SupportUnreadContextType {
  unreadCount: number;
  role: string;
  /** Customer: call with their conversationId. Staff/Admin: call with the specific conversationId they just viewed. */
  markRead: (conversationId: string) => void;
}

const SupportUnreadContext = createContext<SupportUnreadContextType>({
  unreadCount: 0,
  role: "customer",
  markRead: () => {},
});

export function useSupportUnread() {
  return useContext(SupportUnreadContext);
}

export function SupportUnreadProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAppSelector((s) => s.auth);
  const token = session?.access_token;

  const [unreadCount, setUnreadCount] = useState(0);
  const [role, setRole] = useState("customer");

  const socketRef = useRef<Socket | null>(null);
  const roleRef = useRef("customer");

  // Fetch initial badge count and learn the user's role
  useEffect(() => {
    if (!token) return;
    getSupportBadgeCount()
      .then(({ count, role: r }) => {
        setUnreadCount(count);
        setRole(r);
        roleRef.current = r;
        // If staff/admin and socket already connected, join admin room
        if ((r === "staff" || r === "admin") && socketRef.current?.connected) {
          socketRef.current.emit("join-admin");
        }
      })
      .catch(() => {});
  }, [token]);

  // Persistent lightweight socket for badge tracking
  useEffect(() => {
    if (!token) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const socketUrl = apiUrl.replace(/\/api$/, "").replace(/:5000$/, ":5000");

    const socket = io(socketUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      // Join admin room if staff/admin (role may be known by now)
      if (roleRef.current === "staff" || roleRef.current === "admin") {
        socket.emit("join-admin");
      }
    });

    // Staff/admin send a reply → customer gets badge
    socket.on("support:new_message", () => {
      if (roleRef.current !== "staff" && roleRef.current !== "admin") {
        setUnreadCount((c) => c + 1);
      }
    });

    // Customer sends a message → staff/admin get badge
    socket.on("support:needs_help", () => {
      if (roleRef.current === "staff" || roleRef.current === "admin") {
        setUnreadCount((c) => c + 1);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  const markRead = useCallback(
    (conversationId: string) => {
      const isStaff = roleRef.current === "staff" || roleRef.current === "admin";

      if (isStaff) {
        // Staff/admin: decrement by 1 (1 conversation marked read) then sync from DB
        setUnreadCount((c) => Math.max(0, c - 1));
        markSupportRead(conversationId)
          .then(() => getSupportBadgeCount())
          .then(({ count }) => setUnreadCount(count))
          .catch(() => {});
      } else {
        // Customer: has only 1 conversation, set to 0
        setUnreadCount(0);
        markSupportRead(conversationId).catch(() => {});
      }
    },
    []
  );

  return (
    <SupportUnreadContext.Provider value={{ unreadCount, role, markRead }}>
      {children}
    </SupportUnreadContext.Provider>
  );
}
