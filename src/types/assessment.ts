import type { RubricDimension } from "@/domain/scoring/score";

export interface Assessment {
  id: string;
  project_id: string;
  worksheet_answer_id: string;
  assessor_id: string;
  dimension: RubricDimension;
  score: number;
  max_score: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssessmentWriteItem {
  dimension: RubricDimension;
  score: number;
  notes?: string;
}

export interface SaveProjectAssessmentsInput {
  projectId: string;
  worksheetAnswerId: string;
  assessments: AssessmentWriteItem[];
}
