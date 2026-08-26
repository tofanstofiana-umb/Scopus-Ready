import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { FeedbackStatusForm } from "@/components/feedback/FeedbackStatusForm";
import { TrainerFeedbackForm } from "@/components/feedback/TrainerFeedbackForm";
import { InternalReviewApprovalForm } from "@/components/review/InternalReviewApprovalForm";
import { isStructuredWorksheetCode, structuredWorksheets } from "@/domain/worksheets/structured-worksheets";
import { getWorksheetFeedback } from "@/services/feedback.service";
import { requirePageIdentity } from "@/services/page-auth.service";
import { getProject } from "@/services/project.service";
import { getProjectMetrics } from "@/services/progress.service";
import { getStructuredWorksheet } from "@/services/worksheet.service";

export default async function TrainerStructuredWorksheetPage({
  params,
}: {
  params: Promise<{ projectId: string; moduleCode: string }>;
}) {
  const identity = await requirePageIdentity(["trainer", "admin"]);
  const { projectId, moduleCode } = await params;
  if (!isStructuredWorksheetCode(moduleCode)) notFound();

  const [project, answer, metrics] = await Promise.all([
    getProject(projectId),
    getStructuredWorksheet(projectId, moduleCode),
    getProjectMetrics(projectId),
  ]);
  if (!project) notFound();
  const definition = structuredWorksheets[moduleCode];
  const feedback = answer ? await getWorksheetFeedback(answer.id) : [];

  return (
    <AppShell
      role={identity.profile.role === "admin" ? "admin" : "trainer"}
      title={`${definition.title} Peserta`}
      subtitle={project.title}
      userName={identity.profile.full_name}
      userInstitution={identity.profile.institution}
    >
      <div className="mx-auto max-w-[1180px] space-y-6">
        <section className="section-card flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="flex flex-wrap gap-2">
            <span className="badge bg-blue-50 text-blue-700">Progres {metrics?.progress ?? 0}%</span>
            <span className="badge bg-violet-50 text-violet-700">{answer?.completion_percent ?? 0}% terisi</span>
            {answer?.status === "needs_revision" && <span className="badge bg-amber-50 text-amber-700">Perlu Revisi</span>}
            {answer?.status === "completed" && <span className="badge bg-emerald-50 text-emerald-700">Selesai · Gate PASS</span>}
          </div>
          <Link href={`/trainer/projects/${projectId}/problem`} className="text-xs font-bold text-[#0B4EA2]">Buka Problem Builder</Link>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <section className="section-card p-6">
            <h2 className="mb-5 font-extrabold text-[#082B5C]">Jawaban Peserta</h2>
            {!answer ? (
              <p className="text-sm text-slate-500">Peserta belum mengisi {definition.title}. Feedback belum dapat dibuat.</p>
            ) : (
              <div className="space-y-5">
                {definition.fields.map((field) => (
                  <div key={field.key}>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">{field.label}</div>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{answer.content[field.key] || "—"}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="space-y-4">
            {moduleCode === "internal_review" && answer?.completion_percent === 100 && answer.status !== "completed" && <InternalReviewApprovalForm projectId={projectId} />}
            {answer && <TrainerFeedbackForm projectId={projectId} worksheetAnswerId={answer.id} />}
            <section className="section-card p-5">
              <h2 className="font-extrabold text-[#082B5C]">Riwayat Feedback</h2>
              <div className="mt-4 space-y-3">
                {feedback.length === 0 && <p className="text-xs text-slate-500">Belum ada feedback untuk worksheet ini.</p>}
                {feedback.map((item) => <div key={item.id} className="rounded-xl border border-slate-200 p-4"><div className="flex justify-between text-[10px] font-bold uppercase"><span>{item.priority}</span><span>{item.status}</span></div><p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{item.comment}</p>{item.status === "addressed" && <FeedbackStatusForm feedbackId={item.id} projectId={projectId} mode="resolve" />}</div>)}
              </div>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
