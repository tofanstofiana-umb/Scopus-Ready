"use client";
import { ReactNode } from "react";
import { Sidebar, BottomNav } from "./Sidebar";
import { Bell, ChevronDown, Search } from "lucide-react";
import { BrandMark } from "./BrandMark";

interface AppShellProps {
  children: ReactNode;
  role?: "peserta" | "trainer" | "admin";
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function AppShell({ children, role = "peserta", title, subtitle, actions }: AppShellProps) {
  const roleLabel = role === "trainer" ? "Trainer" : role === "admin" ? "Admin" : "Peserta";
  const roleInitial = role === "trainer" ? "S" : role === "admin" ? "A" : "T";

  return (
    <div className="app-canvas min-h-screen flex">
      {/* Sidebar (desktop) */}
      <div className="hidden lg:block flex-shrink-0">
        <Sidebar role={role} />
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 min-h-screen flex flex-col">
        {/* TopBar */}
        <header className="app-topbar sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="lg:hidden">
              <BrandMark compact />
            </div>
            <div className="min-w-0">
            {title && (
              <h1 className="truncate text-base font-extrabold leading-tight text-[#082B5C] sm:text-lg">{title}</h1>
            )}
            {subtitle && (
              <p className="mt-0.5 hidden truncate text-[11px] font-medium text-slate-500 sm:block">{subtitle}</p>
            )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {actions}
            <button
              id="btn-search"
              className="topbar-icon"
              aria-label="Cari"
            >
              <Search size={17} />
            </button>
            <button
              id="btn-notifications"
              className="topbar-icon relative"
              aria-label="Notifikasi"
            >
              <Bell size={17} />
              <span
                className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full ring-2 ring-white"
                style={{ background: "#EF4444" }}
              />
            </button>
            <button className="topbar-profile" aria-label="Menu pengguna">
              <span className="topbar-avatar">{roleInitial}</span>
              <span className="hidden text-left xl:block">
                <span className="block text-[11px] font-bold leading-none text-[#082B5C]">
                  {role === "trainer" ? "Siti Rahayu" : role === "admin" ? "Administrator" : "Tofan"}
                </span>
                <span className="mt-1 block text-[9px] leading-none text-slate-400">{roleLabel}</span>
              </span>
              <ChevronDown size={13} className="hidden text-slate-400 xl:block" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="app-main flex-1 px-4 py-5 pb-24 sm:px-6 lg:px-8 lg:py-6 lg:pb-8">
          <div className="mx-auto w-full max-w-[1440px]">{children}</div>
        </main>
      </div>

      {/* Bottom nav (mobile) */}
      <div className="lg:hidden">
        <BottomNav role={role} />
      </div>
    </div>
  );
}
