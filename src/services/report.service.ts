import "server-only";

import { getActionTasks } from "./action-plan.service";
import { requireIdentity } from "./auth.service";
import { getWorksheetFeedback } from "./feedback.service";
import { getJournalTargets } from "./journal.service";
import { getProject } from "./project.service";
import { getProjectMetrics } from "./progress.service";
import { getProblemWorksheet } from "./worksheet.service";
import type { ProjectReportData } from "@/types/report";

export async function getProjectReport(projectId: string): Promise<ProjectReportData | null> {
  const { profile } = await requireIdentity(["participant"]);
  const [project, problemBuilder, metrics, journals, actionTasks] = await Promise.all([
    getProject(projectId),
    getProblemWorksheet(projectId),
    getProjectMetrics(projectId),
    getJournalTargets(projectId),
    getActionTasks(projectId),
  ]);
  if (!project || project.owner_id !== profile.id || !metrics) return null;
  const feedback = problemBuilder ? await getWorksheetFeedback(problemBuilder.id) : [];

  return {
    generatedAt: new Date().toISOString(),
    owner: {
      full_name: profile.full_name,
      email: profile.email,
      institution: profile.institution,
      field_of_study: profile.field_of_study,
    },
    project,
    progress: metrics.progress,
    score: metrics.score.score,
    scoreCompletedDimensions: metrics.score.assessedDimensions,
    scoreTotalDimensions: metrics.score.totalDimensions,
    gates: metrics.gates,
    readiness: metrics.readiness,
    problemBuilder: problemBuilder
      ? {
          content: problemBuilder.content,
          status: problemBuilder.status,
          completionPercent: problemBuilder.completion_percent,
          updatedAt: problemBuilder.updated_at,
        }
      : null,
    feedback,
    journals,
    actionTasks,
  };
}
