"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

interface SidebarContextValue {
  isMobile: boolean;
  drawerOpen: boolean;
  toggle: () => void;
  close: () => void;
}

const SidebarContext = createContext<SidebarContextValue>({
  isMobile: false,
  drawerOpen: false,
  toggle: () => {},
  close: () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setDrawerOpen(false);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const toggle = useCallback(() => setDrawerOpen((v) => !v), []);
  const close = useCallback(() => setDrawerOpen(false), []);

  return (
    <SidebarContext.Provider value={{ isMobile, drawerOpen, toggle, close }}>
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => useContext(SidebarContext);
