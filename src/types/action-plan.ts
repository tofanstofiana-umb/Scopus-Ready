export type ActionTaskPriority = "low" | "medium" | "high";
export type ActionTaskStatus = "not_started" | "in_progress" | "completed";

export interface ActionTask {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: ActionTaskPriority;
  status: ActionTaskStatus;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}
