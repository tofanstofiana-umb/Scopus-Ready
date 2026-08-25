import { redirect } from "next/navigation";
import { ProjectScore } from "@/components/score/ProjectScore";
import { getCurrentIdentity } from "@/services/auth.service";
import { getUserProjects } from "@/services/project.service";
import { getProjectsMetrics } from "@/services/progress.service";

export default async function ScorePage({ searchParams }: { searchParams: Promise<{ projectId?: string }> }) {
  const [{ projectId }, identity, projects] = await Promise.all([searchParams, getCurrentIdentity(), getUserProjects()]);
  if (!identity) redirect("/login");
  const selectedProject = projects.find((project) => project.id === projectId) ?? projects[0] ?? null;
  const metrics = selectedProject ? await getProjectsMetrics([selectedProject.id]) : new Map();
  const selectedMetrics = selectedProject ? metrics.get(selectedProject.id) : null;
  return <ProjectScore profile={identity.profile} projects={projects} selected={selectedProject && selectedMetrics ? { project: selectedProject, metrics: selectedMetrics } : null} />;
}
