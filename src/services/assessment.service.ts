import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireIdentity } from "./auth.service";
import { projectIdSchema } from "@/validation/project.schema";
import type { Assessment, SaveProjectAssessmentsInput } from "@/types/assessment";

const assessmentFields = "id,project_id,worksheet_answer_id,assessor_id,dimension,score,max_score,notes,created_at,updated_at";

export async function getProjectAssessments(projectId: string): Promise<Assessment[]> {
  if (!projectIdSchema.safeParse(projectId).success) return [];
  await requireIdentity(["participant", "trainer", "admin"]);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("assessments")
    .select(assessmentFields)
    .eq("project_id", projectId)
    .order("dimension");
  if (error) throw error;
  return (data ?? []).map((item) => ({ ...item, score: Number(item.score), max_score: Number(item.max_score) })) as Assessment[];
}

export async function saveProjectAssessments(input: SaveProjectAssessmentsInput): Promise<Assessment[]> {
  await requireIdentity(["trainer", "admin"]);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("save_project_assessments", {
    target_project_id: input.projectId,
    target_worksheet_answer_id: input.worksheetAnswerId,
    target_assessments: input.assessments,
  });
  if (error) throw error;
  return (data ?? []).map((item: Record<string, unknown>) => ({
    ...item,
    score: Number(item.score),
    max_score: Number(item.max_score),
  })) as unknown as Assessment[];
}
