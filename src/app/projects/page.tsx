import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { getUserProjects } from "@/services/project.service";
import { FilePlus2, FileText } from "lucide-react";

const stageLabels: Record<string, string> = {
  idea: "Ide",
  proposal: "Proposal",
  data_available: "Data tersedia",
  draft_manuscript: "Draft manuskrip",
  journal_targeting: "Menentukan jurnal",
  review_revision: "Review dan revisi",
};

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeZone: "Asia/Jakarta",
});

export default async function ProjectsPage() {
  const projects = await getUserProjects();

  return (
    <AppShell title="Proyek Manuskrip" subtitle="Kelola manuskrip dan worksheet Anda">
      <div className="space-y-6">
        <div className="flex justify-end"><Link href="/projects/new" className="btn-primary"><FilePlus2 size={16} /> Buat Proyek</Link></div>
        {projects.length === 0 ? (
          <div className="section-card p-10 text-center">
            <FileText className="mx-auto text-slate-300" size={42} />
            <h2 className="mt-4 font-extrabold text-[#082B5C]">Belum Ada Proyek</h2>
            <p className="mt-1 text-sm text-slate-500">Buat proyek pertama untuk menyiapkan ruang kerja manuskrip.</p>
            <Link href="/projects/new" className="btn-primary mt-5">Buat Proyek Pertama</Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`} className="section-card card-hover p-5">
                <div className="text-xs font-bold uppercase tracking-wider text-blue-600">Proyek aktif</div>
                <h2 className="mt-2 font-extrabold leading-snug text-[#082B5C]">{project.title}</h2>
                <p className="mt-1 text-xs text-slate-500">{project.field || "Bidang belum diisi"}</p>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
                  <span>{stageLabels[project.research_stage]}</span>
                  <span>Diperbarui {dateFormatter.format(new Date(project.updated_at))}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
