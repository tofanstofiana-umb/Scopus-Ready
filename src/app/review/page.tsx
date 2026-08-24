"use client";
import { AppShell } from "@/components/AppShell";
import { trainerFeedbacks } from "@/lib/mockData";
import { MessageSquare, CheckCircle2, AlertTriangle, XCircle, ChevronRight } from "lucide-react";

const gateDescriptions = [
  { id: 1, name: "Novelty", desc: "Apakah artikel ini memberi kontribusi pengetahuan baru yang nyata?", score: 7, maxScore: 12 },
  { id: 2, name: "Bukti", desc: "Apakah data dan analisis mendukung klaim yang dibuat?", score: 8, maxScore: 10 },
  { id: 3, name: "Logika", desc: "Apakah argumentasi dari masalah ke kesimpulan konsisten?", score: 9, maxScore: 10 },
  { id: 4, name: "Journal Fit", desc: "Apakah artikel sesuai dengan scope jurnal target?", score: 5, maxScore: 8 },
  { id: 5, name: "Kesiapan Teknis", desc: "Apakah format, referensi, dan bahasa sudah memenuhi standar?", score: 4, maxScore: 6 },
];

export default function ReviewPage() {
  return (
    <AppShell title="Internal Review" subtitle="Baca artikel Anda seperti reviewer">
      <div className="space-y-6 animate-fade-in">

        {/* Review overview */}
        <div className="rounded-2xl p-6 text-white"
          style={{ background: "linear-gradient(135deg, #082B5C, #0B4EA2)" }}>
          <h2 className="text-xl font-black mb-2">5 Gerbang Review Internal</h2>
          <p className="text-white/60 text-sm">Review sistematis sebelum submit adalah investasi terbaik untuk meningkatkan peluang penerimaan.</p>
        </div>

        {/* 5 gates */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {gateDescriptions.map((gate) => {
            const pct = Math.round((gate.score / gate.maxScore) * 100);
            const color = pct >= 80 ? "#10B981" : pct >= 60 ? "#F59E0B" : "#EF4444";
            return (
              <div key={gate.id} className="bg-white rounded-2xl shadow-sm p-5 card-hover">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm"
                    style={{ background: color }}>
                    {gate.id}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Gerbang {gate.id}</div>
                    <div className="text-xs font-semibold" style={{ color }}>{gate.name}</div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{gate.desc}</p>
                <div className="progress-bar mb-1">
                  <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color }}>Skor: {gate.score}/{gate.maxScore}</span>
                  <span className="text-gray-400">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trainer feedbacks */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Feedback dari Trainer</h2>
            <p className="text-xs text-gray-400 mt-0.5">Dr. Siti Rahayu, M.Pd. · Workshop Angkatan 01</p>
          </div>
          <div className="p-6 space-y-4">
            {trainerFeedbacks.map((fb) => {
              const cfg = fb.status === "good"
                ? { color: "#10B981", bg: "rgba(16,185,129,0.06)", label: "Sudah Baik", Icon: CheckCircle2 }
                : fb.status === "revision"
                ? { color: "#F59E0B", bg: "rgba(245,158,11,0.06)", label: "Perlu Revisi", Icon: AlertTriangle }
                : { color: "#EF4444", bg: "rgba(239,68,68,0.06)", label: "Masalah Penting", Icon: XCircle };
              return (
                <div key={fb.id} className="p-5 rounded-xl" style={{ background: cfg.bg, border: `1px solid ${cfg.color}25` }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <cfg.Icon size={16} style={{ color: cfg.color }} />
                      <span className="font-bold text-gray-800">{fb.module}</span>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full"
                      style={{ color: cfg.color, background: cfg.color + "18" }}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">{fb.comment}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{fb.trainerName} · {fb.createdAt}</span>
                    <button id={`btn-goto-module-${fb.id}`} className="flex items-center gap-1 font-semibold" style={{ color: "#0B4EA2" }}>
                      Perbaiki <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feedback form template */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-1">Self-Review Anda</h2>
          <p className="text-xs text-gray-400 mb-6">Isi self-review sebelum meminta penilaian trainer</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {["Kekuatan Utama Artikel", "Masalah yang Diidentifikasi", "Dampak Jika Tidak Diperbaiki", "Saran Perbaikan"].map(field => (
              <div key={field}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{field}</label>
                <textarea id={`review-field-${field.toLowerCase().replace(/ /g, "-")}`}
                  className="input-field" rows={4}
                  placeholder={`Tulis ${field.toLowerCase()} di sini...`} />
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-3">
            <button id="btn-submit-self-review" className="btn-primary">
              <MessageSquare size={16} /> Kirim ke Trainer
            </button>
            <select id="review-status-select" className="input-field w-auto" defaultValue="Revisi Kecil">
              <option value="Siap Submit">Siap Submit</option>
              <option value="Revisi Kecil">Revisi Kecil</option>
              <option value="Revisi Besar">Revisi Besar</option>
              <option value="Perlu Dibangun Ulang">Perlu Dibangun Ulang</option>
            </select>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
