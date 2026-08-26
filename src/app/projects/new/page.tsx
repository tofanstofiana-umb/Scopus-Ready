import { AppShell } from "@/components/AppShell";
import { CreateProjectForm } from "@/components/projects/CreateProjectForm";
import { requirePageIdentity } from "@/services/page-auth.service";
import { getParticipantProjectClasses } from "@/services/project.service";

export default async function NewProjectPage() {
  await requirePageIdentity(["participant"]);
  const classes = await getParticipantProjectClasses();
  return (
    <AppShell title="Buat Proyek" subtitle="Mulai satu proyek manuskrip baru">
      <div className="mx-auto max-w-2xl"><CreateProjectForm classes={classes} /></div>
    </AppShell>
  );
}
