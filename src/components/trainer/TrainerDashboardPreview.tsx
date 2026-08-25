"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  MessageSquareText,
  Search,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";

type FilterKey = "all" | "feedback" | "revision" | "ready";

type Participant = {
  id: string;
  name: string;
  institution: string;
  project: string;
  progress: number;
  score: number;
  status: "Perlu Feedback" | "Perlu Revisi" | "Masalah Penting" | "Siap";
  filter: Exclude<FilterKey, "all">;
  feedback: number;
  lastActivity: string;
};

const participants: Participant[] = [
  {
    id: "ayu-lestari",
    name: "Ayu Lestari",
    institution: "Universitas Indonesia",
    project: "AI untuk Pembelajaran Adaptif",
    progress: 90,
    score: 87,
    status: "Perlu Revisi",
    filter: "revision",
    feedback: 2,
    lastActivity: "2 jam lalu",
  },
  {
    id: "budi-santoso",
    name: "Budi Santoso",
    institution: "Universitas Negeri Yogyakarta",
    project: "Literasi Digital Mahasiswa",
    progress: 62,
    score: 72,
    status: "Perlu Feedback",
    filter: "feedback",
    feedback: 0,
    lastActivity: "4 jam lalu",
  },
  {
    id: "citra-dewi",
    name: "Citra Dewi",
    institution: "Universitas Airlangga",
    project: "Model Intervensi Kesehatan Digital",
    progress: 100,
    score: 92,
    status: "Siap",
    filter: "ready",
    feedback: 0,
    lastActivity: "Kemarin",
  },
  {
    id: "deni-saputra",
    name: "Deni Saputra",
    institution: "Universitas Brawijaya",
    project: "Adopsi Teknologi pada UMKM",
    progress: 55,
    score: 65,
    status: "Masalah Penting",
    filter: "revision",
    feedback: 3,
    lastActivity: "3 hari lalu",
  },
  {
    id: "eka-rahma",
    name: "Eka Rahma",
    institution: "Universitas Diponegoro",
    project: "Kepemimpinan dan Kinerja Dosen",
    progress: 78,
    score: 80,
    status: "Perlu Feedback",
    filter: "feedback",
    feedback: 1,
    lastActivity: "5 jam lalu",
  },
  {
    id: "farhan-akbar",
    name: "Farhan Akbar",
    institution: "Universitas Hasanuddin",
    project: "Ketahanan Pangan Perkotaan",
    progress: 38,
    score: 58,
    status: "Masalah Penting",
    filter: "revision",
    feedback: 2,
    lastActivity: "6 hari lalu",
  },
  {
    id: "gita-permata",
    name: "Gita Permata",
    institution: "Universitas Padjadjaran",
    project: "Perilaku Konsumen Berkelanjutan",
    progress: 84,
    score: 83,
    status: "Perlu Revisi",
    filter: "revision",
    feedback: 1,
    lastActivity: "Kemarin",
  },
  {
    id: "hendra-wijaya",
    name: "Hendra Wijaya",
    institution: "Institut Teknologi Bandung",
    project: "Optimasi Energi Bangunan Pintar",
    progress: 100,
    score: 89,
    status: "Siap",
    filter: "ready",
    feedback: 0,
    lastActivity: "1 jam lalu",
  },
];

const filters: Array<{ key: FilterKey; label: string }> = [
  { key: "all", label: "Semua" },
  { key: "feedback", label: "Perlu Feedback" },
  { key: "revision", label: "Perlu Revisi" },
  { key: "ready", label: "Siap" },
];

