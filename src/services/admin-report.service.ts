import "server-only";

import { requireIdentity } from "./auth.service";
import { getUserProjects } from "./project.service";
import { getProjectsMetrics } from "./progress.service";
import { getAdminClassSummaries } from "./class.service";
import type { AdminClassReport, AdminReadinessBreakdown, AdminReportSummary } from "@/types/admin-report";

function emptyBreakdown(): AdminReadinessBreakdown {
  return { ready_to_submit: 0, minor_revision: 0, major_revision: 0, awaiting_assessment: 0 };
}

function average(scores: number[]): number | null {
  if (scores.length === 0) return null;
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
}

export async function getAdminReportSummary(): Promise<AdminReportSummary> {
  await requireIdentity(["admin"]);
  const [projects, classes] = await Promise.all([getUserProjects(), getAdminClassSummaries()]);
  const metrics = await getProjectsMetrics(projects.map((project) => project.id));
  const classNameById = new Map(classes.map((c) => [c.id, c.name]));

  type ClassBucket = { className: string; totalProjects: number; scores: number[]; readiness: AdminReadinessBreakdown };
  const byClassMap = new Map<string, ClassBucket>();
  const overallReadiness = emptyBreakdown();
  const overallScores: number[] = [];

  for (const project of projects) {
    const projectMetrics = metrics.get(project.id);
    if (!projectMetrics) continue;

    overallReadiness[projectMetrics.readiness.status] += 1;
    if (projectMetrics.score.complete && projectMetrics.score.score !== null) overallScores.push(projectMetrics.score.score);

    const key = project.class_id ?? "__none__";
    if (!byClassMap.has(key)) {
      byClassMap.set(key, {
        className: project.class_id ? classNameById.get(project.class_id) ?? "Kelas tidak dikenal" : "Tanpa Kelas",
        totalProjects: 0,
        scores: [],
        readiness: emptyBreakdown(),
      });
    }
    const bucket = byClassMap.get(key) as ClassBucket;
    bucket.totalProjects += 1;
    bucket.readiness[projectMetrics.readiness.status] += 1;
    if (projectMetrics.score.complete && projectMetrics.score.score !== null) bucket.scores.push(projectMetrics.score.score);
  }

  const byClass: AdminClassReport[] = [...byClassMap.entries()]
    .map(([classId, bucket]) => ({
      classId: classId === "__none__" ? null : classId,
      className: bucket.className,
      totalProjects: bucket.totalProjects,
      averageScore: average(bucket.scores),
      readiness: bucket.readiness,
    }))
    .sort((a, b) => b.totalProjects - a.totalProjects);

  return {
    totalProjects: projects.length,
    averageScore: average(overallScores),
    readiness: overallReadiness,
    byClass,
  };
}
