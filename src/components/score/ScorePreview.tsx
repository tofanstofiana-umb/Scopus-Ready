import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Circle,
  FileWarning,
  Info,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";

const breakdown = [
  { label: "Masalah", score: 8, max: 8, tone: "bg-emerald-500" },
  { label: "Research Gap", score: 8, max: 12, tone: "bg-blue-500" },
  { label: "Novelty", score: 6, max: 12, tone: "bg-amber-500" },
  { label: "Kontribusi", score: 9, max: 10, tone: "bg-emerald-500" },
  { label: "Teori & Literatur", score: 9, max: 10, tone: "bg-emerald-500" },
  { label: "Metode", score: 11, max: 12, tone: "bg-emerald-500" },
  { label: "Hasil & Bukti", score: 10, max: 10, tone: "bg-emerald-500" },
  { label: "Pembahasan", score: 7, max: 12, tone: "bg-amber-500" },
  { label: "Journal Fit", score: 5, max: 8, tone: "bg-amber-500" },
  { label: "Bahasa & Teknis", score: 5, max: 6, tone: "bg-blue-500" },
];

const priorities = [
  {
    number: 1,
    title: "Novelty",
    status: "Perlu diperkuat",
    score: "6/12",
    description: "Perjelas pembeda utama dan nilai baru yang diberikan penelitian.",
    icon: Sparkles,
  },
  {
    number: 2,
    title: "Discussion",
    status: "Perlu diperbaiki",
    score: "7/12",
    description: "Hubungkan temuan dengan teori dan studi terdahulu secara lebih kritis.",
    icon: FileWarning,
  },
  {
    number: 3,
    title: "Journal Fit",
    status: "Perlu diverifikasi",
    score: "5/8",
    description: "Pastikan topik dan kontribusi manuskrip sesuai dengan scope jurnal target.",
    icon: Target,
  },
];

const gates = [
  { label: "Problem", state: "pass" },
  { label: "Gap", state: "pass" },
  { label: "Novelty", state: "attention" },
  { label: "Method", state: "pass" },
  { label: "Journal Fit", state: "attention" },
  { label: "Reviewer Readiness", state: "pending" },
] as const;

