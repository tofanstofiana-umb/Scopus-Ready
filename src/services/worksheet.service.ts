import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireIdentity } from "./auth.service";
import type { ProblemBuilderContent, WorksheetAnswer } from "@/types/worksheet";
import { projectIdSchema } from "@/validation/project.schema";

const answerFields = "id,project_id,module_id,content,status,completion_percent,last_saved_at,created_at,updated_at";

export class WorksheetConflictError extends Error {
  constructor() {
    super("VERSION_CONFLICT");
    this.name = "WorksheetConflictError";
  }
}

export class WorksheetAccessError extends Error {
  constructor() {
    super("ACCESS_DENIED");
    this.name = "WorksheetAccessError";
  }
}

export async function getProblemWorksheet(projectId: string): Promise<WorksheetAnswer | null> {
  if (!projectIdSchema.safeParse(projectId).success) return null;
  await requireIdentity(["participant", "trainer", "admin"]);
  const supabase = await createSupabaseServerClient();
  const { data: module, error: moduleError } = await supabase
    .from("worksheet_modules")
    .select("id")
    .eq("code", "problem")
    .eq("is_active", true)
    .single();
  if (moduleError) throw moduleError;
  const { data, error } = await supabase
    .from("worksheet_answers")
    .select(answerFields)
    .eq("project_id", projectId)
    .eq("module_id", module.id)
    .maybeSingle();
  if (error) throw error;
  return data as WorksheetAnswer | null;
}

export async function saveProblemWorksheet(input: {
  projectId: string;
  content: ProblemBuilderContent;
  lastKnownUpdatedAt?: string | null;
}): Promise<WorksheetAnswer> {
  await requireIdentity(["participant"]);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("save_problem_builder", {
    target_project_id: input.projectId,
    target_content: input.content,
    last_known_updated_at: input.lastKnownUpdatedAt || null,
  });
  if (error) {
    if (error.message.includes("VERSION_CONFLICT")) throw new WorksheetConflictError();
    if (error.message.includes("ACCESS_DENIED")) throw new WorksheetAccessError();
    throw error;
  }
  return data as WorksheetAnswer;
}
