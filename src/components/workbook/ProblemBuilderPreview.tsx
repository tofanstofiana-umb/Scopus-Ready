"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Lightbulb,
  MessageSquareText,
  Save,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";

type PreviewContent = {
  topic: string;
  phenomenon: string;
  problem: string;
  evidence: string;
  importance: string;
};

type PreviewSaveStatus = "idle" | "saving" | "saved";

const fields: Array<{
  key: keyof PreviewContent;
  shortLabel: string;
  question: string;
  helper: string;
  placeholder: string;
  tip: string;
  maxLength: number;
}> = [
  {
    key: "topic",
    shortLabel: "Topik",
    question: "Apa topik penelitian Anda?",
    helper: "Tuliskan bidang atau tema utama penelitian yang ingin Anda kembangkan.",
    placeholder: "Contoh: pemanfaatan kecerdasan buatan dalam pembelajaran di perguruan tinggi...",
    tip: "Mulai dari satu topik yang spesifik. Hindari menggabungkan terlalu banyak isu dalam satu jawaban.",
    maxLength: 500,
  },
  {
    key: "phenomenon",
    shortLabel: "Fenomena",
    question: "Fenomena apa yang sedang terjadi?",
    helper: "Jelaskan kondisi, perubahan, atau pola nyata yang Anda amati.",
    placeholder: "Ceritakan fenomena yang terlihat pada konteks penelitian Anda...",
    tip: "Gunakan konteks yang jelas: siapa yang terdampak, di mana fenomena terjadi, dan sejak kapan terlihat.",
    maxLength: 1000,
  },
  {
    key: "problem",
    shortLabel: "Masalah",
    question: "Apa masalah utama yang perlu diselesaikan?",
    helper: "Jelaskan kondisi yang belum optimal atau pertanyaan yang belum terjawab.",
    placeholder: "Jelaskan kesenjangan antara kondisi yang diharapkan dan kondisi saat ini...",
    tip: "Bedakan masalah penelitian dari gejala. Fokus pada penyebab atau persoalan inti yang dapat diteliti.",
    maxLength: 1000,
  },
  {
    key: "evidence",
    shortLabel: "Bukti",
    question: "Apa bukti bahwa masalah tersebut benar-benar ada?",
    helper: "Gunakan data awal, statistik, laporan, atau temuan penelitian terdahulu.",
    placeholder: "Tuliskan bukti awal dan sumber yang mendukung keberadaan masalah...",
    tip: "Prioritaskan sumber terbaru dan dapat diverifikasi. Catat asal data agar mudah digunakan kembali.",
    maxLength: 1200,
  },
  {
    key: "importance",
    shortLabel: "Urgensi",
    question: "Mengapa masalah tersebut penting untuk diteliti?",
    helper: "Jelaskan dampak ilmiah atau praktis jika masalah tidak diselesaikan.",
    placeholder: "Jelaskan siapa yang akan memperoleh manfaat dan mengapa penelitian ini perlu dilakukan...",
    tip: "Hubungkan urgensi dengan dampak nyata, kontribusi ilmu, atau kebutuhan pengambilan keputusan.",
    maxLength: 1000,
  },
];

const initialContent: PreviewContent = {
  topic:
    "Pemanfaatan kecerdasan buatan untuk meningkatkan kualitas pembelajaran di perguruan tinggi.",
  phenomenon:
    "Penggunaan alat berbasis AI meningkat pesat, tetapi penerapannya belum disertai pedoman pembelajaran yang konsisten.",
  problem: "",
  evidence: "",
  importance: "",
};

