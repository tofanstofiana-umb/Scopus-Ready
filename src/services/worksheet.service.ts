import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireIdentity } from "./auth.service";
import type { JournalTargetModuleContent, ProblemBuilderContent, WorksheetAnswer } from "@/types/worksheet";
import type { StructuredWorksheetCode, StructuredWorksheetContent } from "@/domain/worksheets/structured-worksheets";
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

export class InternalReviewNotReadyError extends Error {
  constructor() {
    super("REVIEW_NOT_READY");
    this.name = "InternalReviewNotReadyError";
  }
}

async function getWorksheet<TContent>(projectId: string, moduleCode: string): Promise<WorksheetAnswer<TContent> | null> {
  if (!projectIdSchema.safeParse(projectId).success) return null;
  await requireIdentity(["participant", "trainer", "admin"]);
  const supabase = await createSupabaseServerClient();
  const { data: module, error: moduleError } = await supabase
    .from("worksheet_modules")
    .select("id")
    .eq("code", moduleCode)
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
  return data as WorksheetAnswer<TContent> | null;
}

export async function getProblemWorksheet(projectId: string): Promise<WorksheetAnswer<ProblemBuilderContent> | null> {
  return getWorksheet<ProblemBuilderContent>(projectId, "problem");
}

export async function getStructuredWorksheet(
  projectId: string,
  moduleCode: StructuredWorksheetCode,
): Promise<WorksheetAnswer<StructuredWorksheetContent> | null> {
  return getWorksheet<StructuredWorksheetContent>(projectId, moduleCode);
}

export async function getJournalTargetWorksheet(
  projectId: string,
): Promise<WorksheetAnswer<JournalTargetModuleContent> | null> {
  return getWorksheet<JournalTargetModuleContent>(projectId, "journal_target");
}

export async function saveStructuredWorksheet(input: {
  projectId: string;
  moduleCode: StructuredWorksheetCode;
  content: StructuredWorksheetContent;
  lastKnownUpdatedAt?: string | null;
}): Promise<WorksheetAnswer<StructuredWorksheetContent>> {
  await requireIdentity(["participant"]);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("save_structured_worksheet", {
    target_project_id: input.projectId,
    target_module_code: input.moduleCode,
    target_content: input.content,
    last_known_updated_at: input.lastKnownUpdatedAt || null,
  });
  if (error) {
    if (error.message.includes("VERSION_CONFLICT")) throw new WorksheetConflictError();
    if (error.message.includes("ACCESS_DENIED")) throw new WorksheetAccessError();
    throw error;
  }
  return data as WorksheetAnswer<StructuredWorksheetContent>;
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

export async function approveInternalReview(projectId: string): Promise<WorksheetAnswer<StructuredWorksheetContent>> {
  await requireIdentity(["trainer", "admin"]);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("complete_internal_review", { target_project_id: projectId });
  if (error) {
    if (error.message.includes("REVIEW_NOT_READY")) throw new InternalReviewNotReadyError();
    if (error.message.includes("ACCESS_DENIED")) throw new WorksheetAccessError();
    throw error;
  }
  return data as WorksheetAnswer<StructuredWorksheetContent>;
}
