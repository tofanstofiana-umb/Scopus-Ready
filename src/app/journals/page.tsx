"use client";
import { AppShell } from "@/components/AppShell";
import { journalTargets } from "@/lib/mockData";
import { ExternalLink, Star, CheckCircle2, AlertTriangle, Target, Plus } from "lucide-react";

const fitStatusConfig: Record<string, { color: string; bg: string }> = {
  "Sangat Sesuai": { color: "#10B981", bg: "rgba(16,185,129,0.08)" },
  "Sesuai": { color: "#0B4EA2", bg: "rgba(11,78,162,0.06)" },
  "Pertimbangkan Kembali": { color: "#F59E0B", bg: "rgba(245,158,11,0.08)" },
};

const strategyLabels: Record<string, { label: string; desc: string; color: string }> = {
  ambisius: { label: "Target Ambisius", desc: "Peluang kompetitif, impact tinggi", color: "#D9A441" },
  seimbang: { label: "Target Seimbang", desc: "Peluang realistis, kualitas baik", color: "#0B4EA2" },
  realistis: { label: "Target Realistis", desc: "Peluang lebih tinggi, respons cepat", color: "#10B981" },
};

const fitComponents = [
  { name: "Scope", weight: 25 },
  { name: "Topik", weight: 15 },
  { name: "Kontribusi", weight: 15 },
  { name: "Metode", weight: 10 },
  { name: "Pembaca", weight: 10 },
  { name: "Quartile/Index", weight: 10 },
  { name: "Biaya", weight: 5 },
  { name: "Author Guidelines", weight: 5 },
  { name: "Strategi", weight: 5 },
];

export default function JournalsPage() {
  return (
    <AppShell title="Journal Target" subtitle="Strategi tiga jurnal untuk memaksimalkan peluang publikasi">
      <div className="space-y-6 animate-fade-in">

        {/* Strategy overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {journalTargets.map((journal) => {
            const strategy = strategyLabels[journal.strategy];
            const fitCfg = fitStatusConfig[journal.fitStatus];
            return (
              <div key={journal.id} className="bg-white rounded-2xl shadow-sm overflow-hidden card-hover">
                <div className="h-1.5" style={{ background: strategy.color }} />
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                      style={{ color: strategy.color, background: strategy.color + "15" }}>
                      {strategy.label}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ color: fitCfg.color, background: fitCfg.bg }}>
                      {journal.fitScore}/100
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1">{journal.name}</h3>
                  <div className="text-xs text-gray-400 mb-3">{journal.publisher}</div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="badge text-xs" style={{ background: "rgba(11,78,162,0.08)", color: "#0B4EA2" }}>{journal.quartile}</span>
                    {journal.scopus && <span className="badge text-xs" style={{ background: "rgba(16,185,129,0.08)", color: "#10B981" }}>Scopus</span>}
                    <span className="badge text-xs" style={{ background: "rgba(217,164,65,0.1)", color: "#c8932d" }}>{journal.openAccess}</span>
                  </div>
                  <div className="space-y-1 text-xs text-gray-500">
                    <div className="flex justify-between"><span>APC:</span> <span className="font-semibold text-gray-700">{journal.apc}</span></div>
                    <div className="flex justify-between"><span>Word Limit:</span> <span className="font-semibold text-gray-700">{journal.wordLimit}</span></div>
                  </div>
                  <div className="progress-bar mt-3">
                    <div className="progress-fill" style={{ width: `${journal.fitScore}%`, background: fitCfg.color }} />
                  </div>
                  <div className="text-xs mt-1 font-bold" style={{ color: fitCfg.color }}>{journal.fitStatus}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Journal Fit Score breakdown */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-900">Journal Fit Score — Education & Information Technologies</h2>
              <p className="text-xs text-gray-400 mt-0.5">Skor ini adalah alat bantu internal dan bukan prediksi penerimaan</p>
            </div>
            <div className="text-2xl font-black" style={{ color: "#10B981" }}>88/100</div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {fitComponents.map((comp, i) => {
                const mockScore = [22, 13, 13, 9, 8, 9, 4, 4, 4][i] || 5;
                const pct = Math.round((mockScore / comp.weight) * 100);
                const color = pct >= 80 ? "#10B981" : pct >= 60 ? "#F59E0B" : "#EF4444";
                return (
                  <div key={comp.name} className="p-4 rounded-xl" style={{ background: "#F8FAFC" }}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-700">{comp.name}</span>
                      <span className="text-xs font-bold" style={{ color }}>
                        {mockScore}/{comp.weight}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Bobot: {comp.weight}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Add journal CTA */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Tambah Jurnal Target</h2>
            <button id="btn-add-journal" className="btn-primary text-sm">
              <Plus size={16} /> Tambah Jurnal
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {["Nama Jurnal", "Publisher", "Scope Jurnal", "Quartile", "APC", "URL"].map(field => (
              <div key={field}>
                <label className="block text-xs font-semibold text-gray-600 mb-1">{field}</label>
                <input id={`journal-field-${field.toLowerCase().replace(" ", "-")}`}
                  className="input-field text-sm" placeholder={`Masukkan ${field.toLowerCase()}...`} />
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 rounded-xl text-sm" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)" }}>
            <div className="flex gap-2">
              <AlertTriangle size={16} style={{ color: "#F59E0B", flexShrink: 0 }} />
              <div className="text-gray-600">
                <strong>Catatan:</strong> Data jurnal (quartile, indexing, APC) dapat berubah. Selalu verifikasi langsung ke website jurnal sebelum submission.
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
