export type ResearchStage =
  | "idea"
  | "proposal"
  | "data_available"
  | "draft_manuscript"
  | "journal_targeting"
  | "review_revision";

export interface Project {
  id: string;
  owner_id: string;
  class_id: string | null;
  title: string;
  field: string | null;
  research_stage: ResearchStage;
  status: "active" | "completed" | "archived";
  created_at: string;
  updated_at: string;
}

export interface ProjectClassOption {
  id: string;
  name: string;
  code: string;
}
