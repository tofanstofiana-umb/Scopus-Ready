"use client";
import { AppShell } from "@/components/AppShell";
import {
  scopusScoreComponents, criticalGates, manuscriptProject, priorityItems
} from "@/lib/mockData";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, Tooltip
} from "recharts";
import { CheckCircle2, AlertTriangle, XCircle, TrendingUp, Download } from "lucide-react";

const scoreStatusConfig = [
  { min: 90, label: "Siap Submit", color: "#10B981", bg: "rgba(16,185,129,0.08)" },
  { min: 80, label: "Siap dengan Revisi Kecil", color: "#0B4EA2", bg: "rgba(11,78,162,0.06)" },
  { min: 70, label: "Perlu Revisi Besar", color: "#F59E0B", bg: "rgba(245,158,11,0.08)" },
  { min: 60, label: "Perlu Perbaikan Substansial", color: "#EF4444", bg: "rgba(239,68,68,0.06)" },
  { min: 0, label: "Perlu Dibangun Ulang", color: "#6B7280", bg: "rgba(107,114,128,0.06)" },
];

function getScoreConfig(score: number) {
  return scoreStatusConfig.find(s => score >= s.min) || scoreStatusConfig[scoreStatusConfig.length - 1];
}

// Circular score display
function ScoreCircle({ score }: { score: number }) {
  const cfg = getScoreConfig(score);
  const r = 70;
  const c = 2 * Math.PI * r;
  const fill = (score / 100) * c;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={160} height={160} className="-rotate-90">
        <circle cx={80} cy={80} r={r} fill="none" stroke="#E8ECF0" strokeWidth={14} />
        <circle
          cx={80} cy={80} r={r} fill="none"
          stroke={cfg.color} strokeWidth={14}
          strokeDasharray={`${fill} ${c}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 2s ease", filter: `drop-shadow(0 0 8px ${cfg.color}50)` }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-4xl font-black" style={{ color: cfg.color }}>{score}</div>
        <div className="text-sm text-gray-400 font-medium">/100</div>
      </div>
    </div>
  );
}

// Custom radar tooltip
const CustomRadarTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { subject: string; score: number; weight: number } }> }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg text-xs">
        <div className="font-bold text-gray-800 mb-1">{d.subject}</div>
        <div className="text-gray-500">Skor: <span className="font-bold" style={{ color: "#0B4EA2" }}>{d.score}</span></div>
        <div className="text-gray-500">Bobot: {d.weight}%</div>
      </div>
    );
  }
  return null;
};

export default function ScorePage() {
  const score = manuscriptProject.scopusReadyScore;
  const cfg = getScoreConfig(score);

  const radarData = scopusScoreComponents.map(c => ({
    subject: c.subject,
    score: Math.round((c.score / c.weight) * 100),
    actualScore: c.score,
    weight: c.weight,
    fullMark: 100,
  }));

  const strengths = scopusScoreComponents.filter(c => (c.score / c.weight) >= 0.8).map(c => c.subject);
  const needsWork = scopusScoreComponents.filter(c => (c.score / c.weight) < 0.7).map(c => c.subject);

  return (
    <AppShell title="SCOPUS READY Score™" subtitle="Diagnosis kesiapan manuskrip Anda">
      <div className="space-y-6 animate-fade-in">

        {/* Main Score Hero */}
        <div className="rounded-2xl p-8 text-white relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #082B5C 0%, #0B4EA2 100%)" }}>
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
            style={{ background: "rgba(217,164,65,0.06)", transform: "translate(40%, -40%)" }} />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <ScoreCircle score={score} />
            <div className="flex-1 text-center md:text-left">
              <div className="text-sm font-semibold opacity-60 mb-2">Status Manuskrip</div>
              <div className="text-3xl font-black mb-3" style={{ color: cfg.color }}>{cfg.label}</div>
              <div className="text-white/70 text-sm leading-relaxed mb-4 max-w-md">
                Berdasarkan 10 komponen penilaian, manuskrip Anda memiliki fondasi yang baik pada beberapa area namun masih memerlukan perbaikan sebelum submission.
              </div>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <button id="btn-export-score" className="btn-gold text-sm">
                  <Download size={16} /> Export Laporan PDF
                </button>
                <button className="btn-outline text-sm border-white/30 text-white hover:bg-white/10 hover:text-white">
                  <TrendingUp size={16} /> Lihat Riwayat
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar Chart */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-1">Profil Kesiapan</h2>
            <p className="text-xs text-gray-400 mb-4">10 komponen SCOPUS READY Score™</p>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#6B7280" }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Skor"
                  dataKey="score"
                  stroke="#0B4EA2"
                  fill="#0B4EA2"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Tooltip content={<CustomRadarTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Critical Gates */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-1">Critical Gates</h2>
            <p className="text-xs text-gray-400 mb-4">Semua gerbang harus lulus sebelum submission</p>
            <div className="space-y-3">
              {criticalGates.map((gate) => {
                const isPass = gate.status === "pass";
                const isWarn = gate.status === "warning";
                const gateColor = isPass ? "#10B981" : isWarn ? "#F59E0B" : "#EF4444";
                const gateBg = isPass ? "rgba(16,185,129,0.06)" : isWarn ? "rgba(245,158,11,0.06)" : "rgba(239,68,68,0.06)";
                const Icon = isPass ? CheckCircle2 : AlertTriangle;
                return (
                  <div key={gate.name} className="flex items-center gap-4 p-4 rounded-xl"
                    style={{ background: gateBg, border: `1px solid ${gateColor}25` }}>
                    <Icon size={20} style={{ color: gateColor, flexShrink: 0 }} />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 text-sm">{gate.name}</div>
                      <div className="text-xs mt-0.5" style={{ color: gateColor }}>
                        {isPass ? "Lulus ✓" : isWarn ? "Perlu Perhatian" : "Belum Lulus — Perlu Perbaikan"}
                      </div>
                    </div>
                    {!isPass && (
                      <span className="text-xs px-2 py-1 rounded-full font-semibold"
                        style={{ background: gateColor + "18", color: gateColor }}>
                        {isWarn ? "⚠" : "✗"}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            {criticalGates.some(g => g.status === "fail") && (
              <div className="mt-4 p-4 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <div className="font-bold mb-1" style={{ color: "#EF4444" }}>⚠ PERLU PERHATIAN</div>
                <div className="text-gray-600 text-xs leading-relaxed">
                  Manuskrip belum disarankan masuk tahap submission sebelum masalah pada gerbang yang gagal diperbaiki.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Detail Skor per Komponen</h2>
          </div>
          <div className="p-6 space-y-4">
            {scopusScoreComponents.map((c) => {
              const pct = Math.round((c.score / c.weight) * 100);
              const barColor = pct >= 80 ? "#10B981" : pct >= 65 ? "#F59E0B" : "#EF4444";
              return (
                <div key={c.subject} className="flex items-center gap-4">
                  <div className="w-36 text-sm font-semibold text-gray-700 flex-shrink-0">{c.subject}</div>
                  <div className="flex-1">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%`, background: barColor }} />
                    </div>
                  </div>
                  <div className="w-20 text-right text-sm font-bold" style={{ color: barColor }}>
                    {c.score}/{c.weight}
                  </div>
                  <div className="w-12 text-right text-xs text-gray-400">{pct}%</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Strengths & Needs Work */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle2 size={18} style={{ color: "#10B981" }} /> Kekuatan
            </h2>
            <div className="space-y-2">
              {strengths.map(s => (
                <div key={s} className="flex items-center gap-2 p-3 rounded-xl" style={{ background: "rgba(16,185,129,0.06)" }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: "#10B981" }} />
                  <span className="text-sm font-semibold text-gray-700">{s}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle size={18} style={{ color: "#F59E0B" }} /> Perlu Diperbaiki
            </h2>
            <div className="space-y-2">
              {needsWork.map((s, i) => (
                <div key={s} className="flex items-center gap-2 p-3 rounded-xl" style={{ background: "rgba(245,158,11,0.06)" }}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: "#F59E0B" }}>
                    {i + 1}
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Priority recommendations */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4">Prioritas Perbaikan</h2>
          <div className="space-y-4">
            {priorityItems.map((item) => (
              <div key={item.rank} className="flex items-start gap-4 p-4 rounded-xl border"
                style={{ borderColor: item.color + "30", background: item.color + "06" }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-black flex-shrink-0"
                  style={{ background: item.color }}>
                  {item.rank}
                </div>
                <div>
                  <div className="font-bold text-gray-800">{item.area}</div>
                  <div className="text-sm text-gray-500 mt-0.5">{item.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
