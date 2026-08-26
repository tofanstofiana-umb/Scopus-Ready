import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { requirePageIdentity } from "@/services/page-auth.service";
import { getProject } from "@/services/project.service";

const stageLabels: Record<string, string> = {
  idea: "Ide penelitian",
  proposal: "Proposal",
  data_available: "Data tersedia",
  draft_manuscript: "Draft manuskrip",
  journal_targeting: "Menentukan jurnal",
  review_revision: "Review dan revisi",
};

const activeWorksheets = [
  { code: "problem", title: "Problem Builder", description: "Susun masalah penelitian melalui lima pertanyaan terstruktur." },
  { code: "literature", title: "Literature Map", description: "Petakan temuan, teori, metode, konteks, dan keterbatasan studi terdahulu." },
  { code: "gap", title: "Gap Detector", description: "Rumuskan research gap yang spesifik dan didukung peta literatur." },
  { code: "novelty", title: "Novelty Builder", description: "Bangun klaim kebaruan dan kontribusi yang didukung bukti literatur." },
  { code: "blueprint", title: "Article Blueprint", description: "Susun struktur, argumen, dan rencana bukti untuk manuskrip Anda." },
  { code: "method", title: "Method Fit", description: "Selaraskan desain, sampel, data, instrumen, dan teknik analisis." },
  { code: "scientific_story", title: "Scientific Story", description: "Bangun alur ilmiah dari masalah hingga pesan utama manuskrip." },
  { code: "journal_target", title: "Journal Target", description: "Bandingkan jurnal dan pilih target utama serta jurnal cadangan." },
  { code: "internal_review", title: "Internal Review", description: "Audit manuskrip dan ajukan persetujuan Reviewer Gate kepada trainer." },
  { code: "journal_adaptation", title: "Journal Adaptation", description: "Sesuaikan struktur dan paket manuskrip dengan author guidelines jurnal utama." },
  { code: "submission", title: "Submission Checklist", description: "Konfirmasikan seluruh berkas, metadata, etik, dan persyaratan sebelum submit." },
];

export default async function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  await requirePageIdentity(["participant", "admin"]);
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
        <section>
          <div className="mb-3"><h2 className="font-extrabold text-[#082B5C]">Worksheet Aktif</h2><p className="mt-1 text-sm text-slate-500">Kerjakan modul secara berurutan. Setiap jawaban tersimpan otomatis.</p></div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {activeWorksheets.map((worksheet, index) => (
              <article key={worksheet.code} className="section-card flex flex-col p-6">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Modul {index + 1}</span>
                <h3 className="mt-2 font-extrabold text-[#082B5C]">{worksheet.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">{worksheet.description}</p>
                <Link href={worksheet.code === "journal_target" ? `/journals?projectId=${projectId}` : `/projects/${projectId}/workbook/${worksheet.code}`} className="btn-primary mt-5 justify-center">Buka {worksheet.title}</Link>
              </article>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