export function ProblemBuilderPreview() {
  const [activeStep, setActiveStep] = useState(0);
  const [content, setContent] = useState(initialContent);
  const [saveStatus, setSaveStatus] = useState<PreviewSaveStatus>("saved");
  const saveTimerRef = useRef<number | null>(null);
  const field = fields[activeStep];

  const completedCount = useMemo(
    () => fields.filter((item) => content[item.key].trim().length > 0).length,
    [content],
  );
  const completion = Math.round((completedCount / fields.length) * 100);

  useEffect(
    () => () => {
      if (saveTimerRef.current !== null) {
        window.clearTimeout(saveTimerRef.current);
      }
    },
    [],
  );

  function updateAnswer(value: string) {
    setContent((current) => ({ ...current, [field.key]: value }));
    setSaveStatus("saving");

    if (saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = window.setTimeout(() => {
      setSaveStatus("saved");
      saveTimerRef.current = null;
    }, 700);
  }

  function goToStep(step: number) {
    setActiveStep(Math.max(0, Math.min(fields.length - 1, step)));
  }

  return (
    <AppShell
      title="Problem Builder"
      subtitle="Temukan masalah penelitian yang layak dikembangkan menjadi artikel."
      actions={
        <span className="hidden rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-blue-700 sm:inline-flex">
          Preview visual
        </span>
      }
    >
      <div className="mx-auto max-w-[1180px] space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/dashboard"
            className="inline-flex min-h-10 w-fit items-center gap-2 rounded-lg px-2 text-xs font-extrabold text-[#0B4EA2] transition hover:bg-blue-50"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Kembali ke Dashboard
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-extrabold text-blue-700">
              Sedang Dikerjakan
            </span>
            <span className="text-xs font-bold text-slate-500">{completion}% lengkap</span>
          </div>
        </div>

        <section className="section-card overflow-visible">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#0B4EA2]">
                  Worksheet 1 · Problem Builder
                </p>
                <h2 className="mt-2 text-xl font-extrabold tracking-[-0.02em] text-[#082B5C] sm:text-2xl">
                  Rumuskan masalah penelitian Anda
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Jawab lima pertanyaan secara bertahap. Anda dapat kembali ke langkah sebelumnya kapan saja.
                </p>
              </div>
              <div className="shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-right">
                <div className="text-xs font-extrabold text-[#082B5C]">Langkah {activeStep + 1} dari 5</div>
                <div className="mt-1 text-[10px] text-slate-500">{completedCount} jawaban telah diisi</div>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto pb-2">
              <div className="flex min-w-[640px] items-start">
                {fields.map((item, index) => {
                  const isComplete = content[item.key].trim().length > 0;
                  const isActive = index === activeStep;
                  return (
                    <div key={item.key} className="flex flex-1 items-start">
                      <button
                        type="button"
                        onClick={() => goToStep(index)}
                        className="group flex min-w-[82px] flex-col items-center text-center"
                        aria-current={isActive ? "step" : undefined}
                      >
                        <span
                          className={`grid h-9 w-9 place-items-center rounded-full border-2 text-xs font-black transition ${
                            isActive
                              ? "border-[#0B4EA2] bg-[#0B4EA2] text-white shadow-[0_0_0_5px_rgba(11,78,162,0.10)]"
                              : isComplete
                                ? "border-emerald-500 bg-emerald-500 text-white"
                                : "border-slate-200 bg-white text-slate-400 group-hover:border-blue-300"
                          }`}
                        >
                          {isComplete && !isActive ? <Check size={16} aria-hidden="true" /> : index + 1}
                        </span>
                        <span className={`mt-2 text-[10px] font-bold ${isActive ? "text-[#0B4EA2]" : "text-slate-400"}`}>
                          {item.shortLabel}
                        </span>
                      </button>
                      {index < fields.length - 1 && (
                        <div className={`mt-[17px] h-0.5 flex-1 ${isComplete ? "bg-emerald-400" : "bg-slate-200"}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid xl:grid-cols-[minmax(0,1fr)_310px]">
            <div className="min-w-0 p-5 sm:p-7 lg:p-8">
              <div className="mx-auto max-w-[820px]">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#EEF4FB] text-[#0B4EA2]">
                    <Lightbulb size={18} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#D09222]">
                      Pertanyaan {activeStep + 1}
                    </p>
                    <h3 className="mt-1 text-lg font-extrabold leading-snug text-[#172033] sm:text-xl">
                      {field.question}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{field.helper}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <label htmlFor={`preview-${field.key}`} className="sr-only">
                    {field.question}
                  </label>
                  <textarea
                    id={`preview-${field.key}`}
                    value={content[field.key]}
                    onChange={(event) => updateAnswer(event.target.value)}
                    maxLength={field.maxLength}
                    placeholder={field.placeholder}
                    className="min-h-[280px] w-full resize-y rounded-2xl border border-slate-300 bg-white p-4 text-[15px] leading-7 text-[#172033] shadow-inner shadow-slate-100/70 transition placeholder:text-slate-400 hover:border-slate-400 focus:border-[#0B4EA2] focus:outline-none focus:ring-4 focus:ring-blue-100 sm:min-h-[320px] sm:p-5"
                  />
                  <div className="mt-2 flex items-center justify-between gap-3 text-[11px] text-slate-400">
                    <span>Gunakan kalimat singkat dan spesifik.</span>
                    <span className="font-semibold tabular-nums">
                      {content[field.key].length}/{field.maxLength}
                    </span>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
                  <div className="flex items-start gap-3">
                    <Lightbulb size={17} className="mt-0.5 shrink-0 text-[#0B4EA2]" aria-hidden="true" />
                    <div>
                      <h4 className="text-xs font-extrabold text-[#082B5C]">Tips Menjawab</h4>
                      <p className="mt-1 text-xs leading-5 text-slate-600">{field.tip}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <aside className="border-t border-slate-100 bg-[#FAFBFD] p-5 sm:p-6 xl:border-l xl:border-t-0">
              <div className="xl:sticky xl:top-24">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-extrabold text-[#082B5C]">Catatan Trainer</h3>
                  <MessageSquareText size={18} className="text-[#0B4EA2]" aria-hidden="true" />
                </div>

                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700">
                      Feedback
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-[9px] font-extrabold text-red-700">
                      <AlertTriangle size={11} aria-hidden="true" />
                      Prioritas Tinggi
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-700">
                    Bukti masalah masih terlalu umum. Tambahkan sumber atau data awal yang mendukung fenomena penelitian.
                  </p>
                  <div className="mt-4 border-t border-amber-200/70 pt-3">
                    <div className="text-[10px] font-bold text-slate-500">Dr. Siti Rahayu</div>
                    <div className="mt-1 text-[9px] text-slate-400">12 Mei 2026 · 10.30</div>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                  <h4 className="text-xs font-extrabold text-[#082B5C]">Status Worksheet</h4>
                  <div className="mt-3 space-y-3 text-xs">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-500">Kelengkapan</span>
                      <span className="font-extrabold text-[#082B5C]">{completion}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-[#0B4EA2] transition-all" style={{ width: `${completion}%` }} />
                    </div>
                    <div className="flex items-center gap-2 text-blue-700">
                      <Clock3 size={14} aria-hidden="true" />
                      <span className="font-bold">Sedang Dikerjakan</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <div className="sticky bottom-[68px] z-20 border-t border-slate-200 bg-white/95 px-5 py-4 backdrop-blur-lg sm:px-7 lg:bottom-0">
            <div className="mx-auto flex max-w-[1130px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div
                aria-live="polite"
                className={`inline-flex min-h-10 items-center gap-2 text-xs font-bold ${
                  saveStatus === "saving" ? "text-blue-700" : "text-emerald-700"
                }`}
              >
                {saveStatus === "saving" ? (
                  <>
                    <Save size={16} className="animate-pulse" aria-hidden="true" />
                    Menyimpan perubahan...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} aria-hidden="true" />
                    Tersimpan · status visual
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 sm:flex">
                <button
                  type="button"
                  onClick={() => goToStep(activeStep - 1)}
                  disabled={activeStep === 0}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] border border-slate-300 bg-white px-4 text-xs font-extrabold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={16} aria-hidden="true" />
                  Sebelumnya
                </button>
                <button
                  type="button"
                  onClick={() => goToStep(activeStep + 1)}
                  disabled={activeStep === fields.length - 1}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[10px] bg-[#0B4EA2] px-4 text-xs font-extrabold text-white transition hover:bg-[#083F85] disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  Berikutnya
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </section>

        <p className="text-center text-[10px] leading-5 text-slate-400">
          Preview Sprint 0 · perubahan hanya disimpan sementara di browser dan belum dikirim ke database.
        </p>
      </div>
    </AppShell>
  );
}
