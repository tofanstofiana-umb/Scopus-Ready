import Link from "next/link";
import { FileText } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ProjectSwitcher } from "@/components/projects/ProjectSwitcher";
import { ProjectReport } from "@/components/reports/ProjectReport";
import { ReportActions } from "@/components/reports/ReportActions";
import { requirePageIdentity } from "@/services/page-auth.service";
import { getUserProjects } from "@/services/project.service";
import { getProjectReport } from "@/services/report.service";

export default async function ManuscriptPage({ searchParams }: { searchParams: Promise<{ projectId?: string }> }) {
  const identity = await requirePageIdentity(["participant"]);
  const [{ projectId }, projects] = await Promise.all([searchParams, getUserProjects()]);
  const selected = projects.find((project) => project.id === projectId) ?? projects[0] ?? null;
  const report = selected ? await getProjectReport(selected.id) : null;

  return (
    <AppShell title="Laporan Manuskrip" subtitle="Snapshot laporan dari satu sumber data proyek" userName={identity.profile.full_name} userInstitution={identity.profile.institution} actions={report ? <ReportActions report={report} /> : undefined}>
      <div className="mx-auto max-w-6xl space-y-6">
        {projects.length === 0 ? (
          <div className="section-card p-10 text-center"><FileText className="mx-auto text-slate-300" size={42} /><h2 className="mt-4 font-extrabold text-[#082B5C]">Belum Ada Laporan</h2><p className="mt-2 text-sm text-slate-500">Buat proyek agar laporan dapat disusun dari data manuskrip.</p><Link href="/projects/new" className="btn-primary mt-5">Buat Proyek</Link></div>
        ) : selected && report ? (
          <><div className="print:hidden"><ProjectSwitcher projects={projects} selectedProjectId={selected.id} pathname="/manuscript" /></div><ProjectReport report={report} /></>
        ) : (
          <div className="section-card p-10 text-center text-sm text-slate-500">Laporan proyek tidak dapat dibaca.</div>
        )}
      </div>
    </AppShell>
  );
}
