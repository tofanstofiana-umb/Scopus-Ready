import { ParticipantDashboard } from "@/components/dashboard/ParticipantDashboard";
import { requirePageIdentity } from "@/services/page-auth.service";
import { getUserProjects } from "@/services/project.service";
import { getProjectsMetrics } from "@/services/progress.service";
import { getMyClassEnrollments } from "@/services/payment.service";

export default async function DashboardPage() {
  const identity = await requirePageIdentity(["participant", "admin"]);
  const projects = await getUserProjects();
  const [metrics, enrollments] = await Promise.all([
    getProjectsMetrics(projects.map((project) => project.id)),
    identity.profile.role === "participant" ? getMyClassEnrollments() : Promise.resolve([]),
  ]);
  return (
    <ParticipantDashboard
      profile={identity.profile}
      projects={projects.flatMap((project) => {
        const projectMetrics = metrics.get(project.id);
        return projectMetrics ? [{ project, metrics: projectMetrics }] : [];
      })}
      unpaidEnrollments={enrollments.filter((enrollment) => enrollment.status === "unpaid")}
      hasNoClass={identity.profile.role === "participant" && enrollments.length === 0}
    />
  );
}
