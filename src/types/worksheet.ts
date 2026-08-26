export type WorksheetStatus = "not_started" | "in_progress" | "needs_revision" | "completed";
export type SaveStatus = "idle" | "saving" | "saved" | "error";

export interface ProblemBuilderContent {
  topic: string;
  phenomenon: string;
  problem: string;
  evidence: string;
  importance: string;
}

export interface JournalTargetModuleContent {
  active_count: number;
  primary_count: number;
  backup_count: number;
  primary_assessed: boolean;
  best_fit: number;
}

export interface RoadmapModuleContent {
  task_count: number;
  dated_count: number;
  high_priority_count: number;
  completed_count: number;
}

export interface WorksheetAnswer<TContent = ProblemBuilderContent> {
  id: string;
  project_id: string;
  module_id: string;
  content: TContent;
  status: WorksheetStatus;
  completion_percent: number;
  last_saved_at: string | null;
  created_at: string;
  updated_at: string;
}