const statusStyles: Record<Participant["status"], string> = {
  "Perlu Feedback": "border-blue-200 bg-blue-50 text-blue-700",
  "Perlu Revisi": "border-amber-200 bg-amber-50 text-amber-700",
  "Masalah Penting": "border-red-200 bg-red-50 text-red-700",
  Siap: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const summaryCards = [
  { label: "Total Peserta", value: "30", helper: "Workshop Angkatan 1", icon: Users, tone: "bg-blue-50 text-blue-700" },
  { label: "Rata-rata Progres", value: "67%", helper: "+5% dari minggu lalu", icon: BarChart3, tone: "bg-emerald-50 text-emerald-700" },
  { label: "Rata-rata Score", value: "74", helper: "Target kelas 80", icon: CheckCircle2, tone: "bg-violet-50 text-violet-700" },
  { label: "Perlu Perhatian", value: "8", helper: "4 belum aktif 3 hari", icon: AlertCircle, tone: "bg-red-50 text-red-700" },
];

export function TrainerDashboardPreview() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);

  const filteredParticipants = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("id-ID");
    return participants.filter((participant) => {
      const matchesFilter = activeFilter === "all" || participant.filter === activeFilter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        participant.name.toLocaleLowerCase("id-ID").includes(normalizedQuery) ||
        participant.project.toLocaleLowerCase("id-ID").includes(normalizedQuery) ||
        participant.institution.toLocaleLowerCase("id-ID").includes(normalizedQuery);
      return matchesFilter && matchesQuery;
    });
  }, [activeFilter, query]);

  return (
    <AppShell
      role="trainer"
      title="Dashboard Trainer"
      subtitle="Temukan peserta yang paling membutuhkan bantuan."
      actions={
        <span className="hidden rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-blue-700 sm:inline-flex">
          Preview visual
        </span>
      }
    >
      <div className="mx-auto max-w-[1280px] space-y-6">
        <section className="wireframe-hero p-5 sm:p-7">
          <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#F4BF4F]">Kelas Aktif</div>
              <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.025em] text-white sm:text-3xl">Workshop SCOPUS READY Angkatan 1</h2>
              <p className="mt-2 text-sm leading-6 text-white/65">Periode Mei–Juli 2026 · Pendampingan manuskrip jurnal internasional</p>
            </div>

            <label className="relative block w-full max-w-sm lg:w-[310px]">
              <span className="mb-2 block text-[10px] font-extrabold uppercase tracking-wider text-white/55">Pilih kelas</span>
              <select className="min-h-11 w-full appearance-none rounded-[10px] border border-white/20 bg-white/10 px-4 pr-10 text-xs font-bold text-white outline-none transition focus:border-[#F4BF4F] focus:ring-2 focus:ring-[#F4BF4F]/20">
                <option className="text-slate-900">Workshop Angkatan 1</option>
                <option className="text-slate-900">Workshop Angkatan 2</option>
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute bottom-3.5 right-3 text-white/60" aria-hidden="true" />
            </label>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4" aria-label="Ringkasan kelas">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <article key={card.label} className="section-card p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{card.label}</p>
                    <div className="mt-2 text-2xl font-black tracking-[-0.04em] text-[#082B5C] sm:text-3xl">{card.value}</div>
                  </div>
                  <div className={`hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:flex ${card.tone}`}>
                    <Icon size={19} aria-hidden="true" />
                  </div>
                </div>
                <p className="mt-2 text-[10px] leading-4 text-slate-500">{card.helper}</p>
              </article>
            );
          })}
        </section>

        <section id="participants" className="section-card">
          <div className="border-b border-slate-100 px-4 py-5 sm:px-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-[#082B5C]">Daftar Peserta</h2>
                <p className="mt-1 text-xs text-slate-500">Menampilkan sampel 8 dari 30 peserta pada kelas aktif.</p>
              </div>

              <div className="flex w-full flex-col gap-3 xl:w-auto xl:items-end">
                <label className="relative block w-full xl:w-[320px]">
                  <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Cari peserta atau proyek"
                    className="min-h-11 w-full rounded-[10px] border border-slate-300 bg-white pl-10 pr-4 text-xs text-[#172033] outline-none transition placeholder:text-slate-400 focus:border-[#0B4EA2] focus:ring-4 focus:ring-blue-100"
                  />
                </label>

                <div className="flex max-w-full gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter peserta">
                  {filters.map((filter) => (
                    <button
                      key={filter.key}
                      type="button"
                      onClick={() => setActiveFilter(filter.key)}
                      className={`min-h-9 shrink-0 rounded-lg border px-3 text-[10px] font-extrabold transition ${
                        activeFilter === filter.key
                          ? "border-[#0B4EA2] bg-[#0B4EA2] text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50"
                      }`}
                      aria-pressed={activeFilter === filter.key}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {filteredParticipants.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <Search size={34} className="mx-auto text-slate-300" aria-hidden="true" />
              <h3 className="mt-3 text-sm font-extrabold text-[#082B5C]">Peserta tidak ditemukan</h3>
              <p className="mt-1 text-xs text-slate-500">Coba kata kunci atau filter yang berbeda.</p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[900px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-slate-200 bg-[#F8FAFC] text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                      <th className="px-5 py-3.5">Peserta</th>
                      <th className="px-5 py-3.5">Proyek</th>
                      <th className="px-5 py-3.5">Progres</th>
                      <th className="px-5 py-3.5">Score</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-center">Feedback</th>
                      <th className="px-5 py-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredParticipants.map((participant) => (
                      <tr key={participant.id} className="transition hover:bg-blue-50/35">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#EEF4FB] text-xs font-black text-[#0B4EA2]">
                              {participant.name.split(" ").map((name) => name[0]).join("").slice(0, 2)}
                            </div>
                            <div>
                              <div className="text-xs font-extrabold text-[#172033]">{participant.name}</div>
                              <div className="mt-1 max-w-40 truncate text-[10px] text-slate-400">{participant.institution}</div>
                            </div>
                          </div>
                        </td>
                        <td className="max-w-[240px] px-5 py-4">
                          <div className="truncate text-xs font-bold text-slate-700">{participant.project}</div>
                          <div className="mt-1 text-[10px] text-slate-400">Aktif {participant.lastActivity}</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className={`h-full rounded-full ${participant.progress === 100 ? "bg-emerald-500" : "bg-[#0B4EA2]"}`}
                                style={{ width: `${participant.progress}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-black tabular-nums text-[#082B5C]">{participant.progress}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-xs font-black tabular-nums text-[#082B5C]">{participant.score}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-extrabold ${statusStyles[participant.status]}`}>
                            {participant.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={`inline-flex min-w-7 justify-center rounded-full px-2 py-1 text-[10px] font-black ${participant.feedback > 0 ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-400"}`}>
                            {participant.feedback}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedParticipant(participant)}
                            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-[#0B4EA2] px-3 text-[10px] font-extrabold text-white transition hover:bg-[#083F85]"
                          >
                            Lihat Peserta
                            <ArrowRight size={13} aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-100 md:hidden">
                {filteredParticipants.map((participant) => (
                  <article key={participant.id} className="p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#EEF4FB] text-xs font-black text-[#0B4EA2]">
                        {participant.name.split(" ").map((name) => name[0]).join("").slice(0, 2)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="text-sm font-extrabold text-[#172033]">{participant.name}</h3>
                          <span className={`rounded-full border px-2.5 py-1 text-[9px] font-extrabold ${statusStyles[participant.status]}`}>
                            {participant.status}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-[11px] text-slate-500">{participant.project}</p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 text-center">
                      <div>
                        <div className="text-xs font-black text-[#082B5C]">{participant.progress}%</div>
                        <div className="mt-1 text-[9px] text-slate-400">Progres</div>
                      </div>
                      <div className="border-x border-slate-200">
                        <div className="text-xs font-black text-[#082B5C]">{participant.score}</div>
                        <div className="mt-1 text-[9px] text-slate-400">Score</div>
                      </div>
                      <div>
                        <div className="text-xs font-black text-[#082B5C]">{participant.feedback}</div>
                        <div className="mt-1 text-[9px] text-slate-400">Feedback</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedParticipant(participant)}
                      className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-[#0B4EA2] px-4 text-xs font-extrabold text-white"
                    >
                      Lihat Peserta
                      <ArrowRight size={15} aria-hidden="true" />
                    </button>
                  </article>
                ))}
              </div>
            </>
          )}

          <div className="flex flex-col gap-2 border-t border-slate-100 bg-[#FAFBFD] px-5 py-3 text-[10px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>Menampilkan {filteredParticipants.length} peserta pada preview</span>
            <span>Data terakhir diperbarui hari ini, 09.30</span>
          </div>
        </section>

        <p className="text-center text-[10px] leading-5 text-slate-400">
          Preview Sprint 0 · data peserta, progres, score, dan feedback pada halaman ini merupakan data contoh.
        </p>
      </div>

      {selectedParticipant && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-6" role="presentation">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="participant-preview-title"
            className="w-full max-w-lg rounded-t-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#EEF4FB] text-[#0B4EA2]">
                  <UserRound size={21} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#0B4EA2]">Ringkasan Peserta</p>
                  <h2 id="participant-preview-title" className="mt-1 text-lg font-extrabold text-[#082B5C]">{selectedParticipant.name}</h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedParticipant(null)}
                className="grid h-10 w-10 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Tutup ringkasan peserta"
              >
                <X size={19} aria-hidden="true" />
              </button>
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-extrabold text-[#172033]">{selectedParticipant.project}</div>
              <div className="mt-1 text-[10px] text-slate-500">{selectedParticipant.institution}</div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div><div className="text-lg font-black text-[#082B5C]">{selectedParticipant.progress}%</div><div className="text-[9px] text-slate-400">Progres</div></div>
                <div className="border-x border-slate-200"><div className="text-lg font-black text-[#082B5C]">{selectedParticipant.score}</div><div className="text-[9px] text-slate-400">Score</div></div>
                <div><div className="text-lg font-black text-[#082B5C]">{selectedParticipant.feedback}</div><div className="text-[9px] text-slate-400">Feedback</div></div>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
              <MessageSquareText size={18} className="mt-0.5 shrink-0 text-[#0B4EA2]" aria-hidden="true" />
              <div>
                <h3 className="text-xs font-extrabold text-[#082B5C]">Tindakan berikutnya</h3>
                <p className="mt-1 text-xs leading-5 text-slate-600">Buka worksheet peserta untuk membaca jawaban dan memberikan feedback terstruktur.</p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedParticipant(null)}
                className="inline-flex min-h-11 items-center justify-center rounded-[10px] bg-[#0B4EA2] px-5 text-xs font-extrabold text-white"
              >
                Tutup Ringkasan
              </button>
            </div>
          </section>
        </div>
      )}
    </AppShell>
  );
}
