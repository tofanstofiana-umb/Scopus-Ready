"use client";
import { ReactNode } from "react";
import { Sidebar, BottomNav } from "./Sidebar";
import { BrandMark } from "./BrandMark";
import { ProductAttribution } from "./ProductAttribution";
import { ProfileMenu } from "./ProfileMenu";
import { NotificationBell } from "./NotificationBell";
import { SearchDialog } from "./SearchDialog";

interface AppShellProps {
  children: ReactNode;
  role?: "peserta" | "trainer" | "admin";
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  userName?: string;
  userInstitution?: string | null;
  progress?: number;
}

export function AppShell({ children, role = "peserta", title, subtitle, actions, userName, userInstitution, progress }: AppShellProps) {
  const roleLabel = role === "trainer" ? "Trainer" : role === "admin" ? "Admin" : "Peserta";
  const displayName = userName || (role === "trainer" ? "Trainer" : role === "admin" ? "Administrator" : "Peserta");
  const roleInitial = displayName.charAt(0).toUpperCase();

  return (
    <div className="app-canvas min-h-screen flex print:block print:bg-white">
      {/* Sidebar (desktop) */}
      <div className="hidden flex-shrink-0 lg:block print:hidden">
        <Sidebar role={role} userName={displayName} userInstitution={userInstitution || roleLabel} progress={progress} />
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 min-h-screen flex flex-col">
        {/* TopBar */}
        <header className="app-topbar sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8 print:hidden">
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
            <SearchDialog />
            <NotificationBell />
            <ProfileMenu displayName={displayName} roleLabel={roleLabel} roleInitial={roleInitial} />
          </div>
        </header>

        {/* Page content */}
        <main className="app-main flex-1 px-4 py-5 pb-24 sm:px-6 lg:px-8 lg:py-6 lg:pb-8 print:bg-white print:p-0">
          <div className="mx-auto w-full max-w-[1440px]">{children}</div>
        </main>
        <footer className="border-t border-slate-200 bg-white px-4 py-4 pb-24 sm:px-6 lg:px-8 lg:pb-4 print:hidden">
          <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <ProductAttribution />
            <span className="text-[10px] text-slate-400">SCOPUS READY™ Digital Workbook</span>
          </div>
        </footer>
      </div>

      {/* Bottom nav (mobile) */}
      <div className="lg:hidden print:hidden">
        <BottomNav role={role} />
      </div>
    </div>
  );
}
