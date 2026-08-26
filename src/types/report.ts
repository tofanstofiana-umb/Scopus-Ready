import type { ActionTask } from "./action-plan";
import type { Profile } from "./auth";
import type { TrainerFeedback } from "./feedback";
import type { JournalTarget } from "./journal";
import type { Project } from "./project";
import type { ProblemBuilderContent, WorksheetStatus } from "./worksheet";
import type { CriticalGateResult, ReadinessResult } from "@/domain/scoring/gates";

export interface ProjectReportData {
  generatedAt: string;
  owner: Pick<Profile, "full_name" | "email" | "institution" | "field_of_study">;
  project: Project;
  progress: number;
  score: number | null;
  scoreCompletedDimensions: number;
  scoreTotalDimensions: number;
  gates: CriticalGateResult[];
  readiness: ReadinessResult;
  problemBuilder: {
    content: ProblemBuilderContent;
    status: WorksheetStatus;
    completionPercent: number;
    updatedAt: string;
  } | null;
  feedback: TrainerFeedback[];
  journals: JournalTarget[];
  actionTasks: ActionTask[];
}
