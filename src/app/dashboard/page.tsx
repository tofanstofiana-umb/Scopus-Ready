import { redirect } from "next/navigation";
import { ParticipantDashboard } from "@/components/dashboard/ParticipantDashboard";
import { getCurrentIdentity } from "@/services/auth.service";
import { getUserProjects } from "@/services/project.service";
import { getProjectsMetrics } from "@/services/progress.service";

export default async function DashboardPage() {
  const [identity, projects] = await Promise.all([getCurrentIdentity(), getUserProjects()]);
  if (!identity) redirect("/login");
  const metrics = await getProjectsMetrics(projects.map((project) => project.id));
  return <ParticipantDashboard profile={identity.profile} projects={projects.flatMap((project) => {
    const projectMetrics = metrics.get(project.id);
    return projectMetrics ? [{ project, metrics: projectMetrics }] : [];
  })} />;
}
