import React from "react";
import Sidebar from "@/components/shared/sidebar";
import DashboardTopBar from "@/components/shared/dashboard-topbar";
import { SupportUnreadProvider } from "@/contexts/SupportUnreadContext";
import { SidebarProvider } from "@/contexts/SidebarContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SupportUnreadProvider>
      <SidebarProvider>
        <div className="flex h-screen w-full overflow-hidden bg-background">
          <Sidebar />
          <div className="flex-1 flex flex-col min-h-0 min-w-0">
            <DashboardTopBar />
            <main className="flex-1 overflow-y-auto relative">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </SupportUnreadProvider>
  );
}
