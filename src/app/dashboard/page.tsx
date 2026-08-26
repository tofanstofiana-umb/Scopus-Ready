import { ParticipantDashboard } from "@/components/dashboard/ParticipantDashboard";
import { requirePageIdentity } from "@/services/page-auth.service";
import { getUserProjects } from "@/services/project.service";
import { getProjectsMetrics } from "@/services/progress.service";

export default async function DashboardPage() {
  const identity = await requirePageIdentity(["participant", "admin"]);
  const projects = await getUserProjects();
  const metrics = await getProjectsMetrics(projects.map((project) => project.id));
  return <ParticipantDashboard profile={identity.profile} projects={projects.flatMap((project) => {
    const projectMetrics = metrics.get(project.id);
    return projectMetrics ? [{ project, metrics: projectMetrics }] : [];
  })} />;
}
