import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { getProject } from "@/services/project.service";

const stageLabels: Record<string, string> = {
  idea: "Ide penelitian",
  proposal: "Proposal",
  data_available: "Data tersedia",
  draft_manuscript: "Draft manuskrip",
  journal_targeting: "Menentukan jurnal",
  review_revision: "Review dan revisi",
};

export default async function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const project = await getProject(projectId);
  if (!project) notFound();
  return (
    <AppShell title={project.title} subtitle="Proyek manuskrip aktif">
      <div className="space-y-6">
        <Link href="/projects" className="text-sm font-bold text-[#0B4EA2]">← Kembali ke daftar proyek</Link>
        <section className="section-card p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="badge bg-emerald-50 text-emerald-700">Aktif</span>
              <h2 className="mt-4 text-lg font-extrabold text-[#082B5C]">Informasi Proyek</h2>
            </div>
            <span className="text-xs font-semibold text-slate-400">ID {project.id.slice(0, 8)}</span>
          </div>
          <dl className="mt-6 grid gap-5 sm:grid-cols-2">
            <div><dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Bidang penelitian</dt><dd className="mt-1 text-sm font-semibold text-slate-700">{project.field || "Belum diisi"}</dd></div>
            <div><dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Tahap penelitian</dt><dd className="mt-1 text-sm font-semibold text-slate-700">{stageLabels[project.research_stage]}</dd></div>
            <div><dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Pendampingan kelas</dt><dd className="mt-1 text-sm font-semibold text-slate-700">{project.class_id ? "Terhubung ke kelas" : "Proyek pribadi"}</dd></div>
            <div><dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Status</dt><dd className="mt-1 text-sm font-semibold text-slate-700">Aktif</dd></div>
          </dl>
        </section>
        <section className="section-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div><h2 className="font-extrabold text-[#082B5C]">Problem Builder</h2><p className="mt-1 text-sm text-slate-500">Susun masalah penelitian melalui lima pertanyaan terstruktur.</p></div>
            <Link href={`/projects/${projectId}/workbook/problem`} className="btn-primary">Buka Problem Builder</Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
