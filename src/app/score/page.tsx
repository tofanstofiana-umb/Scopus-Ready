import { ProjectScore } from "@/components/score/ProjectScore";
import { requirePageIdentity } from "@/services/page-auth.service";
import { getUserProjects } from "@/services/project.service";
import { getProjectsMetrics } from "@/services/progress.service";

export default async function ScorePage({ searchParams }: { searchParams: Promise<{ projectId?: string }> }) {
  const identity = await requirePageIdentity(["participant", "trainer", "admin"]);
  const [{ projectId }, projects] = await Promise.all([searchParams, getUserProjects()]);
  const selectedProject = projects.find((project) => project.id === projectId) ?? projects[0] ?? null;
  const metrics = selectedProject ? await getProjectsMetrics([selectedProject.id]) : new Map();
  const selectedMetrics = selectedProject ? metrics.get(selectedProject.id) : null;
  return <ProjectScore profile={identity.profile} projects={projects} selected={selectedProject && selectedMetrics ? { project: selectedProject, metrics: selectedMetrics } : null} />;
}
