"use client";
import { ReactNode } from "react";
import { Sidebar, BottomNav } from "./Sidebar";
import { Bell, Search } from "lucide-react";

interface AppShellProps {
  children: ReactNode;
  role?: "peserta" | "trainer" | "admin";
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function AppShell({ children, role = "peserta", title, subtitle, actions }: AppShellProps) {
  return (
    <div className="min-h-screen flex" style={{ background: "#F4F6F8" }}>
      {/* Sidebar (desktop) */}
      <div className="hidden lg:block flex-shrink-0">
        <Sidebar role={role} />
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 min-h-screen flex flex-col">
        {/* TopBar */}
        <header
          className="sticky top-0 z-30 flex items-center justify-between px-6 lg:px-8"
          style={{
            height: "64px",
            background: "rgba(244,246,248,0.9)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(8,43,92,0.08)",
          }}
        >
          <div>
            {title && (
              <h1 className="font-bold text-gray-900 text-lg leading-tight">{title}</h1>
            )}
            {subtitle && (
              <p className="text-xs text-gray-500">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {actions}
            <button
              id="btn-search"
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-gray-200"
            >
              <Search size={18} className="text-gray-500" />
            </button>
            <button
              id="btn-notifications"
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-gray-200 relative"
            >
              <Bell size={18} className="text-gray-500" />
              <span
                className="absolute top-2 right-2 w-2 h-2 rounded-full"
                style={{ background: "#EF4444" }}
              />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8 pb-24 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Bottom nav (mobile) */}
      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
