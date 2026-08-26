import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, CheckCircle2, Clock3 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { FeedbackStatusForm } from "@/components/feedback/FeedbackStatusForm";
import { TrainerFeedbackForm } from "@/components/feedback/TrainerFeedbackForm";
import { RoadmapCriteria } from "@/components/roadmap/RoadmapCriteria";
import { getActionTasks } from "@/services/action-plan.service";
import { getWorksheetFeedback } from "@/services/feedback.service";
import { requirePageIdentity } from "@/services/page-auth.service";
import { getProject } from "@/services/project.service";
import { getRoadmapWorksheet } from "@/services/worksheet.service";

const statusLabels = { not_started: "Belum dimulai", in_progress: "Sedang dikerjakan", completed: "Selesai" } as const;
const priorityLabels = { low: "Rendah", medium: "Sedang", high: "Tinggi" } as const;

export default async function TrainerPublicationRoadmapPage({ params }: { params: Promise<{ projectId: string }> }) {
  const identity = await requirePageIdentity(["trainer", "admin"]);
  const { projectId } = await params;
  const [project, tasks, answer] = await Promise.all([
    getProject(projectId),
    getActionTasks(projectId),
    getRoadmapWorksheet(projectId),
  ]);
  if (!project) notFound();
  const feedback = answer ? await getWorksheetFeedback(answer.id) : [];

  return (
    <AppShell role={identity.profile.role === "admin" ? "admin" : "trainer"} title="Publication Roadmap Peserta" subtitle={project.title} userName={identity.profile.full_name} userInstitution={identity.profile.institution}>
      <div className="mx-auto max-w-[1180px] space-y-6">
        <RoadmapCriteria content={answer?.content} completionPercent={answer?.completion_percent ?? 0} status={answer?.status ?? "not_started"} />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <section className="space-y-4">
            <div className="flex items-end justify-between gap-4"><div><h2 className="text-lg font-extrabold text-[#082B5C]">Timeline Peserta</h2><p className="text-xs text-slate-500">Roadmap dibaca dari Action Plan peserta.</p></div><Link href={`/trainer/projects/${projectId}/submission`} className="text-xs font-bold text-[#0B4EA2]">Buka Submission Checklist</Link></div>
            {tasks.length === 0 && <div className="section-card p-8 text-sm text-slate-500">Peserta belum menyusun milestone publikasi.</div>}
            {tasks.map((task) => (
              <article key={task.id} className={`section-card p-5 ${task.status === "completed" ? "bg-emerald-50/40" : ""}`}>
                <div className="flex items-start gap-4">
                  <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${task.status === "completed" ? "bg-emerald-100 text-emerald-700" : "bg-blue-50 text-blue-700"}`}>{task.status === "completed" ? <CheckCircle2 size={18} /> : <Clock3 size={18} />}</div>
                  <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-extrabold text-[#082B5C]">{task.title}</h3><span className="badge bg-slate-100 text-slate-600">{statusLabels[task.status]}</span><span className="badge bg-amber-50 text-amber-700">{priorityLabels[task.priority]}</span></div>{task.description && <p className="mt-2 text-sm leading-6 text-slate-600">{task.description}</p>}<p className="mt-3 flex items-center gap-1 text-xs font-semibold text-slate-400"><CalendarDays size={13} /> {task.due_date ?? "Tanpa tanggal target"}</p></div>
                </div>
              </article>
            ))}
          </section>
          <div className="space-y-4">
            {answer && <TrainerFeedbackForm projectId={projectId} worksheetAnswerId={answer.id} />}
            <section className="section-card p-5"><h2 className="font-extrabold text-[#082B5C]">Riwayat Feedback</h2><div className="mt-4 space-y-3">{feedback.length === 0 && <p className="text-xs text-slate-500">Belum ada feedback untuk roadmap.</p>}{feedback.map((item) => <div key={item.id} className="rounded-xl border border-slate-200 p-4"><div className="flex justify-between text-[10px] font-bold uppercase"><span>{item.priority}</span><span>{item.status}</span></div><p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{item.comment}</p>{item.status === "addressed" && <FeedbackStatusForm feedbackId={item.id} projectId={projectId} mode="resolve" />}</div>)}</div></section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
