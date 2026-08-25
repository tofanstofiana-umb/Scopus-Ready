import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FilePenLine,
  MessageSquareText,
  Sparkles,
  Target,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";

const priorities = [
  {
    title: "Perkuat Novelty",
    detail: "Jelaskan pembeda utama dari penelitian sebelumnya.",
    score: "6/12",
    tone: "border-amber-200 bg-amber-50 text-amber-700",
  },
  {
    title: "Perbaiki Discussion",
    detail: "Hubungkan temuan dengan literatur yang relevan.",
    score: "7/12",
    tone: "border-amber-200 bg-amber-50 text-amber-700",
  },
  {
    title: "Lengkapi Journal Fit",
    detail: "Verifikasi kembali scope jurnal target.",
    score: "5/8",
    tone: "border-blue-200 bg-blue-50 text-blue-700",
  },
];

const journey = [
  { label: "S", name: "Start", state: "done" },
  { label: "C", name: "Context", state: "done" },
  { label: "O", name: "Opportunity", state: "done" },
  { label: "P", name: "Problem", state: "active" },
  { label: "U", name: "Understanding", state: "todo" },
  { label: "S", name: "Strategy", state: "todo" },
  { label: "R", name: "Research", state: "todo" },
  { label: "E", name: "Evidence", state: "todo" },
  { label: "A", name: "Analysis", state: "todo" },
  { label: "D", name: "Discussion", state: "todo" },
  { label: "Y", name: "Ready", state: "todo" },
];

