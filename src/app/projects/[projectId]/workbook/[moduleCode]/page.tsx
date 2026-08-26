import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ParticipantFeedbackList } from "@/components/feedback/ParticipantFeedbackList";
import { StructuredWorksheetForm } from "@/components/workbook/StructuredWorksheetForm";
import {
  createEmptyStructuredContent,
  isStructuredWorksheetCode,
  structuredWorksheets,
} from "@/domain/worksheets/structured-worksheets";
import { getWorksheetFeedback } from "@/services/feedback.service";
import { requirePageIdentity } from "@/services/page-auth.service";
import { getProject } from "@/services/project.service";
import { getStructuredWorksheet } from "@/services/worksheet.service";

export default async function StructuredWorksheetPage({
  params,
}: {
  params: Promise<{ projectId: string; moduleCode: string }>;
}) {
  await requirePageIdentity(["participant", "admin"]);
  const { projectId, moduleCode } = await params;
  if (!isStructuredWorksheetCode(moduleCode)) notFound();

  const [project, answer] = await Promise.all([
    getProject(projectId),
    getStructuredWorksheet(projectId, moduleCode),
  ]);
  if (!project) notFound();
  const definition = structuredWorksheets[moduleCode];
  const feedback = answer ? await getWorksheetFeedback(answer.id) : [];

  return (
    <AppShell title={definition.title} subtitle={project.title}>
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          {answer?.status === "needs_revision" && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">Status {definition.title}: Perlu Revisi</div>}
          {answer?.status === "completed" && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800">Status {definition.title}: Selesai · Reviewer Gate PASS</div>}
          <StructuredWorksheetForm
            projectId={projectId}
            moduleCode={moduleCode}
            initialContent={answer?.content ?? createEmptyStructuredContent(moduleCode)}
            initialUpdatedAt={answer?.updated_at ?? null}
          />
          <ParticipantFeedbackList feedback={feedback} projectId={projectId} />
        </div>
        <aside className="space-y-4">
          <div className="section-card p-5">
            <h2 className="font-extrabold text-[#082B5C]">Cara mengisi</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-4 text-xs leading-relaxed text-slate-600">
              <li>Isi kelima pertanyaan secara bertahap.</li>
              <li>Gunakan bukti dari literatur yang dapat diverifikasi.</li>
              <li>Berhenti mengetik sejenak sampai status tersimpan muncul.</li>
            </ol>
          </div>
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs leading-relaxed text-slate-600">{definition.description} Feedback trainer akan tampil di bawah worksheet.</div>
          <Link href={`/projects/${projectId}`} className="btn-outline w-full justify-center">Kembali ke Proyek</Link>
        </aside>
      </div>
    </AppShell>
  );
}
