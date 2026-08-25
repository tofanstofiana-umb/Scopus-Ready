export type FeedbackStatus = "open" | "addressed" | "resolved";
export type FeedbackPriority = "low" | "medium" | "high";

export interface TrainerFeedback {
  id: string;
  project_id: string;
  worksheet_answer_id: string;
  trainer_id: string;
  comment: string;
  status: FeedbackStatus;
  priority: FeedbackPriority;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}
