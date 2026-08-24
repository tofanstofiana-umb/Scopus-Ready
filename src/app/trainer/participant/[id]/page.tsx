"use client";
import { use } from "react";
import { AppShell } from "@/components/AppShell";
import { trainerParticipants, moduleProgress } from "@/lib/mockData";
import Link from "next/link";
import { ChevronLeft, MessageSquare, Star, CheckCircle2, AlertTriangle } from "lucide-react";

const statusConfig = {
  done: { color: "#10B981", label: "Selesai" },
  revision: { color: "#F59E0B", label: "Revisi" },
  warning: { color: "#EF4444", label: "Masalah" },
  empty: { color: "#9CA3AF", label: "Kosong" },
};

const feedbackOptions = ["Sudah Baik", "Perlu Revisi", "Masalah Penting"];

export default function ParticipantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const participant = trainerParticipants.find(p => p.id === id) || trainerParticipants[0];

  return (
    <AppShell role="trainer" title={participant.name} subtitle={participant.institution}>
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        {/* Back */}
        <Link href="/trainer" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors">
          <ChevronLeft size={16} /> Kembali ke Daftar Peserta
        </Link>

        {/* Participant header */}
        <div className="rounded-2xl p-6 text-white" style={{ background: "linear-gradient(135deg, #082B5C, #0B4EA2)" }}>
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black flex-shrink-0"
              style={{ background: "rgba(217,164,65,0.2)", border: "1px solid rgba(217,164,65,0.3)" }}>
              {participant.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-black">{participant.name}</h2>
              <div className="text-white/60 text-sm">{participant.institution}</div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-black">{participant.progress}%</div>
                <div className="text-xs text-white/50">Progres</div>
              </div>
              <div>
                <div className="text-2xl font-black" style={{ color: "#D9A441" }}>{participant.score}</div>
                <div className="text-xs text-white/50">Score</div>
              </div>
              <div>
                <div className="text-sm font-bold px-2 py-1 rounded-full mt-1"
                  style={{ background: "rgba(245,158,11,0.2)", color: "#F59E0B" }}>
                  {participant.status}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Module progress */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Progress per Modul</h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {moduleProgress.map((module, i) => {
              const st = statusConfig[module.status as keyof typeof statusConfig];
              return (
                <div key={module.id} className="flex items-center gap-4 p-3 rounded-xl" style={{ background: "#F8FAFC" }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black"
                    style={{ background: st.color }}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-700">{module.name}</div>
                    <div className="progress-bar mt-1" style={{ height: "4px" }}>
                      <div className="progress-fill" style={{
                        width: module.maxScore > 0 ? `${(module.score / module.maxScore) * 100}%` : "0%",
                        background: st.color
                      }} />
                    </div>
                  </div>
                  <div className="text-xs font-bold" style={{ color: st.color }}>
                    {module.score > 0 ? `${module.score}/${module.maxScore}` : "—"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trainer feedback form */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <MessageSquare size={18} style={{ color: "#0B4EA2" }} />
            <h2 className="font-bold text-gray-900">Berikan Feedback</h2>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Pilih Modul</label>
              <select id="feedback-module-select" className="input-field">
                {moduleProgress.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["Kekuatan", "Masalah", "Dampak", "Saran"].map(field => (
                <div key={field}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{field}</label>
                  <textarea id={`feedback-${field.toLowerCase()}`} className="input-field" rows={3}
                    placeholder={`Tulis ${field.toLowerCase()} di sini...`} />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Prioritas Perbaikan</label>
              <textarea id="feedback-priority" className="input-field" rows={2}
                placeholder="Urutan prioritas perbaikan yang disarankan..." />
            </div>
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status Feedback</label>
                <div className="flex gap-3">
                  {feedbackOptions.map(opt => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="feedback-status" className="w-4 h-4" />
                      <span className="text-sm font-medium text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button id="btn-submit-feedback" className="btn-primary">
                <MessageSquare size={16} /> Kirim Feedback
              </button>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Beri Skor (opsional)</label>
                <div className="flex gap-1">
                  {[1,2,3,4,5,6,7,8,9,10].map(n => (
                    <button key={n} id={`score-btn-${n}`}
                      className="w-7 h-7 rounded-lg text-xs font-bold transition-all hover:bg-blue-50"
                      style={{ border: "1.5px solid #E5E7EB" }}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
