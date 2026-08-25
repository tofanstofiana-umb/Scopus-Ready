import Link from "next/link";
import { Info, ShieldCheck, Target } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import type { Profile } from "@/types/auth";
import type { Project } from "@/types/project";
import type { ProjectMetrics } from "@/services/progress.service";

export function ProjectScore({
  profile,
  projects,
  selected,
}: {
  profile: Profile;
  projects: Project[];
  selected: { project: Project; metrics: ProjectMetrics } | null;
}) {
  const score = selected?.metrics.score;
  return (
    <AppShell
      role={profile.role === "participant" ? "peserta" : profile.role}
      title="SCOPUS READY Score"
      subtitle="Nilai kesiapan dihitung hanya dari assessment rubrik yang tersimpan."
      userName={profile.full_name}
      userInstitution={profile.institution}
      progress={selected?.metrics.progress ?? 0}
    >
      <div className="mx-auto max-w-[1100px] space-y-6">
        {projects.length > 0 && (
          <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Pilih proyek score">
            {projects.map((project) => <Link key={project.id} href={`/score?projectId=${project.id}`} className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-bold ${selected?.project.id === project.id ? "border-[#0B4EA2] bg-[#0B4EA2] text-white" : "border-slate-200 bg-white text-slate-600"}`}>{project.title}</Link>)}
          </nav>
        )}

        {!selected || !score ? (
          <section className="section-card p-10 text-center"><Target size={42} className="mx-auto text-slate-300" /><h2 className="mt-4 text-lg font-extrabold text-[#082B5C]">Belum ada proyek untuk dinilai</h2><Link href="/projects/new" className="btn-primary mt-5">Buat Proyek</Link></section>
        ) : (
          <>
            <section className="wireframe-hero p-6 sm:p-8">
              <div className="relative z-10 grid gap-6 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center">
                <div className="grid h-40 w-40 place-items-center rounded-full border-[10px] border-white/15 bg-[#082B5C] text-center">
                  <div><div className="text-4xl font-black text-white">{score.score ?? "—"}</div><div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-white/55">dari 100</div></div>
                </div>
                <div><span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase text-[#F4BF4F]">{selected.project.title}</span><h2 className="mt-4 text-2xl font-extrabold text-white">{score.complete ? "Assessment rubrik lengkap" : "Score belum dapat diterbitkan"}</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">{score.complete ? "Nilai ini dihitung dari sepuluh dimensi rubrik yang tersimpan di database." : `Baru ${score.assessedDimensions} dari ${score.totalDimensions} dimensi yang memiliki assessment valid. Aplikasi tidak menebak atau mengisi angka yang belum dinilai.`}</p></div>
              </div>
            </section>

            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs leading-5 text-blue-900"><div className="flex gap-3"><Info size={16} className="mt-0.5 shrink-0 text-[#0B4EA2]" /><p>Progres {selected.metrics.progress}% mengukur penyelesaian modul. Score mengukur kualitas berdasarkan rubrik; keduanya sengaja dihitung terpisah.</p></div></div>

            <section className="section-card">
              <div className="section-card-header"><div><h2 className="font-extrabold text-[#082B5C]">Breakdown Assessment</h2><p className="mt-1 text-xs text-slate-500">Maksimum seluruh dimensi berjumlah 100.</p></div><span className="badge bg-blue-50 text-blue-700">{score.assessedDimensions}/{score.totalDimensions} dinilai</span></div>
              <div className="divide-y divide-slate-100 px-5">
                {score.breakdown.map((item) => (
                  <div key={item.dimension} className="grid grid-cols-[minmax(120px,1fr)_minmax(100px,1fr)_90px] items-center gap-3 py-4"><span className="text-sm font-bold text-slate-700">{item.label}</span><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#0B4EA2]" style={{ width: item.score === null ? "0%" : `${(item.score / item.maxScore) * 100}%` }} /></div><span className="text-right text-xs font-black text-[#082B5C]">{item.score === null ? "Belum dinilai" : `${item.score}/${item.maxScore}`}</span></div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex items-start gap-3"><ShieldCheck size={20} className="text-[#0B4EA2]" /><div><h2 className="font-extrabold text-[#082B5C]">Single source of truth</h2><p className="mt-1 text-xs leading-5 text-slate-500">Dashboard, halaman ini, dan tampilan trainer menggunakan fungsi `getProjectMetrics()` yang sama. Score tidak disimpan sebagai angka yang dapat diedit manual.</p></div></div></section>
          </>
        )}
      </div>
    </AppShell>
  );
}
