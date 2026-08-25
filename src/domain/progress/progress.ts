import type { ProblemBuilderContent, WorksheetStatus } from "@/types/worksheet";

export const PROBLEM_FIELDS = [
  "topic",
  "phenomenon",
  "problem",
  "evidence",
  "importance",
] as const;

export interface ModuleProgressInput {
  status: WorksheetStatus;
}

export const WORKSHEET_STATUS_WEIGHT: Record<WorksheetStatus, number> = {
  not_started: 0,
  in_progress: 0.5,
  needs_revision: 0.75,
  completed: 1,
};

export function calculateWorksheetCompletion(content: Partial<ProblemBuilderContent>): number {
  const completed = PROBLEM_FIELDS.filter((field) => {
    const value = content[field];
    return typeof value === "string" && value.trim().length > 0;
  }).length;

  return Math.round((completed / PROBLEM_FIELDS.length) * 100);
}

export function determineWorksheetStatus(
  content: Partial<ProblemBuilderContent>,
  hasOpenRevision = false,
  markedCompleted = false,
): WorksheetStatus {
  const completion = calculateWorksheetCompletion(content);
  if (hasOpenRevision) return "needs_revision";
  if (markedCompleted && completion === 100) return "completed";
  if (completion === 0) return "not_started";
  return "in_progress";
}

export function calculateProjectProgress(modules: ModuleProgressInput[]): number {
  if (modules.length === 0) return 0;
  const totalWeight = modules.reduce((sum, module) => sum + WORKSHEET_STATUS_WEIGHT[module.status], 0);
  return Math.round(((totalWeight / modules.length) * 100) * 10) / 10;
}
