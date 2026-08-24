"use client";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import {
  manuscriptProject, moduleProgress, scopusScoreComponents,
  criticalGates, priorityItems, trainerFeedbacks, currentUser
} from "@/lib/mockData";
import {
  ArrowRight, TrendingUp, AlertTriangle, CheckCircle2,
  ChevronRight, Flame, Target, Lightbulb, BookOpen, Zap, Star
} from "lucide-react";

// Circular progress ring
function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  const fill = (score / 100) * c;
  const color = score >= 90 ? "#10B981" : score >= 80 ? "#0B4EA2" : score >= 70 ? "#F59E0B" : "#EF4444";
  return (
    <svg width={size} height={size} className="score-ring -rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E2E8F0" strokeWidth={10} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={10}
        strokeDasharray={`${fill} ${c}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1.5s ease" }}
      />
    </svg>
  );
}

function StatusBadge({ status, score }: { status: string; score: number }) {
  const cfg =
    score >= 90 ? { color: "#10B981", bg: "rgba(16,185,129,0.1)", label: "Siap Submit" } :
    score >= 80 ? { color: "#0B4EA2", bg: "rgba(11,78,162,0.08)", label: "Revisi Kecil" } :
    score >= 70 ? { color: "#F59E0B", bg: "rgba(245,158,11,0.1)", label: "Revisi Besar" } :
    score >= 60 ? { color: "#EF4444", bg: "rgba(239,68,68,0.08)", label: "Perlu Perbaikan" } :
    { color: "#6B7280", bg: "rgba(107,114,128,0.08)", label: "Bangun Ulang" };
  return (
    <span className="badge text-xs" style={{ color: cfg.color, background: cfg.bg }}>
      {status || cfg.label}
    </span>
  );
}

const statusConfig = {
  done: { color: "#10B981", bg: "rgba(16,185,129,0.1)", label: "Selesai" },
  revision: { color: "#F59E0B", bg: "rgba(245,158,11,0.08)", label: "Perlu Revisi" },
  warning: { color: "#EF4444", bg: "rgba(239,68,68,0.08)", label: "Masalah" },
  empty: { color: "#9CA3AF", bg: "rgba(156,163,175,0.08)", label: "Belum Dikerjakan" },
};

export default function DashboardPage() {
  const totalCompleted = moduleProgress.filter(m => m.status === "done").length;
  const score = manuscriptProject.scopusReadyScore;

  return (
    <AppShell title={`Selamat datang, ${currentUser.name.split(" ")[0]} 👋`} subtitle="Workshop Angkatan 01 · SR-2026-01">
      <div className="space-y-6 animate-fade-in">

        {/* TOP STATS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Score card */}
          <div className="rounded-2xl p-5 flex flex-col gap-3 card-hover animate-fade-in-up col-span-1"
            style={{ background: "linear-gradient(135deg, #082B5C 0%, #0B4EA2 100%)", color: "white" }}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold opacity-70">SCOPUS READY Score™</span>
              <Star size={18} style={{ color: "#D9A441" }} />
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <ScoreRing score={score} size={80} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-black" style={{ color: "#D9A441" }}>{score}</span>
                </div>
              </div>
              <div>
                <div className="text-3xl font-black">{score}<span className="text-lg opacity-60">/100</span></div>
                <StatusBadge status={manuscriptProject.scoreStatus} score={score} />
              </div>
            </div>
          </div>

          {/* Progress card */}
          <div className="rounded-2xl p-5 bg-white card-hover animate-fade-in-up shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-500">Progres Manuskrip</span>
              <TrendingUp size={18} style={{ color: "#0B4EA2" }} />
            </div>
            <div className="text-3xl font-black text-gray-900 mb-2">{manuscriptProject.overallProgress}%</div>
            <div className="progress-bar mb-2">
              <div className="progress-fill" style={{ width: `${manuscriptProject.overallProgress}%` }} />
            </div>
            <div className="text-xs text-gray-400">{totalCompleted} dari {moduleProgress.length} modul selesai</div>
          </div>

          {/* Modules done */}
          <div className="rounded-2xl p-5 bg-white card-hover animate-fade-in-up shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-500">Modul Selesai</span>
              <CheckCircle2 size={18} style={{ color: "#10B981" }} />
            </div>
            <div className="text-3xl font-black text-gray-900 mb-1">{totalCompleted}<span className="text-xl text-gray-300">/{moduleProgress.length}</span></div>
            <div className="flex gap-1 mt-2">
              {moduleProgress.map((m) => (
                <div key={m.id} className="w-2 h-5 rounded-sm" style={{ background: m.color, opacity: m.status === "empty" ? 0.2 : 0.85 }} />
              ))}
            </div>
          </div>

          {/* Journal target */}
          <div className="rounded-2xl p-5 bg-white card-hover animate-fade-in-up shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-500">Target Jurnal</span>
              <Target size={18} style={{ color: "#D9A441" }} />
            </div>
            <div className="text-sm font-bold text-gray-800 leading-snug mb-1">Education & Information Technologies</div>
            <div className="flex gap-2">
              <span className="badge text-xs" style={{ background: "rgba(11,78,162,0.08)", color: "#0B4EA2" }}>Q1</span>
              <span className="badge text-xs" style={{ background: "rgba(16,185,129,0.08)", color: "#10B981" }}>Scopus</span>
            </div>
            <div className="mt-2 text-xs text-gray-400">Fit Score: <span className="font-bold" style={{ color: "#10B981" }}>88/100</span></div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: SCOPUS Journey + Priorities */}
          <div className="lg:col-span-2 space-y-6">

            {/* Priority Cards */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-gray-900">Prioritas Anda</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Area yang perlu diperbaiki segera</p>
                </div>
                <Flame size={18} style={{ color: "#EF4444" }} />
              </div>
              <div className="p-6 space-y-4">
                {priorityItems.map((item) => (
                  <div key={item.rank} className="flex items-start gap-4 p-4 rounded-xl transition-all hover:bg-gray-50">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-black flex-shrink-0"
                      style={{ background: item.color }}>
                      {item.rank}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-800 mb-0.5">{item.area}</div>
                      <div className="text-sm text-gray-500">{item.description}</div>
                      <div className="progress-bar mt-2" style={{ height: "4px" }}>
                        <div className="progress-fill" style={{ width: `${(item.score/item.maxScore)*100}%`, background: item.color }} />
                      </div>
                      <div className="text-xs mt-1" style={{ color: item.color }}>
                        {item.score}/{item.maxScore} poin
                      </div>
                    </div>
                    <Link href={`/workbook/${item.area.toLowerCase().replace(" ", "-")}`}>
                      <button id={`btn-priority-${item.rank}`} className="btn-outline text-xs px-3 py-1.5 flex-shrink-0" style={{ color: item.color, borderColor: item.color }}>
                        Perbaiki
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* SCOPUS Journey Progress */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-gray-900">Perjalanan SCOPUS READY™</h2>
                  <p className="text-xs text-gray-400 mt-0.5">12 modul dari ide hingga submission</p>
                </div>
                <Link href="/workbook" className="text-xs font-semibold flex items-center gap-1" style={{ color: "#0B4EA2" }}>
                  Lihat Semua <ChevronRight size={14} />
                </Link>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {moduleProgress.map((module, i) => {
                    const st = statusConfig[module.status as keyof typeof statusConfig];
                    return (
                      <Link key={module.id} href={`/workbook/${module.id}`}>
                        <div className="p-4 rounded-xl border-2 transition-all hover:shadow-md cursor-pointer card-hover"
                          style={{ borderColor: st.color + "40", background: st.bg }}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white"
                              style={{ background: st.color }}>
                              {i + 1}
                            </div>
                            <span className="text-xs font-semibold" style={{ color: st.color }}>{st.label}</span>
                          </div>
                          <div className="font-semibold text-gray-800 text-sm leading-snug mb-1">{module.name}</div>
                          {module.score > 0 && (
                            <div className="text-xs" style={{ color: st.color }}>
                              {module.score}/{module.maxScore} poin
                            </div>
                          )}
                          <div className="progress-bar mt-2" style={{ height: "3px" }}>
                            <div className="progress-fill" style={{
                              width: module.maxScore > 0 ? `${(module.score/module.maxScore)*100}%` : "0%",
                              background: st.color
                            }} />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* Critical Gates */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-gray-900 text-sm">Critical Gates</h2>
                <Zap size={16} style={{ color: "#D9A441" }} />
              </div>
              <div className="p-5 space-y-2.5">
                {criticalGates.map((gate) => {
                  const cfg = gate.status === "pass"
                    ? { color: "#10B981", bg: "rgba(16,185,129,0.08)", icon: <CheckCircle2 size={16} /> }
                    : gate.status === "warning"
                    ? { color: "#F59E0B", bg: "rgba(245,158,11,0.08)", icon: <AlertTriangle size={16} /> }
                    : { color: "#EF4444", bg: "rgba(239,68,68,0.08)", icon: <AlertTriangle size={16} /> };
                  return (
                    <div key={gate.name} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: cfg.bg }}>
                      <span style={{ color: cfg.color }}>{cfg.icon}</span>
                      <span className="text-sm font-semibold text-gray-700 flex-1">{gate.name}</span>
                      <span className="text-xs font-bold capitalize" style={{ color: cfg.color }}>
                        {gate.status === "pass" ? "Lulus" : gate.status === "warning" ? "Perhatian" : "Gagal"}
                      </span>
                    </div>
                  );
                })}
                {criticalGates.some(g => g.status === "fail") && (
                  <div className="mt-3 p-3 rounded-xl text-xs" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    <div className="font-bold mb-1" style={{ color: "#EF4444" }}>⚠ PERLU PERHATIAN</div>
                    <div className="text-gray-600">Manuskrip belum disarankan masuk tahap submission sebelum semua gate lulus.</div>
                  </div>
                )}
              </div>
            </div>

            {/* Trainer Feedback */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-gray-900 text-sm">Feedback Trainer</h2>
                <Link href="/review" className="text-xs font-semibold" style={{ color: "#0B4EA2" }}>
                  Semua
                </Link>
              </div>
              <div className="p-4 space-y-3">
                {trainerFeedbacks.slice(0, 3).map((fb) => {
                  const cfg = fb.status === "good"
                    ? { color: "#10B981", bg: "rgba(16,185,129,0.06)", label: "Baik" }
                    : fb.status === "revision"
                    ? { color: "#F59E0B", bg: "rgba(245,158,11,0.06)", label: "Revisi" }
                    : { color: "#EF4444", bg: "rgba(239,68,68,0.06)", label: "Kritis" };
                  return (
                    <div key={fb.id} className="p-3 rounded-xl" style={{ background: cfg.bg, border: `1px solid ${cfg.color}25` }}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold" style={{ color: cfg.color }}>{fb.module}</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color: cfg.color, background: `${cfg.color}18` }}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{fb.comment}</p>
                      <div className="text-xs text-gray-400 mt-1.5">{fb.trainerName} · {fb.createdAt}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="font-bold text-gray-900 text-sm mb-4">Aksi Cepat</h2>
              <div className="space-y-2">
                {[
                  { href: "/workbook/novelty", icon: Lightbulb, label: "Perbaiki Novelty", color: "#EF4444" },
                  { href: "/workbook/story", icon: BookOpen, label: "Lanjutkan Discussion", color: "#F59E0B" },
                  { href: "/journals", icon: Target, label: "Cek Journal Fit", color: "#0B4EA2" },
                ].map((action) => (
                  <Link key={action.href} href={action.href}>
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: action.color + "15" }}>
                        <action.icon size={16} style={{ color: action.color }} />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 flex-1">{action.label}</span>
                      <ArrowRight size={14} className="text-gray-300" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

