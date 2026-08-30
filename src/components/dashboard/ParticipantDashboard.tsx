import Link from "next/link";
import { ArrowRight, BookOpenCheck, FolderPlus, Target, CreditCard, KeyRound } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import type { Project } from "@/types/project";
import type { Profile } from "@/types/auth";
import type { ProjectMetrics } from "@/services/progress.service";
import type { ClassEnrollmentPayment } from "@/types/payment";

const statusLabels = {
  not_started: "Belum dimulai",
  in_progress: "Sedang dikerjakan",
  needs_revision: "Perlu revisi",
  completed: "Selesai",
};

export function ParticipantDashboard({
  profile,
  projects,
  unpaidEnrollments = [],
  hasNoClass = false,
}: {
  profile: Profile;
  projects: Array<{ project: Project; metrics: ProjectMetrics }>;
  unpaidEnrollments?: ClassEnrollmentPayment[];
  hasNoClass?: boolean;
}) {
  const active = projects[0];

  return (
    <AppShell
      title={`Selamat datang, ${profile.full_name}`}
      subtitle="Lanjutkan pengembangan manuskrip Anda."
      userName={profile.full_name}
      userInstitution={profile.institution}
      progress={active?.metrics.progress ?? 0}
    >
      <div className="mx-auto max-w-[1200px] space-y-6">
        {hasNoClass && (
          <section className="flex flex-col gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <KeyRound size={20} className="mt-0.5 shrink-0 text-blue-600" aria-hidden="true" />
              <div>
                <div className="font-extrabold text-blue-900">Anda belum tergabung di kelas manapun</div>
                <p className="mt-1 text-sm text-blue-800">Hubungi admin untuk verifikasi pembayaran dan dapatkan kode kelas, lalu masukkan di sini.</p>
              </div>
            </div>
            <Link href="/join-class" className="btn-primary shrink-0 whitespace-nowrap">Masukkan Kode Kelas</Link>
          </section>
        )}
        {unpaidEnrollments.length > 0 && (
          <section className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <CreditCard size={20} className="mt-0.5 shrink-0 text-amber-600" aria-hidden="true" />
              <div>
                <div className="font-extrabold text-amber-900">Pembayaran kelas belum selesai</div>
                <p className="mt-1 text-sm text-amber-800">
                  {unpaidEnrollments.map((enrollment) => enrollment.className).join(", ")} — Anda bisa melihat progres lama, tapi belum bisa menyimpan worksheet baru sampai lunas.
                </p>
              </div>
            </div>
            <Link href={`/classes/${unpaidEnrollments[0].classId}/pembayaran`} className="btn-primary shrink-0 whitespace-nowrap">Bayar Sekarang</Link>
          </section>
        )}
        {!active ? (
          <section className="section-card p-8 text-center sm:p-12">
            <FolderPlus size={42} className="mx-auto text-[#0B4EA2]" aria-hidden="true" />
            <h2 className="mt-4 text-xl font-extrabold text-[#082B5C]">Buat proyek manuskrip pertama</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">Progres dan score akan dihitung dari worksheet serta assessment proyek, bukan dari angka dashboard manual.</p>
            <Link href="/projects/new" className="btn-primary mt-6">Buat Proyek</Link>
          </section>
        ) : (
          <>
            <section className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
              <div className="wireframe-hero p-5 sm:p-7">
                <div className="relative z-10 grid gap-6 sm:grid-cols-[minmax(0,1fr)_180px] sm:items-center">
                  <div>
                    <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#F4BF4F]">Proyek Aktif</span>
                    <h2 className="mt-4 text-xl font-extrabold text-white sm:text-2xl">{active.project.title}</h2>
                    <p className="mt-2 text-sm text-white/65">{active.project.field || "Bidang penelitian belum diisi"}</p>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <Link href={`/projects/${active.project.id}/workbook/problem`} className="inline-flex min-h-11 items-center gap-2 rounded-[10px] bg-[#D9A441] px-4 text-xs font-extrabold text-[#082B5C]">Lanjutkan Problem Builder <ArrowRight size={15} /></Link>
                      <Link href={`/projects/${active.project.id}`} className="inline-flex min-h-11 items-center rounded-[10px] border border-white/25 px-4 text-xs font-bold text-white">Lihat Proyek</Link>
                    </div>
                  </div>
                  <div className="flex flex-col items-center rounded-2xl border border-white/12 bg-white/[0.07] p-5 text-center">
                    <div className="grid h-28 w-28 place-items-center rounded-full p-2" style={{ background: `conic-gradient(#F4BF4F 0 ${active.metrics.progress}%, rgba(255,255,255,.14) ${active.metrics.progress}% 100%)` }} aria-label={`Progres manuskrip ${active.metrics.progress} persen`}>
                      <div className="grid h-full w-full place-items-center rounded-full bg-[#082B5C]"><div><div className="text-2xl font-black text-white">{active.metrics.progress}%</div><div className="text-[9px] font-bold uppercase text-white/55">Progres</div></div></div>
                    </div>
                    <p className="mt-3 text-[11px] text-white/65">Dihitung dari status 12 modul</p>
                  </div>
                </div>
              </div>

              <div className="section-card flex flex-col p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-extrabold uppercase tracking-wider text-[#0B4EA2]">Penilaian Kesiapan</p><h2 className="mt-2 text-lg font-extrabold text-[#082B5C]">SCOPUS READY Score</h2></div><Target size={22} className="text-[#D9A441]" /></div>
                <div className="my-5 text-4xl font-black text-[#082B5C]">{active.metrics.score.score === null ? "—" : active.metrics.score.score}</div>
                <span className="badge mb-3 bg-amber-50 text-amber-700">{active.metrics.readiness.label}</span>
                <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs leading-5 text-blue-800">
                  {active.metrics.score.complete
                    ? "Rubrik lengkap. Score dihitung dari assessment trainer."
                    : `Belum dinilai lengkap (${active.metrics.score.assessedDimensions}/${active.metrics.score.totalDimensions} dimensi).`}
                </div>
                <Link href={`/score?projectId=${active.project.id}`} className="btn-outline mt-auto justify-between">Lihat detail penilaian <ArrowRight size={15} /></Link>
              </div>
            </section>

            <section className="section-card">
              <div className="section-card-header"><div><h2 className="font-extrabold text-[#082B5C]">Status Modul</h2><p className="mt-1 text-xs text-slate-500">Satu sumber status untuk dashboard, trainer, dan laporan.</p></div><BookOpenCheck size={20} className="text-[#0B4EA2]" /></div>
              <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
                {active.metrics.modules.map((module) => (
                  <div key={module.id} className="rounded-xl border border-slate-200 p-4"><div className="text-[10px] font-bold uppercase text-slate-400">Modul {module.sequence}</div><div className="mt-1 text-sm font-extrabold text-[#082B5C]">{module.name}</div><span className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${module.status === "completed" ? "bg-emerald-50 text-emerald-700" : module.status === "needs_revision" ? "bg-amber-50 text-amber-700" : module.status === "in_progress" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-500"}`}>{statusLabels[module.status]}</span></div>
                ))}
              </div>
            </section>
          </>
        )}

        {projects.length > 0 && (
          <section className="section-card">
            <div className="section-card-header"><h2 className="font-extrabold text-[#082B5C]">Semua Proyek</h2><Link href="/projects/new" className="text-xs font-bold text-[#0B4EA2]">Buat proyek baru</Link></div>
            <div className="divide-y divide-slate-100">
              {projects.map(({ project, metrics }) => (
                <div key={project.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"><div><div className="font-extrabold text-[#082B5C]">{project.title}</div><div className="mt-1 text-xs text-slate-500">Progres {metrics.progress}% · Score {metrics.score.score ?? "Belum dinilai"}</div></div><Link href={`/projects/${project.id}`} className="btn-outline">Buka Proyek</Link></div>
              ))}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
