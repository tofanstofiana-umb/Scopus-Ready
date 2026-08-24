"use client";
import { AppShell } from "@/components/AppShell";
import { trainerParticipants } from "@/lib/mockData";
import {
  Users, BookOpen, BarChart3, Settings, Plus, Key, Shield, Download
} from "lucide-react";

const classes = [
  { id: "c1", name: "Workshop Angkatan 01", code: "SR-2026-01", trainer: "Dr. Siti Rahayu", participants: 30, avgScore: 74, status: "Aktif" },
  { id: "c2", name: "Workshop Angkatan 02", code: "SR-2026-02", trainer: "Dr. Budi Santoso", participants: 25, avgScore: 0, status: "Belum Mulai" },
];

const stats = [
  { label: "Total Kelas", value: 2, icon: BookOpen, color: "#0B4EA2" },
  { label: "Total Peserta", value: 55, icon: Users, color: "#10B981" },
  { label: "Rata-rata Score", value: 74, icon: BarChart3, color: "#D9A441" },
  { label: "Siap Submit", value: 4, icon: Shield, color: "#EF4444" },
];

export default function AdminPage() {
  return (
    <AppShell role="admin" title="Admin Dashboard" subtitle="Kelola kelas, trainer, dan peserta">
      <div className="space-y-6 animate-fade-in">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl shadow-sm p-5 card-hover">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-500">{stat.label}</span>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: stat.color + "15" }}>
                  <stat.icon size={16} style={{ color: stat.color }} />
                </div>
              </div>
              <div className="text-3xl font-black text-gray-900">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Class management */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Manajemen Kelas</h2>
            <button id="btn-create-class" className="btn-primary text-sm">
              <Plus size={16} /> Buat Kelas Baru
            </button>
          </div>
          <div className="p-6 space-y-4">
            {classes.map((cls) => (
              <div key={cls.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #082B5C, #0B4EA2)" }}>
                  {cls.id.slice(-1)}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-gray-800">{cls.name}</div>
                  <div className="text-sm text-gray-400">{cls.trainer} · {cls.participants} peserta</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-xs font-mono bg-gray-100 px-3 py-1.5 rounded-lg">
                    <Key size={12} className="text-gray-400" /> {cls.code}
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{
                      color: cls.status === "Aktif" ? "#10B981" : "#9CA3AF",
                      background: cls.status === "Aktif" ? "rgba(16,185,129,0.1)" : "rgba(156,163,175,0.1)"
                    }}>
                    {cls.status}
                  </span>
                  <button id={`btn-manage-class-${cls.id}`} className="btn-outline text-xs px-3 py-1.5">
                    Kelola
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick admin actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: Users, label: "Manajemen Pengguna", desc: "Tambah, edit, atau nonaktifkan akun trainer dan peserta", color: "#0B4EA2" },
            { icon: BarChart3, label: "Laporan & Statistik", desc: "Lihat analitik keseluruhan platform dan progress workshop", color: "#10B981" },
            { icon: BookOpen, label: "Library & Materi", desc: "Kelola konten, template, dan materi workshop", color: "#D9A441" },
            { icon: Key, label: "Kode Kelas", desc: "Generate dan kelola kode akses kelas workshop", color: "#F59E0B" },
            { icon: Shield, label: "Sertifikat", desc: "Atur dan kirim sertifikat otomatis untuk peserta", color: "#8B5CF6" },
            { icon: Settings, label: "Pengaturan Sistem", desc: "Konfigurasi paket layanan dan preferensi sistem", color: "#6B7280" },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-2xl shadow-sm p-5 card-hover cursor-pointer">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: item.color + "15" }}>
                <item.icon size={20} style={{ color: item.color }} />
              </div>
              <h3 className="font-bold text-gray-800 mb-1">{item.label}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Recent participants table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Peserta Terbaru</h2>
            <button id="btn-export-data" className="btn-ghost text-sm">
              <Download size={14} /> Export CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "#F8FAFC" }}>
                  {["Nama", "Institusi", "Progres", "Score", "Status"].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {trainerParticipants.slice(0, 5).map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-semibold text-gray-800">{p.name}</td>
                    <td className="px-6 py-3 text-gray-500">{p.institution}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className="progress-bar w-16"><div className="progress-fill" style={{ width: `${p.progress}%` }} /></div>
                        <span className="text-xs text-gray-500">{p.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 font-bold" style={{ color: p.score >= 80 ? "#10B981" : "#F59E0B" }}>{p.score}</td>
                    <td className="px-6 py-3">
                      <span className="text-xs font-semibold">{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
