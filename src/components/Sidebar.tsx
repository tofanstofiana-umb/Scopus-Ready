"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, BookOpen, FileText, Target, MessageSquare,
  Star, Calendar, Library, User, ChevronRight, LogOut, Bell,
  BarChart3, Users
} from "lucide-react";
import { cn } from "@/lib/utils";

const pesertaNav = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Beranda" },
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
  { href: "/trainer/participants", icon: Users, label: "Peserta" },
  { href: "/trainer/feedback", icon: MessageSquare, label: "Feedback" },
  { href: "/trainer/analytics", icon: BarChart3, label: "Analitik" },
  { href: "/profile", icon: User, label: "Profil" },
];

interface SidebarProps {
  role?: "peserta" | "trainer" | "admin";
  userName?: string;
  userInstitution?: string;
}

export function Sidebar({ role = "peserta", userName = "Tofan Stofiana", userInstitution = "Universitas Indonesia" }: SidebarProps) {
  const pathname = usePathname();
  const navItems = role === "trainer" ? trainerNav : pesertaNav;

  return (
    <aside
      className="w-64 h-screen sticky top-0 flex flex-col z-40 flex-shrink-0"
      style={{
        background: "linear-gradient(180deg, #082B5C 0%, #051d3d 100%)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Logo */}
      <div className="p-6 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(217,164,65,0.15)", border: "1px solid rgba(217,164,65,0.3)" }}
          >
            <BookOpen size={20} style={{ color: "#D9A441" }} />
          </div>
          <div>
            <div className="font-black text-sm tracking-tight" style={{ color: "#D9A441" }}>SCOPUS READY™</div>
            <div className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>Digital Workbook</div>
          </div>
        </div>
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
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {role === "peserta" && (
          <div className="mb-2 px-4 text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.25)" }}>
            Menu Utama
          </div>
        )}
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} className={cn("nav-item", isActive && "active")}>
              <item.icon size={18} className="flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight size={14} className="opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
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
          <Link href="/login" className="opacity-0 group-hover:opacity-100 transition-opacity">
            <LogOut size={16} style={{ color: "rgba(255,255,255,0.4)" }} />
          </Link>
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

export function BottomNav() {
  const pathname = usePathname();
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
      {mobileNav.map((item) => {
        const isActive = pathname === item.href;
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
