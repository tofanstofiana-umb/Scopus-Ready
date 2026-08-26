import Link from "next/link";
import { CalendarDays, CheckCircle2, Clock3, ListTodo } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ActionTaskCard } from "@/components/action-plan/ActionTaskCard";
import { ActionTaskForm } from "@/components/action-plan/ActionTaskForm";
import { ProjectSwitcher } from "@/components/projects/ProjectSwitcher";
import { calculateActionPlanProgress } from "@/domain/action-plan/progress";
import { getActionTasks } from "@/services/action-plan.service";
import { requirePageIdentity } from "@/services/page-auth.service";
import { getUserProjects } from "@/services/project.service";

export default async function ActionPlanPage({ searchParams }: { searchParams: Promise<{ projectId?: string }> }) {
  const identity = await requirePageIdentity(["participant"]);
  const [{ projectId }, projects] = await Promise.all([searchParams, getUserProjects()]);
  const selected = projects.find((project) => project.id === projectId) ?? projects[0] ?? null;
  const tasks = selected ? await getActionTasks(selected.id) : [];
  const completedCount = tasks.filter((task) => task.status === "completed").length;
  const inProgressCount = tasks.filter((task) => task.status === "in_progress").length;
  const progress = calculateActionPlanProgress(tasks.map((task) => task.status));

  return (
    <AppShell title="Action Plan" subtitle="Ubah feedback dan prioritas menjadi tugas yang dapat dituntaskan" userName={identity.profile.full_name} userInstitution={identity.profile.institution}>
      <div className="mx-auto max-w-6xl space-y-6">
        {projects.length === 0 ? (
          <div className="section-card p-10 text-center"><ListTodo className="mx-auto text-slate-300" size={42} /><h2 className="mt-4 font-extrabold text-[#082B5C]">Belum Ada Proyek</h2><p className="mt-2 text-sm text-slate-500">Buat proyek sebelum menyusun rencana tindakan.</p><Link href="/projects/new" className="btn-primary mt-5">Buat Proyek</Link></div>
        ) : selected && (
          <>
            <ProjectSwitcher projects={projects} selectedProjectId={selected.id} pathname="/action-plan" />
            <section className="grid gap-4 sm:grid-cols-3">
              <div className="section-card flex items-center gap-4 p-5"><div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-700"><CalendarDays size={20} /></div><div><div className="text-2xl font-extrabold text-[#082B5C]">{tasks.length}</div><div className="text-xs text-slate-500">Total tugas</div></div></div>
              <div className="section-card flex items-center gap-4 p-5"><div className="grid h-11 w-11 place-items-center rounded-xl bg-amber-50 text-amber-700"><Clock3 size={20} /></div><div><div className="text-2xl font-extrabold text-[#082B5C]">{inProgressCount}</div><div className="text-xs text-slate-500">Sedang dikerjakan</div></div></div>
              <div className="section-card flex items-center gap-4 p-5"><div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><CheckCircle2 size={20} /></div><div><div className="text-2xl font-extrabold text-[#082B5C]">{progress}%</div><div className="text-xs text-slate-500">{completedCount} tugas selesai</div></div></div>
            </section>
            <div className="grid items-start gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
              <section className="section-card p-5 lg:sticky lg:top-24"><p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#0B4EA2]">{selected.title}</p><h2 className="mb-5 mt-1 text-lg font-extrabold text-[#082B5C]">Tambah Tugas</h2><ActionTaskForm projectId={selected.id} /></section>
              <section className="space-y-4"><div><h2 className="text-lg font-extrabold text-[#082B5C]">Daftar Tindakan</h2><p className="text-xs text-slate-500">Status tugas disimpan dan ikut masuk ke laporan proyek.</p></div>{tasks.length === 0 ? <div className="section-card p-10 text-center text-sm text-slate-500">Belum ada tugas untuk proyek ini.</div> : tasks.map((task) => <ActionTaskCard key={task.id} task={task} />)}</section>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
