"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, BookOpen, FileText, Target, MessageSquare,
  Star, Calendar, Library, User, ChevronRight, LogOut,
  BarChart3, Users, Settings, ShieldCheck, FolderOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandMark } from "./BrandMark";

const pesertaNav = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Beranda" },
  { href: "/projects", icon: FolderOpen, label: "Proyek Manuskrip" },
  { href: "/workbook", icon: BookOpen, label: "Workbook" },
  { href: "/manuscript", icon: FileText, label: "Manuskrip Saya" },
  { href: "/journals", icon: Target, label: "Journal Target" },
  { href: "/review", icon: MessageSquare, label: "Review" },
  { href: "/score", icon: Star, label: "SCOPUS READY Score" },
  { href: "/action-plan", icon: Calendar, label: "Action Plan" },
  { href: "/library", icon: Library, label: "Library" },
  { href: "/profile", icon: User, label: "Profil" },
];

const trainerNav = [
  { href: "/trainer", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/trainer#participants", icon: Users, label: "Peserta" },
  { href: "/review", icon: MessageSquare, label: "Feedback" },
  { href: "/score", icon: BarChart3, label: "Analitik" },
  { href: "/profile", icon: User, label: "Profil" },
];

const adminNav = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin#classes", icon: BookOpen, label: "Kelas" },
  { href: "/admin#users", icon: Users, label: "Pengguna" },
  { href: "/admin#reports", icon: BarChart3, label: "Laporan" },
  { href: "/admin#settings", icon: Settings, label: "Pengaturan" },
];

interface SidebarProps {
  role?: "peserta" | "trainer" | "admin";
  userName?: string;
  userInstitution?: string;
}

export function Sidebar({ role = "peserta", userName = "Tofan Stofiana", userInstitution = "Universitas Indonesia" }: SidebarProps) {
  const pathname = usePathname();
  const navItems = role === "trainer" ? trainerNav : role === "admin" ? adminNav : pesertaNav;

  return (
    <aside
      className="app-sidebar sticky top-0 z-40 flex h-screen w-[242px] flex-shrink-0 flex-col"
    >
      {/* Logo */}
      <div className="border-b border-white/[0.08] px-5 py-5">
        <BrandMark inverse />
      </div>

      {/* Role badge */}
      {role !== "peserta" && (
        <div className="px-6 pt-4">
          <span
            className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
            style={{ background: "rgba(217,164,65,0.15)", color: "#D9A441" }}
          >
            {role === "trainer" ? "Trainer" : "Admin"}
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {role === "peserta" && (
          <div className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.18em] text-white/30">
            Menu Utama
          </div>
        )}
        {navItems.map((item) => {
          const hasHash = item.href.includes("#");
          const itemPath = item.href.split("#")[0];
          const isActive = !hasHash && (pathname === itemPath || (itemPath !== "/" && pathname.startsWith(itemPath + "/")));
          return (
            <Link key={item.href} href={item.href} className={cn("nav-item", isActive && "active")}>
              <item.icon size={18} className="flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight size={14} className="opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {role === "peserta" && (
        <div className="mx-3 mb-3 rounded-xl border border-white/10 bg-white/[0.05] p-3">
          <div className="mb-2 flex items-center justify-between text-[10px] font-semibold text-white/60">
            <span>Progres workbook</span>
            <span className="text-[#F4BF4F]">72%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-[#F4BF4F] to-[#F59E0B]" />
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[9px] text-emerald-300">
            <ShieldCheck size={11} /> Data tersimpan otomatis
          </div>
        </div>
      )}

      {/* User section */}
      <div className="border-t border-white/[0.08] p-3">
        <div className="group flex cursor-pointer items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-white/[0.06]">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #D9A441, #c8932d)", color: "white" }}
          >
            {userName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate">{userName}</div>
            <div className="text-xs truncate" style={{ color: "rgba(255,255,255,0.4)" }}>{userInstitution}</div>
          </div>
          <div className="opacity-0 transition-opacity group-hover:opacity-100">
            <Link href="/login" aria-label="Keluar dari preview aplikasi">
              <LogOut size={16} style={{ color: "rgba(255,255,255,0.4)" }} />
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}

// Bottom nav for mobile
const mobileNav = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/workbook", icon: BookOpen, label: "Workbook" },
  { href: "/score", icon: Star, label: "Score" },
  { href: "/review", icon: MessageSquare, label: "Review" },
  { href: "/profile", icon: User, label: "Profil" },
];

export function BottomNav({ role = "peserta" }: { role?: "peserta" | "trainer" | "admin" }) {
  const pathname = usePathname();
  const navItems = role === "trainer"
    ? [
        { href: "/trainer", icon: LayoutDashboard, label: "Dashboard" },
        { href: "/trainer#participants", icon: Users, label: "Peserta" },
        { href: "/review", icon: MessageSquare, label: "Feedback" },
        { href: "/score", icon: BarChart3, label: "Analitik" },
        { href: "/profile", icon: User, label: "Profil" },
      ]
    : role === "admin"
    ? [
        { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
        { href: "/admin#classes", icon: BookOpen, label: "Kelas" },
        { href: "/admin#users", icon: Users, label: "Pengguna" },
        { href: "/admin#reports", icon: BarChart3, label: "Laporan" },
        { href: "/profile", icon: User, label: "Profil" },
      ]
    : mobileNav;
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 lg:hidden z-40 flex items-center justify-around"
      style={{
        background: "rgba(8,43,92,0.97)",
        backdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        paddingBottom: "env(safe-area-inset-bottom)",
        height: "68px",
      }}
    >
      {navItems.map((item) => {
        const isActive = !item.href.includes("#") && pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 flex-1 py-2 transition-all"
            style={{ color: isActive ? "#D9A441" : "rgba(255,255,255,0.45)" }}
          >
            <item.icon size={20} />
            <span className="text-xs font-semibold">{item.label}</span>
            {isActive && <div className="w-1 h-1 rounded-full" style={{ background: "#D9A441" }} />}
          </Link>
        );
      })}
    </nav>
  );
}
