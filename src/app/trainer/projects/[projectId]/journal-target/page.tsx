import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { FeedbackStatusForm } from "@/components/feedback/FeedbackStatusForm";
import { TrainerFeedbackForm } from "@/components/feedback/TrainerFeedbackForm";
import { calculateJournalFit, determineJournalFitLabel } from "@/domain/journals/journal-fit";
import { getWorksheetFeedback } from "@/services/feedback.service";
import { getJournalTargets } from "@/services/journal.service";
import { requirePageIdentity } from "@/services/page-auth.service";
import { getProject } from "@/services/project.service";
import { getProjectMetrics } from "@/services/progress.service";
import { getJournalTargetWorksheet } from "@/services/worksheet.service";

const statusLabels = { candidate: "Kandidat", primary: "Target utama", backup: "Cadangan", rejected: "Tidak dipilih" } as const;

export default async function TrainerJournalTargetPage({ params }: { params: Promise<{ projectId: string }> }) {
  const identity = await requirePageIdentity(["trainer", "admin"]);
  const { projectId } = await params;
  const [project, targets, answer, metrics] = await Promise.all([
    getProject(projectId),
    getJournalTargets(projectId),
    getJournalTargetWorksheet(projectId),
    getProjectMetrics(projectId),
  ]);
  if (!project) notFound();
  const feedback = answer ? await getWorksheetFeedback(answer.id) : [];

  return (
    <AppShell role={identity.profile.role === "admin" ? "admin" : "trainer"} title="Journal Target Peserta" subtitle={project.title} userName={identity.profile.full_name} userInstitution={identity.profile.institution}>
      <div className="mx-auto max-w-[1180px] space-y-6">
        <section className="section-card flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="flex flex-wrap gap-2"><span className="badge bg-blue-50 text-blue-700">Progres proyek {metrics?.progress ?? 0}%</span><span className="badge bg-violet-50 text-violet-700">Matrix {answer?.completion_percent ?? 0}%</span>{answer?.status === "completed" && <span className="badge bg-emerald-50 text-emerald-700">Selesai</span>}</div>
          <Link href={`/trainer/projects/${projectId}/internal_review`} className="text-xs font-bold text-[#0B4EA2]">Buka Internal Review</Link>
        </section>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <section className="space-y-4">
            {targets.length === 0 && <div className="section-card p-8 text-sm text-slate-500">Peserta belum menambahkan target jurnal.</div>}
            {targets.map((target) => {
              const fit = calculateJournalFit({ scopeMatch: target.scope_match, articleTypeMatch: target.article_type_match, audienceMatch: target.audience_match, requirementsMatch: target.requirements_match });
              return <article key={target.id} className="section-card p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-extrabold text-[#082B5C]">{target.journal_name}</h2><p className="mt-1 text-xs text-slate-500">{target.publisher || "Penerbit belum diisi"} · {target.quartile.toUpperCase()}</p></div><div className="text-right"><div className="text-xl font-black text-[#082B5C]">{fit}%</div><div className="text-[10px] font-bold text-slate-400">{determineJournalFitLabel(fit)}</div></div></div><span className="badge mt-4 bg-blue-50 text-blue-700">{statusLabels[target.status]}</span>{target.notes && <p className="mt-3 text-sm text-slate-600">{target.notes}</p>}</article>;
            })}
          </section>
          <div className="space-y-4">
            {answer && <TrainerFeedbackForm projectId={projectId} worksheetAnswerId={answer.id} />}
            <section className="section-card p-5"><h2 className="font-extrabold text-[#082B5C]">Riwayat Feedback</h2><div className="mt-4 space-y-3">{feedback.length === 0 && <p className="text-xs text-slate-500">Belum ada feedback untuk matrix jurnal.</p>}{feedback.map((item) => <div key={item.id} className="rounded-xl border border-slate-200 p-4"><div className="flex justify-between text-[10px] font-bold uppercase"><span>{item.priority}</span><span>{item.status}</span></div><p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{item.comment}</p>{item.status === "addressed" && <FeedbackStatusForm feedbackId={item.id} projectId={projectId} mode="resolve" />}</div>)}</div></section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
