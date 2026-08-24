"use client";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { trainerClass, trainerParticipants } from "@/lib/mockData";
import {
  Users, TrendingUp, Star, ChevronRight, Search, Filter,
  CheckCircle2, AlertTriangle, XCircle, MessageSquare
} from "lucide-react";

const statusConfig: Record<string, { color: string; bg: string; icon: typeof CheckCircle2 }> = {
  "Siap Submit": { color: "#10B981", bg: "rgba(16,185,129,0.08)", icon: CheckCircle2 },
  "Revisi Kecil": { color: "#0B4EA2", bg: "rgba(11,78,162,0.06)", icon: CheckCircle2 },
  "Revisi Besar": { color: "#F59E0B", bg: "rgba(245,158,11,0.08)", icon: AlertTriangle },
  "Perlu Perbaikan Substansial": { color: "#EF4444", bg: "rgba(239,68,68,0.08)", icon: AlertTriangle },
  "Perlu Dibangun Ulang": { color: "#6B7280", bg: "rgba(107,114,128,0.06)", icon: XCircle },
};

export default function TrainerPage() {
  const pendingFeedback = trainerParticipants.filter(p => p.status === "Revisi Besar" || p.status === "Revisi Kecil").length;

  return (
    <AppShell role="trainer" title="Dashboard Trainer" subtitle={`${trainerClass.name} · ${trainerClass.code}`}>
      <div className="space-y-6 animate-fade-in">

        {/* Class summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Peserta", value: trainerClass.totalParticipants, icon: Users, color: "#0B4EA2" },
            { label: "Rata-rata Progres", value: `${trainerClass.avgProgress}%`, icon: TrendingUp, color: "#10B981" },
            { label: "Rata-rata Score", value: trainerClass.avgScore, icon: Star, color: "#D9A441" },
            { label: "Perlu Feedback", value: pendingFeedback, icon: MessageSquare, color: "#F59E0B" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl shadow-sm p-5 card-hover">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-500">{stat.label}</span>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: stat.color + "15" }}>
                  <stat.icon size={18} style={{ color: stat.color }} />
                </div>
              </div>
              <div className="text-3xl font-black text-gray-900">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Class info */}
        <div className="rounded-2xl p-6 text-white" style={{ background: "linear-gradient(135deg, #082B5C, #0B4EA2)" }}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold opacity-60 mb-1">Kelas Aktif</div>
              <h2 className="text-2xl font-black mb-1">{trainerClass.name}</h2>
              <div className="flex flex-wrap gap-3 text-sm text-white/60">
                <span>Trainer: {trainerClass.trainerName}</span>
                <span>·</span>
                <span>Kode: <strong className="text-white/80">{trainerClass.code}</strong></span>
                <span>·</span>
                <span>Status: <strong style={{ color: "#10B981" }}>{trainerClass.status}</strong></span>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-center p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.08)" }}>
                <div className="text-xl font-black">{trainerClass.totalParticipants}</div>
                <div className="text-xs text-white/50">Peserta</div>
              </div>
              <div className="text-center p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.08)" }}>
                <div className="text-xl font-black">{trainerClass.avgProgress}%</div>
                <div className="text-xs text-white/50">Rata-rata Progres</div>
              </div>
              <div className="text-center p-3 rounded-xl" style={{ background: "rgba(217,164,65,0.15)" }}>
                <div className="text-xl font-black" style={{ color: "#D9A441" }}>{trainerClass.avgScore}</div>
                <div className="text-xs text-white/50">Avg Score</div>
              </div>
            </div>
          </div>
        </div>

        {/* Participant table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Daftar Peserta</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input id="search-participants" placeholder="Cari peserta..." className="input-field pl-9 text-sm py-2 h-9 w-56" />
              </div>
              <button id="btn-filter-participants" className="btn-ghost py-2 h-9 text-sm">
                <Filter size={14} /> Filter
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "#F8FAFC" }}>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Peserta</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Institusi</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wide">Progres</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wide">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wide">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {trainerParticipants.map((p) => {
                  const st = statusConfig[p.status] || statusConfig["Revisi Besar"];
                  const Icon = st.icon;
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ background: "linear-gradient(135deg, #0B4EA2, #082B5C)" }}>
                            {p.name.charAt(0)}
                          </div>
                          <span className="font-semibold text-gray-800">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{p.institution}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="progress-bar w-20">
                            <div className="progress-fill" style={{ width: `${p.progress}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-gray-600">{p.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-lg" style={{
                          color: p.score >= 80 ? "#10B981" : p.score >= 70 ? "#F59E0B" : "#EF4444"
                        }}>
                          {p.score}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit"
                          style={{ color: st.color, background: st.bg }}>
                          <Icon size={11} /> {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link href={`/trainer/participant/${p.id}`}>
                          <button id={`btn-view-${p.id}`} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1 mx-auto">
                            Detail <ChevronRight size={12} />
                          </button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
