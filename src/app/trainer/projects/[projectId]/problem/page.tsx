import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { TrainerAssessmentForm } from "@/components/assessment/TrainerAssessmentForm";
import { FeedbackStatusForm } from "@/components/feedback/FeedbackStatusForm";
import { TrainerFeedbackForm } from "@/components/feedback/TrainerFeedbackForm";
import { getProjectAssessments } from "@/services/assessment.service";
import { getWorksheetFeedback } from "@/services/feedback.service";
import { requirePageIdentity } from "@/services/page-auth.service";
import { getProject } from "@/services/project.service";
import { getProjectMetrics } from "@/services/progress.service";
import { getProblemWorksheet } from "@/services/worksheet.service";

const labels: Record<string, string> = {
  topic: "Topik",
  phenomenon: "Fenomena",
  problem: "Masalah",
  evidence: "Bukti",
  importance: "Kepentingan",
};

const gateClasses = {
  pass: "bg-emerald-50 text-emerald-700",
  fail: "bg-red-50 text-red-700",
  pending: "bg-slate-100 text-slate-500",
};

export default async function TrainerProblemPage({ params }: { params: Promise<{ projectId: string }> }) {
  const identity = await requirePageIdentity(["trainer", "admin"]);
  const { projectId } = await params;
  const [project, answer, metrics, assessments] = await Promise.all([
    getProject(projectId),
    getProblemWorksheet(projectId),
    getProjectMetrics(projectId),
    getProjectAssessments(projectId),
  ]);
  if (!project) notFound();
  const feedback = answer ? await getWorksheetFeedback(answer.id) : [];

  return (
    <AppShell
      role={identity.profile.role === "admin" ? "admin" : "trainer"}
      title="Problem Builder Peserta"
      subtitle={project.title}
      userName={identity.profile.full_name}
      userInstitution={identity.profile.institution}
    >
      <div className="mx-auto max-w-[1280px] space-y-6">
        <section className="section-card p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge bg-blue-50 text-blue-700">Progres {metrics?.progress ?? 0}%</span>
            <span className="badge bg-violet-50 text-violet-700">Score {metrics?.score.score ?? "Belum dinilai"}</span>
            <span className="badge bg-amber-50 text-amber-700">{metrics?.readiness.label ?? "Belum lengkap"}</span>
          </div>
          {metrics && <div className="mt-4 flex flex-wrap gap-2">{metrics.gates.map((gate) => <span key={gate.id} className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${gateClasses[gate.status]}`}>{gate.label}: {gate.status.toUpperCase()}</span>)}</div>}
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <section className="section-card p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="font-extrabold text-[#082B5C]">Jawaban Peserta</h2>
              <div className="flex gap-2"><span className="badge bg-blue-50 text-blue-700">{answer?.completion_percent || 0}% terisi</span>{answer?.status === "needs_revision" && <span className="badge bg-amber-50 text-amber-700">Perlu Revisi</span>}{answer?.status === "completed" && <span className="badge bg-emerald-50 text-emerald-700">Selesai</span>}</div>
            </div>
            {!answer ? <p className="text-sm text-slate-500">Peserta belum mengisi Problem Builder. Penilaian belum dapat dibuat.</p> : <div className="space-y-5">{Object.entries(answer.content).map(([key, value]) => <div key={key}><div className="text-xs font-bold uppercase tracking-wider text-slate-400">{labels[key] || key}</div><p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{String(value) || "—"}</p></div>)}</div>}
          </section>

          <div className="space-y-4">
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

        {answer && <TrainerAssessmentForm projectId={projectId} worksheetAnswerId={answer.id} assessments={assessments} />}
      </div>
    </AppShell>
  );
}