export function ParticipantDashboardPreview() {
  return (
    <AppShell
      title="Selamat datang, Tofan"
      subtitle="Lanjutkan pengembangan manuskrip Anda."
      actions={
        <span className="hidden rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-blue-700 sm:inline-flex">
          Preview visual
        </span>
      }
    >
      <div className="mx-auto max-w-[1200px] space-y-6">
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
          <div className="wireframe-hero p-5 sm:p-7">
            <div className="relative z-10 grid gap-6 sm:grid-cols-[minmax(0,1fr)_180px] sm:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#F4BF4F]">
                    <Sparkles size={12} aria-hidden="true" />
                    Proyek Aktif
                  </span>
                  <span className="rounded-full bg-blue-400/15 px-3 py-1 text-[10px] font-bold text-blue-100">
                    Sedang Dikerjakan
                  </span>
                </div>

                <h2 className="mt-4 max-w-2xl text-xl font-extrabold leading-snug tracking-[-0.02em] text-white sm:text-2xl">
                  Pemanfaatan AI untuk Meningkatkan Kualitas Pembelajaran
                </h2>
                <p className="mt-2 text-sm leading-6 text-white/65">
                  Bidang Pendidikan · Target manuskrip jurnal internasional
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href="/workbook/problem-builder"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] bg-[#D9A441] px-4 text-xs font-extrabold text-[#082B5C] transition hover:bg-[#E8B64E]"
                  >
                    Lanjutkan Problem Builder
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                  <Link
                    href="/workbook"
                    className="inline-flex min-h-11 items-center justify-center rounded-[10px] border border-white/25 px-4 text-xs font-bold text-white transition hover:bg-white/10"
                  >
                    Lihat Workbook
                  </Link>
                </div>
              </div>

              <div className="flex flex-col items-center rounded-2xl border border-white/12 bg-white/[0.07] p-5 text-center backdrop-blur-sm">
                <div
                  className="grid h-28 w-28 place-items-center rounded-full p-2"
                  style={{
                    background:
                      "conic-gradient(#F4BF4F 0 72%, rgba(255,255,255,.14) 72% 100%)",
                  }}
                  aria-label="Progres manuskrip 72 persen"
                >
                  <div className="grid h-full w-full place-items-center rounded-full bg-[#082B5C]">
                    <div>
                      <div className="text-2xl font-black text-white">72%</div>
                      <div className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-white/55">
                        Progres
                      </div>
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-[11px] leading-5 text-white/65">
                  8 dari 12 modul telah dikerjakan
                </p>
              </div>
            </div>
          </div>

          <div className="section-card flex flex-col p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#0B4EA2]">
                  Penilaian Kesiapan Manuskrip
                </p>
                <h2 className="mt-2 text-lg font-extrabold text-[#082B5C]">
                  SCOPUS READY Score
                </h2>
              </div>
              <Target size={22} className="text-[#D9A441]" aria-hidden="true" />
            </div>

            <div className="my-5 flex items-end gap-2">
              <span className="text-5xl font-black tracking-[-0.06em] text-[#082B5C]">78</span>
              <span className="pb-1 text-sm font-bold text-slate-400">/100</span>
            </div>

            <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-3">
              <div className="flex items-center gap-2 text-xs font-extrabold text-amber-800">
                <Clock3 size={15} aria-hidden="true" />
                Perlu Revisi Besar
              </div>
              <p className="mt-1.5 text-[11px] leading-5 text-amber-700">
                Prioritaskan novelty dan pembahasan sebelum tahap review berikutnya.
              </p>
            </div>

            <Link
              href="/score"
              className="mt-auto inline-flex min-h-11 items-center justify-between rounded-[10px] border border-[#DCE3EC] px-4 text-xs font-extrabold text-[#0B4EA2] transition hover:border-blue-200 hover:bg-blue-50"
            >
              Lihat detail penilaian
              <ChevronRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(310px,0.6fr)]">
          <div className="section-card">
            <div className="section-card-header">
              <div>
                <h2 className="text-base font-extrabold text-[#082B5C]">Prioritas Saya</h2>
                <p className="mt-1 text-xs text-slate-500">Tiga bagian yang paling berdampak pada kesiapan manuskrip.</p>
              </div>
              <FilePenLine size={20} className="text-[#0B4EA2]" aria-hidden="true" />
            </div>

            <div className="divide-y divide-slate-100 px-4 sm:px-5">
              {priorities.map((priority, index) => (
                <div
                  key={priority.title}
                  className="grid gap-3 py-4 sm:grid-cols-[34px_minmax(0,1fr)_auto] sm:items-center"
                >
                  <div className="hidden h-8 w-8 items-center justify-center rounded-lg bg-[#EEF4FB] text-xs font-black text-[#0B4EA2] sm:flex">
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-extrabold text-[#172033]">{priority.title}</h3>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-extrabold ${priority.tone}`}>
                        {priority.score}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{priority.detail}</p>
                  </div>
                  <Link
                    href="/workbook"
                    className="inline-flex min-h-10 w-fit items-center gap-1.5 rounded-lg px-3 text-xs font-extrabold text-[#0B4EA2] transition hover:bg-blue-50"
                  >
                    Perbaiki
                    <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="section-card">
            <div className="section-card-header">
              <h2 className="text-base font-extrabold text-[#082B5C]">Feedback Terbaru</h2>
              <MessageSquareText size={20} className="text-[#0B4EA2]" aria-hidden="true" />
            </div>
            <div className="p-5">
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700">
                    Research Gap
                  </span>
                  <span className="rounded-full bg-red-100 px-2 py-1 text-[9px] font-extrabold text-red-700">
                    Prioritas Tinggi
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  Research gap sudah cukup jelas, tetapi masih perlu bukti yang lebih kuat dari literatur terbaru.
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-amber-200/70 pt-3 text-[10px] text-slate-500">
                  <span>Dr. Siti Rahayu</span>
                  <span>2 jam lalu</span>
                </div>
              </div>
              <Link
                href="/review"
                className="mt-4 inline-flex min-h-10 items-center gap-2 text-xs font-extrabold text-[#0B4EA2]"
              >
                Buka semua feedback
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <section className="section-card p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-[#082B5C]">Perjalanan SCOPUS READY</h2>
              <p className="mt-1 text-xs text-slate-500">Problem Builder adalah modul aktif Anda saat ini.</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Selesai</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#0B4EA2]" /> Aktif</span>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto pb-2">
            <div className="flex min-w-[760px] items-start">
              {journey.map((step, index) => (
                <div key={`${step.label}-${step.name}`} className="flex flex-1 items-start">
                  <div className="flex min-w-12 flex-col items-center text-center">
                    <div
                      className={`grid h-9 w-9 place-items-center rounded-full border-2 text-xs font-black ${
                        step.state === "done"
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : step.state === "active"
                            ? "border-[#0B4EA2] bg-[#0B4EA2] text-white shadow-[0_0_0_5px_rgba(11,78,162,0.10)]"
                            : "border-slate-200 bg-white text-slate-400"
                      }`}
                    >
                      {step.state === "done" ? <CheckCircle2 size={16} aria-hidden="true" /> : step.label}
                    </div>
                    <span className={`mt-2 text-[9px] font-bold ${step.state === "active" ? "text-[#0B4EA2]" : "text-slate-400"}`}>
                      {step.name}
                    </span>
                  </div>
                  {index < journey.length - 1 && (
                    <div className={`mt-[17px] h-0.5 flex-1 ${step.state === "done" ? "bg-emerald-400" : "bg-slate-200"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <BookOpenCheck size={20} className="mt-0.5 shrink-0 text-[#0B4EA2]" aria-hidden="true" />
              <div>
                <h3 className="text-sm font-extrabold text-[#082B5C]">Modul aktif: Problem Builder</h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">Lengkapi pertanyaan tentang topik, fenomena, masalah, bukti, dan urgensi penelitian.</p>
              </div>
            </div>
            <Link
              href="/workbook/problem-builder"
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-[10px] bg-[#0B4EA2] px-4 text-xs font-extrabold text-white transition hover:bg-[#083F85]"
            >
              Lanjutkan Worksheet
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
