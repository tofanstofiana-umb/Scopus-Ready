"use client";
import { AppShell } from "@/components/AppShell";
import { currentUser, manuscriptProject } from "@/lib/mockData";
import { User, Building, BookOpen, Globe, Edit3, LogOut, Bell, Shield } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  return (
    <AppShell title="Profil" subtitle="Kelola informasi akun Anda">
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">

        {/* Profile card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="h-24 relative" style={{ background: "linear-gradient(135deg, #082B5C, #0B4EA2)" }}>
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: "radial-gradient(circle at 70% 50%, #D9A441 0%, transparent 50%)" }} />
          </div>
          <div className="px-6 pb-6 -mt-10">
            <div className="flex items-end justify-between mb-4">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-black border-4 border-white"
                style={{ background: "linear-gradient(135deg, #D9A441, #c8932d)" }}>
                {currentUser.name.charAt(0)}
              </div>
              <button id="btn-edit-profile" className="btn-outline text-sm">
                <Edit3 size={16} /> Edit Profil
              </button>
            </div>
            <h2 className="text-2xl font-black text-gray-900">{currentUser.name}</h2>
            <p className="text-gray-400 text-sm">{currentUser.email}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="badge text-xs" style={{ background: "rgba(11,78,162,0.08)", color: "#0B4EA2" }}>
                Peserta
              </span>
              <span className="badge text-xs" style={{ background: "rgba(16,185,129,0.08)", color: "#10B981" }}>
                Workshop Angkatan 01
              </span>
            </div>
          </div>
        </div>

        {/* Info fields */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-5">Informasi Akademik</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { icon: User, label: "Nama Lengkap", value: currentUser.name },
              { icon: Building, label: "Institusi", value: currentUser.institution },
              { icon: BookOpen, label: "Bidang Keilmuan", value: currentUser.field },
              { icon: Globe, label: "Bahasa Manuskrip", value: currentUser.manuscriptLanguage },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-4 p-4 rounded-xl" style={{ background: "#F8FAFC" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#EFF6FF" }}>
                  <Icon size={18} style={{ color: "#0B4EA2" }} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</div>
                  <div className="font-semibold text-gray-800 mt-0.5">{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Manuscript status */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4">Status Manuskrip Aktif</h2>
          <div className="p-4 rounded-xl border border-blue-100" style={{ background: "rgba(11,78,162,0.03)" }}>
            <div className="font-semibold text-gray-800 mb-1 text-sm">{manuscriptProject.title}</div>
            <div className="flex flex-wrap gap-3 text-sm">
              <span>Progres: <strong style={{ color: "#10B981" }}>{manuscriptProject.overallProgress}%</strong></span>
              <span>Score: <strong style={{ color: "#D9A441" }}>{manuscriptProject.scopusReadyScore}/100</strong></span>
              <span>Status: <strong style={{ color: "#F59E0B" }}>{manuscriptProject.scoreStatus}</strong></span>
            </div>
          </div>
        </div>

        {/* Account actions */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <h2 className="font-bold text-gray-900 px-6 py-4 border-b border-gray-100">Pengaturan Akun</h2>
          <div className="divide-y divide-gray-50">
            {[
              { icon: Bell, label: "Notifikasi", desc: "Atur preferensi notifikasi feedback", id: "settings-notifications" },
              { icon: Shield, label: "Privasi & Keamanan", desc: "Ubah password dan kelola privasi data", id: "settings-privacy" },
            ].map((item) => (
              <div key={item.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#F3F4F6" }}>
                  <item.icon size={18} className="text-gray-500" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 text-sm">{item.label}</div>
                  <div className="text-xs text-gray-400">{item.desc}</div>
                </div>
              </div>
            ))}
            <Link href="/login">
              <div className="flex items-center gap-4 px-6 py-4 hover:bg-red-50 transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(239,68,68,0.08)" }}>
                  <LogOut size={18} style={{ color: "#EF4444" }} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm" style={{ color: "#EF4444" }}>Keluar</div>
                  <div className="text-xs text-gray-400">Logout dari akun Anda</div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400">
          © 2026 SCOPUS READY™ · Privacy Policy · Terms of Use
        </p>
      </div>
    </AppShell>
  );
}
