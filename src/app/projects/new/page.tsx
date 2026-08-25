import { AppShell } from "@/components/AppShell";
import { CreateProjectForm } from "@/components/projects/CreateProjectForm";
import { getParticipantProjectClasses } from "@/services/project.service";

export default async function NewProjectPage() {
  const classes = await getParticipantProjectClasses();
  return (
    <AppShell title="Buat Proyek" subtitle="Mulai satu proyek manuskrip baru">
      <div className="mx-auto max-w-2xl"><CreateProjectForm classes={classes} /></div>
    </AppShell>
  );
}
