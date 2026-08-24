"use client";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { moduleProgress } from "@/lib/mockData";
import { ChevronRight, Lock, CheckCircle2, AlertTriangle, Clock } from "lucide-react";

const statusConfig = {
  done: { label: "Selesai", color: "#10B981", bg: "rgba(16,185,129,0.08)", icon: CheckCircle2 },
  revision: { label: "Perlu Revisi", color: "#F59E0B", bg: "rgba(245,158,11,0.08)", icon: AlertTriangle },
  warning: { label: "Masalah Penting", color: "#EF4444", bg: "rgba(239,68,68,0.08)", icon: AlertTriangle },
  empty: { label: "Belum Dikerjakan", color: "#9CA3AF", bg: "rgba(156,163,175,0.08)", icon: Clock },
};

const moduleDescriptions: Record<string, string> = {
  problem: "Temukan dan artikulasikan masalah penelitian Anda dengan jelas.",
  literature: "Catat dan peta artikel-artikel referensi penelitian Anda.",
  gap: "Identifikasi research gap yang menjadi landasan novelty Anda.",
  novelty: "Definisikan apa yang benar-benar baru dari penelitian Anda.",
  blueprint: "Buat peta lengkap artikel dari masalah hingga kontribusi.",
  method: "Pastikan metode penelitian sesuai dengan pertanyaan penelitian.",
  story: "Bangun narasi ilmiah: Pendahuluan, Hasil, dan Pembahasan.",
  journal: "Temukan dan evaluasi jurnal yang paling sesuai.",
  review: "Review internal manuskrip dari perspektif reviewer.",
  adaptation: "Sesuaikan manuskrip dengan aturan jurnal target.",
  checklist: "Pastikan semua dokumen submission sudah siap.",
  roadmap: "Buat jadwal kerja menuju submission.",
};

export default function WorkbookPage() {
  const total = moduleProgress.length;
  const done = moduleProgress.filter(m => m.status === "done").length;

  return (
    <AppShell title="Workbook" subtitle="12 modul dari ide penelitian hingga submission">
      <div className="space-y-6 animate-fade-in">
        {/* Header stats */}
        <div className="rounded-2xl p-6 text-white"
          style={{ background: "linear-gradient(135deg, #082B5C 0%, #0B4EA2 100%)" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-black">SCOPUS READY™ Workbook</h2>
              <p className="text-white/60 text-sm mt-1">Bangun. Review. Perbaiki. Siapkan untuk Publikasi.</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black" style={{ color: "#D9A441" }}>{done}/{total}</div>
              <div className="text-white/50 text-xs">Modul Selesai</div>
            </div>
          </div>
          {/* Progress track */}
          <div className="flex gap-1.5">
            {moduleProgress.map((m) => (
              <div
                key={m.id}
                className="flex-1 h-2 rounded-full"
                style={{
                  background: m.status === "done" ? "#10B981" :
                              m.status === "revision" ? "#F59E0B" :
                              m.status === "warning" ? "#EF4444" : "rgba(255,255,255,0.15)"
                }}
              />
            ))}
          </div>
        </div>

        {/* Module grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {moduleProgress.map((module, index) => {
            const st = statusConfig[module.status as keyof typeof statusConfig];
            const Icon = st.icon;
            const isLocked = index > done + 1; // allow working ahead by 1

            return (
              <Link key={module.id} href={isLocked ? "#" : `/workbook/${module.id}`}>
                <div className={`bg-white rounded-2xl shadow-sm overflow-hidden transition-all ${isLocked ? "opacity-50 cursor-not-allowed" : "card-hover cursor-pointer"}`}>
                  {/* Top color strip */}
                  <div className="h-1.5" style={{ background: isLocked ? "#E5E7EB" : st.color }} />

                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {/* Number badge */}
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black"
                          style={{
                            background: isLocked ? "#F3F4F6" : st.color + "18",
                            color: isLocked ? "#9CA3AF" : st.color
                          }}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-sm">{module.name}</div>
                          {module.letter && (
                            <div className="text-xs font-black" style={{ color: "#D9A441" }}>
                              Tahap "{module.letter}"
                            </div>
                          )}
                        </div>
                      </div>
                      {isLocked ? (
                        <Lock size={16} className="text-gray-300 mt-0.5" />
                      ) : (
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1"
                          style={{ color: st.color, background: st.bg }}
                        >
                          <Icon size={12} />
                          {st.label}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-500 leading-relaxed mb-4">
                      {moduleDescriptions[module.id]}
                    </p>

                    <div className="flex items-center justify-between">
                      {module.score > 0 ? (
                        <div>
                          <div className="text-xs text-gray-400 mb-1">Skor</div>
                          <div className="progress-bar w-24">
                            <div className="progress-fill" style={{
                              width: `${(module.score / module.maxScore) * 100}%`,
                              background: st.color
                            }} />
                          </div>
                          <div className="text-xs mt-1 font-semibold" style={{ color: st.color }}>
                            {module.score}/{module.maxScore}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-300">Belum ada skor</div>
                      )}

                      {!isLocked && (
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center"
                          style={{ background: st.color + "12", color: st.color }}
                        >
                          <ChevronRight size={16} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
