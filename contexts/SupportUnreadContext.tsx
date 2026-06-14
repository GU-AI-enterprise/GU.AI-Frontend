"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAppSelector } from "@/store/hooks";
import { getSupportBadgeCount, markSupportRead } from "@/features/support/supportService";
import { useSocket } from "@/contexts/SocketContext";

interface SupportUnreadContextType {
  unreadCount: number;
  role: string;
  markRead: (conversationId: string) => void;
}

const SupportUnreadContext = createContext<SupportUnreadContextType | null>(null);

export function useSupportUnread() {
  const ctx = useContext(SupportUnreadContext);
  if (!ctx) throw new Error("useSupportUnread must be used inside SupportUnreadProvider");
  return ctx;
}

export function SupportUnreadProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAppSelector((s) => s.auth);
  const token = session?.access_token;
  const socket = useSocket();

  const [unreadCount, setUnreadCount] = useState(0);
  const [role, setRole] = useState("customer");
  const roleRef = useRef("customer");

  // Fetch initial badge count and user role
  useEffect(() => {
    if (!token) return;
    getSupportBadgeCount()
      .then(({ count, role: r }) => {
        setUnreadCount(count);
        setRole(r);
        roleRef.current = r;
      })
      .catch(() => {});
  }, [token]);

  // Attach/detach socket event handlers on the shared socket
  useEffect(() => {
    if (!socket) return;

    // If already connected and staff/admin, join admin room immediately
    if (socket.connected && (roleRef.current === "staff" || roleRef.current === "admin")) {
      socket.emit("join-admin");
    }

    const onConnect = () => {
      if (roleRef.current === "staff" || roleRef.current === "admin") {
        socket.emit("join-admin");
      }
    };

    const onNewMessage = () => {
      if (roleRef.current !== "staff" && roleRef.current !== "admin") {
        setUnreadCount((c) => c + 1);
      }
    };

    const onNeedsHelp = () => {
      if (roleRef.current === "staff" || roleRef.current === "admin") {
        setUnreadCount((c) => c + 1);
      }
    };

    socket.on("connect", onConnect);
    socket.on("support:new_message", onNewMessage);
    socket.on("support:needs_help", onNeedsHelp);

    return () => {
      socket.off("connect", onConnect);
      socket.off("support:new_message", onNewMessage);
      socket.off("support:needs_help", onNeedsHelp);
    };
  }, [socket]);

  const markRead = useCallback((conversationId: string) => {
    const isStaff = roleRef.current === "staff" || roleRef.current === "admin";
    if (isStaff) {
      setUnreadCount((c) => Math.max(0, c - 1));
      markSupportRead(conversationId)
        .then(() => getSupportBadgeCount())
        .then(({ count }) => setUnreadCount(count))
        .catch(() => {});
    } else {
      setUnreadCount(0);
      markSupportRead(conversationId).catch(() => {});
    }
  }, []);

  return (
    <SupportUnreadContext.Provider value={{ unreadCount, role, markRead }}>
      {children}
    </SupportUnreadContext.Provider>
  );
}
