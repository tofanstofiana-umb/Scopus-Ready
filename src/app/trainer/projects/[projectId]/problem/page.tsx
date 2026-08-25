import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { FeedbackStatusForm } from "@/components/feedback/FeedbackStatusForm";
import { TrainerFeedbackForm } from "@/components/feedback/TrainerFeedbackForm";
import { getProject } from "@/services/project.service";
import { getProblemWorksheet } from "@/services/worksheet.service";
import { getWorksheetFeedback } from "@/services/feedback.service";

const labels: Record<string, string> = { topic: "Topik", phenomenon: "Fenomena", problem: "Masalah", evidence: "Bukti", importance: "Kepentingan" };

export default async function TrainerProblemPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const [project, answer] = await Promise.all([getProject(projectId), getProblemWorksheet(projectId)]);
  if (!project) notFound();
  const feedback = answer ? await getWorksheetFeedback(answer.id) : [];
  return <AppShell role="trainer" title="Problem Builder Peserta" subtitle={project.title}><div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]"><div className="section-card p-6"><div className="mb-5 flex items-center justify-between"><h2 className="font-extrabold text-[#082B5C]">Jawaban Peserta</h2><div className="flex gap-2"><span className="badge bg-blue-50 text-blue-700">{answer?.completion_percent || 0}% lengkap</span>{answer?.status === "needs_revision" && <span className="badge bg-amber-50 text-amber-700">Perlu Revisi</span>}</div></div>{!answer ? <p className="text-sm text-slate-500">Peserta belum mengisi Problem Builder.</p> : <div className="space-y-5">{Object.entries(answer.content).map(([key, value]) => <div key={key}><div className="text-xs font-bold uppercase tracking-wider text-slate-400">{labels[key] || key}</div><p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{String(value) || "—"}</p></div>)}</div>}</div><div className="space-y-4">{answer && <TrainerFeedbackForm projectId={projectId} worksheetAnswerId={answer.id} />}<div className="section-card p-5"><h2 className="font-extrabold text-[#082B5C]">Riwayat Feedback</h2><div className="mt-4 space-y-3">{feedback.length === 0 && <p className="text-xs text-slate-500">Belum ada feedback untuk worksheet ini.</p>}{feedback.map((item) => <div key={item.id} className="rounded-xl border border-slate-200 p-4"><div className="flex justify-between text-[10px] font-bold uppercase"><span>{item.priority}</span><span>{item.status}</span></div><p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{item.comment}</p>{item.status === "addressed" && <FeedbackStatusForm feedbackId={item.id} projectId={projectId} mode="resolve" />}</div>)}</div></div></div></div></AppShell>;
}
