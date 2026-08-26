import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ActionTaskCard } from "@/components/action-plan/ActionTaskCard";
import { ActionTaskForm } from "@/components/action-plan/ActionTaskForm";
import { ParticipantFeedbackList } from "@/components/feedback/ParticipantFeedbackList";
import { RoadmapCriteria } from "@/components/roadmap/RoadmapCriteria";
import { getActionTasks } from "@/services/action-plan.service";
import { getWorksheetFeedback } from "@/services/feedback.service";
import { requirePageIdentity } from "@/services/page-auth.service";
import { getProject } from "@/services/project.service";
import { getRoadmapWorksheet } from "@/services/worksheet.service";

export default async function PublicationRoadmapPage({ params }: { params: Promise<{ projectId: string }> }) {
  const identity = await requirePageIdentity(["participant", "admin"]);
  const { projectId } = await params;
  const [project, tasks, answer] = await Promise.all([
    getProject(projectId),
    getActionTasks(projectId),
    getRoadmapWorksheet(projectId),
  ]);
  if (!project) notFound();
  const feedback = answer ? await getWorksheetFeedback(answer.id) : [];

  return (
    <AppShell title="Publication Roadmap" subtitle={project.title} userName={identity.profile.full_name} userInstitution={identity.profile.institution}>
      <div className="mx-auto max-w-6xl space-y-6">
        <RoadmapCriteria
          content={answer?.content}
          completionPercent={answer?.completion_percent ?? 0}
          status={answer?.status ?? "not_started"}
        />
        <div className="grid items-start gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <section className="section-card p-5 lg:sticky lg:top-24">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#0B4EA2]">Milestone publikasi</p>
            <h2 className="mb-2 mt-1 text-lg font-extrabold text-[#082B5C]">Tambah Milestone</h2>
            <p className="mb-5 text-xs leading-5 text-slate-500">Milestone ini juga tampil di Action Plan dan laporan proyek.</p>
            <ActionTaskForm projectId={projectId} />
          </section>
          <section className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div><h2 className="text-lg font-extrabold text-[#082B5C]">Timeline Publikasi</h2><p className="text-xs text-slate-500">{tasks.length} milestone tersimpan permanen.</p></div>
              <Link href={`/action-plan?projectId=${projectId}`} className="text-xs font-bold text-[#0B4EA2]">Buka Action Plan lengkap</Link>
            </div>
            {tasks.length === 0
              ? <div className="section-card p-10 text-center text-sm text-slate-500">Belum ada milestone. Tambahkan minimal tiga tugas bertanggal untuk membentuk roadmap.</div>
              : tasks.map((task) => <ActionTaskCard key={task.id} task={task} />)}
          </section>
        </div>
        <ParticipantFeedbackList feedback={feedback} projectId={projectId} />
      </div>
    </AppShell>
  );
}
