import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ParticipantFeedbackList } from "@/components/feedback/ParticipantFeedbackList";
import { ProblemBuilderForm } from "@/components/workbook/ProblemBuilderForm";
import { getWorksheetFeedback } from "@/services/feedback.service";
import { getProject } from "@/services/project.service";
import { getProblemWorksheet } from "@/services/worksheet.service";
import type { ProblemBuilderContent } from "@/types/worksheet";

const emptyContent: ProblemBuilderContent = { topic: "", phenomenon: "", problem: "", evidence: "", importance: "" };

export default async function ProblemBuilderPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const [project, answer] = await Promise.all([getProject(projectId), getProblemWorksheet(projectId)]);
  if (!project) notFound();
  const feedback = answer ? await getWorksheetFeedback(answer.id) : [];
  return (
    <AppShell title="Problem Builder" subtitle={project.title}>
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          {answer?.status === "needs_revision" && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">Status Problem Builder: Perlu Revisi</div>}
          <ProblemBuilderForm projectId={projectId} initialContent={answer?.content || emptyContent} initialUpdatedAt={answer?.updated_at || null} />
          <ParticipantFeedbackList feedback={feedback} projectId={projectId} />
        </div>
        <aside className="space-y-4">
          <div className="section-card p-5">
            <h2 className="font-extrabold text-[#082B5C]">Cara mengisi</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-4 text-xs leading-relaxed text-slate-600">
              <li>Isi kelima pertanyaan secara bertahap.</li>
              <li>Berhenti mengetik sejenak agar autosave berjalan.</li>
              <li>Pastikan status berubah menjadi tersimpan otomatis di database.</li>
            </ol>
          </div>
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs leading-relaxed text-slate-600">Gunakan <strong>Simpan Sekarang</strong> bila Anda perlu menyimpan tanpa menunggu. Feedback trainer akan diaktifkan pada sprint berikutnya.</div>
          <Link href={`/projects/${projectId}`} className="btn-outline w-full justify-center">Kembali ke Proyek</Link>
        </aside>
      </div>
    </AppShell>
  );
}
