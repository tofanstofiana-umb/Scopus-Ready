import Link from "next/link";
import { Target } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { JournalTargetCard } from "@/components/journals/JournalTargetCard";
import { JournalTargetForm } from "@/components/journals/JournalTargetForm";
import { ProjectSwitcher } from "@/components/projects/ProjectSwitcher";
import { getJournalTargets } from "@/services/journal.service";
import { requirePageIdentity } from "@/services/page-auth.service";
import { getUserProjects } from "@/services/project.service";

export default async function JournalsPage({ searchParams }: { searchParams: Promise<{ projectId?: string }> }) {
  const identity = await requirePageIdentity(["participant"]);
  const [{ projectId }, projects] = await Promise.all([searchParams, getUserProjects()]);
  const selected = projects.find((project) => project.id === projectId) ?? projects[0] ?? null;
  const targets = selected ? await getJournalTargets(selected.id) : [];

  return (
    <AppShell title="Journal Target Matrix" subtitle="Bandingkan kecocokan jurnal dari data penilaian yang konsisten" userName={identity.profile.full_name} userInstitution={identity.profile.institution}>
      <div className="mx-auto max-w-6xl space-y-6">
        {projects.length === 0 ? (
          <div className="section-card p-10 text-center"><Target className="mx-auto text-slate-300" size={42} /><h2 className="mt-4 font-extrabold text-[#082B5C]">Belum Ada Proyek</h2><p className="mt-2 text-sm text-slate-500">Buat proyek sebelum menyusun target jurnal.</p><Link href="/projects/new" className="btn-primary mt-5">Buat Proyek</Link></div>
        ) : selected && (
          <>
            <ProjectSwitcher projects={projects} selectedProjectId={selected.id} pathname="/journals" />
            <div className="grid items-start gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
              <section className="section-card p-5 lg:sticky lg:top-24"><div className="mb-5"><p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#0B4EA2]">{selected.title}</p><h2 className="mt-1 text-lg font-extrabold text-[#082B5C]">Tambah Target Jurnal</h2><p className="mt-1 text-xs leading-5 text-slate-500">Nilai empat dimensi 0–5. Fit dihitung otomatis, bukan diketik manual.</p></div><JournalTargetForm projectId={selected.id} /></section>
              <section className="space-y-4"><div className="flex items-end justify-between gap-4"><div><h2 className="text-lg font-extrabold text-[#082B5C]">Jurnal Kandidat</h2><p className="text-xs text-slate-500">{targets.length} jurnal tersimpan permanen</p></div></div>{targets.length === 0 ? <div className="section-card p-10 text-center text-sm text-slate-500">Belum ada target jurnal untuk proyek ini.</div> : targets.map((target) => <JournalTargetCard key={target.id} target={target} />)}</section>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
