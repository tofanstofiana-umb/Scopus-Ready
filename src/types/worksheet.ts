export type WorksheetStatus = "not_started" | "in_progress" | "needs_revision" | "completed";
export type SaveStatus = "idle" | "saving" | "saved" | "error";

export interface ProblemBuilderContent {
  topic: string;
  phenomenon: string;
  problem: string;
  evidence: string;
  importance: string;
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