export function ScorePreview() {
  const totalScore = breakdown.reduce((total, item) => total + item.score, 0);
  const totalMaximum = breakdown.reduce((total, item) => total + item.max, 0);

  return (
    <AppShell
      title="SCOPUS READY Score"
      subtitle="Pahami kekuatan, kelemahan, dan prioritas perbaikan manuskrip Anda."
      actions={
        <span className="hidden rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-blue-700 sm:inline-flex">
          Preview visual
        </span>
      }
    >
      <div className="mx-auto max-w-[1200px] space-y-6">
        <section className="wireframe-hero p-5 sm:p-7 lg:p-8">
          <div className="relative z-10 grid gap-7 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-center">
            <div className="flex justify-center lg:justify-start">
              <div
                className="grid h-48 w-48 place-items-center rounded-full p-[11px] shadow-[0_18px_44px_rgba(0,0,0,0.22)]"
                style={{
                  background: `conic-gradient(#F4BF4F 0 ${totalScore}%, rgba(255,255,255,.15) ${totalScore}% 100%)`,
                }}
                aria-label={`SCOPUS READY Score ${totalScore} dari ${totalMaximum}`}
              >
                <div className="grid h-full w-full place-items-center rounded-full bg-[#082B5C] text-center ring-1 ring-white/10">
                  <div>
                    <div className="text-6xl font-black tracking-[-0.07em] text-white">{totalScore}</div>
                    <div className="mt-1 text-xs font-extrabold uppercase tracking-[0.16em] text-white/55">
                      dari {totalMaximum}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1.5 text-xs font-extrabold text-[#F4BF4F]">
                <AlertTriangle size={15} aria-hidden="true" />
                Perlu Revisi Besar
              </div>
              <h2 className="mt-4 max-w-2xl text-2xl font-extrabold leading-tight tracking-[-0.025em] text-white sm:text-3xl">
                Manuskrip memiliki fondasi kuat, tetapi belum siap memasuki tahap submit.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/67">
                Masalah, metode, dan bukti sudah menjadi kekuatan utama. Fokuskan perbaikan berikutnya pada novelty, pembahasan, dan kesesuaian jurnal.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href="#prioritas-perbaikan"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] bg-[#D9A441] px-4 text-xs font-extrabold text-[#082B5C] transition hover:bg-[#E8B64E]"
                >
                  Lihat Prioritas Perbaikan
                  <ArrowRight size={15} aria-hidden="true" />
                </a>
                <span className="inline-flex min-h-11 items-center gap-2 rounded-[10px] border border-white/15 px-4 text-xs font-bold text-white/70">
                  <ShieldCheck size={15} aria-hidden="true" />
                  3 dari 6 gate lulus
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3">
          <div className="flex items-start gap-3 text-xs leading-5 text-blue-900">
            <Info size={16} className="mt-0.5 shrink-0 text-[#0B4EA2]" aria-hidden="true" />
            <p>
              Score adalah indikator kesiapan berdasarkan rubrik, bukan jaminan manuskrip diterima oleh jurnal.
            </p>
          </div>
        </div>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(330px,0.8fr)]">
          <div id="breakdown-score" className="section-card">
            <div className="section-card-header">
              <div>
                <h2 className="text-base font-extrabold text-[#082B5C]">Breakdown Score</h2>
                <p className="mt-1 text-xs text-slate-500">Nilai setiap komponen pembentuk kesiapan manuskrip.</p>
              </div>
              <span className="rounded-lg bg-[#EEF4FB] px-3 py-2 text-xs font-black text-[#0B4EA2]">
                Total {totalScore}/{totalMaximum}
              </span>
            </div>

            <div className="divide-y divide-slate-100 px-4 sm:px-5">
              {breakdown.map((item) => {
                const percentage = Math.round((item.score / item.max) * 100);
                return (
                  <div key={item.label} className="grid grid-cols-[minmax(110px,0.8fr)_minmax(100px,1fr)_48px] items-center gap-3 py-3.5">
                    <span className="text-xs font-bold text-slate-700 sm:text-sm">{item.label}</span>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full rounded-full ${item.tone}`} style={{ width: `${percentage}%` }} />
                    </div>
                    <span className="text-right text-xs font-black tabular-nums text-[#082B5C]">
                      {item.score}/{item.max}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="section-card p-5 sm:p-6">
            <div>
              <h2 className="text-base font-extrabold text-[#082B5C]">Peta Kekuatan</h2>
              <p className="mt-1 text-xs text-slate-500">Perbandingan enam dimensi utama.</p>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-100 bg-[#FAFBFD] p-3">
              <svg viewBox="0 0 260 230" className="mx-auto block h-auto w-full max-w-[330px]" role="img" aria-label="Radar chart kesiapan manuskrip">
                <g fill="none" stroke="#DCE3EC" strokeWidth="1">
                  <polygon points="130,31 198,70 198,148 130,187 62,148 62,70" />
                  <polygon points="130,57 175,83 175,135 130,161 85,135 85,83" />
                  <polygon points="130,83 153,96 153,122 130,135 107,122 107,96" />
                  <line x1="130" y1="109" x2="130" y2="31" />
                  <line x1="130" y1="109" x2="198" y2="70" />
                  <line x1="130" y1="109" x2="198" y2="148" />
                  <line x1="130" y1="109" x2="130" y2="187" />
                  <line x1="130" y1="109" x2="62" y2="148" />
                  <line x1="130" y1="109" x2="62" y2="70" />
                </g>
                <polygon
                  points="130,31 176,83 164,129 130,181 91,132 87,84"
                  fill="rgba(11,78,162,.18)"
                  stroke="#0B4EA2"
                  strokeWidth="2.5"
                />
                <g fill="#0B4EA2">
                  <circle cx="130" cy="31" r="3.5" />
                  <circle cx="176" cy="83" r="3.5" />
                  <circle cx="164" cy="129" r="3.5" />
                  <circle cx="130" cy="181" r="3.5" />
                  <circle cx="91" cy="132" r="3.5" />
                  <circle cx="87" cy="84" r="3.5" />
                </g>
                <g fill="#526078" fontSize="9" fontWeight="700" textAnchor="middle">
                  <text x="130" y="17">Masalah</text>
                  <text x="222" y="67">Gap</text>
                  <text x="224" y="159">Novelty</text>
                  <text x="130" y="207">Metode</text>
                  <text x="36" y="159">Discussion</text>
                  <text x="34" y="67">Journal Fit</text>
                </g>
              </svg>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-[10px]">
              <div className="rounded-lg bg-emerald-50 px-3 py-2 font-bold text-emerald-700">Kekuatan: Masalah</div>
              <div className="rounded-lg bg-amber-50 px-3 py-2 font-bold text-amber-700">Terlemah: Novelty</div>
            </div>
          </div>
        </section>

        <section id="prioritas-perbaikan" className="scroll-mt-24">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-[#082B5C]">Prioritas Perbaikan</h2>
              <p className="mt-1 text-xs text-slate-500">Kerjakan tiga bagian ini untuk meningkatkan kualitas kesiapan.</p>
            </div>
            <Link href="/workbook/problem-builder" className="text-xs font-extrabold text-[#0B4EA2] hover:underline">
              Buka Workbook
            </Link>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {priorities.map((priority) => {
              const Icon = priority.icon;
              return (
                <article key={priority.title} className="section-card flex flex-col p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600">
                        <Icon size={19} aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Prioritas {priority.number}</p>
                        <h3 className="mt-0.5 text-base font-extrabold text-[#082B5C]">{priority.title}</h3>
                      </div>
                    </div>
                    <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-black text-slate-600">{priority.score}</span>
                  </div>
                  <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-extrabold text-amber-700">
                    {priority.status}
                  </div>
                  <p className="mt-3 flex-1 text-xs leading-6 text-slate-600">{priority.description}</p>
                  <Link
                    href="/workbook/problem-builder"
                    className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] bg-[#0B4EA2] px-4 text-xs font-extrabold text-white transition hover:bg-[#083F85]"
                  >
                    Perbaiki Sekarang
                    <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                </article>
              );
            })}
          </div>
        </section>

        <section className="section-card p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-[#082B5C]">Critical Gates</h2>
              <p className="mt-1 text-xs text-slate-500">Pemeriksaan minimum sebelum manuskrip dianggap siap melanjutkan proses.</p>
            </div>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-extrabold text-slate-500">
              3 Lulus · 2 Perhatian · 1 Belum Dinilai
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {gates.map((gate) => (
              <div
                key={gate.label}
                className={`flex min-h-14 items-center gap-3 rounded-xl border px-4 py-3 ${
                  gate.state === "pass"
                    ? "border-emerald-200 bg-emerald-50"
                    : gate.state === "attention"
                      ? "border-amber-200 bg-amber-50"
                      : "border-slate-200 bg-slate-50"
                }`}
              >
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${
                    gate.state === "pass"
                      ? "bg-emerald-500 text-white"
                      : gate.state === "attention"
                        ? "bg-amber-500 text-white"
                        : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {gate.state === "pass" ? (
                    <Check size={15} aria-hidden="true" />
                  ) : gate.state === "attention" ? (
                    <AlertTriangle size={14} aria-hidden="true" />
                  ) : (
                    <Circle size={13} aria-hidden="true" />
                  )}
                </span>
                <div>
                  <div className="text-xs font-extrabold text-[#172033]">{gate.label}</div>
                  <div className={`mt-0.5 text-[10px] font-bold ${
                    gate.state === "pass"
                      ? "text-emerald-700"
                      : gate.state === "attention"
                        ? "text-amber-700"
                        : "text-slate-500"
                  }`}>
                    {gate.state === "pass" ? "Lulus" : gate.state === "attention" ? "Perlu perhatian" : "Belum dinilai"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <p className="text-center text-[10px] leading-5 text-slate-400">
          Preview Sprint 0 · seluruh nilai pada halaman ini merupakan data contoh untuk persetujuan visual.
        </p>
      </div>
    </AppShell>
  );
}
