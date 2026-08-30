import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { JournalTarget, JournalTargetInput } from "@/types/journal";
import { projectIdSchema } from "@/validation/project.schema";
import { requireIdentity } from "./auth.service";
import { getProject } from "./project.service";
import { assertClassPaymentClear } from "./payment.service";

export class JournalTargetAccessError extends Error {
  constructor() {
    super("JOURNAL_TARGET_ACCESS_DENIED");
    this.name = "JournalTargetAccessError";
  }
}

export class DuplicateJournalTargetError extends Error {
  constructor() {
    super("DUPLICATE_JOURNAL_TARGET");
    this.name = "DuplicateJournalTargetError";
  }
}

export async function getJournalTargets(projectId: string): Promise<JournalTarget[]> {
  if (!projectIdSchema.safeParse(projectId).success) return [];
  await requireIdentity(["participant", "trainer", "admin"]);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("journal_targets")
    .select("*")
    .eq("project_id", projectId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as JournalTarget[];
}

export async function saveJournalTarget(input: JournalTargetInput): Promise<JournalTarget> {
  const { profile } = await requireIdentity(["participant"]);
  const project = await getProject(input.projectId);
  await assertClassPaymentClear(project?.class_id ?? null, profile.id);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("save_journal_target", {
    target_id: input.id ?? null,
    target_project_id: input.projectId,
    target_journal_name: input.journalName,
    target_publisher: input.publisher ?? null,
    target_website_url: input.websiteUrl ?? null,
    target_quartile: input.quartile,
    target_scope_match: input.scopeMatch,
    target_article_type_match: input.articleTypeMatch,
    target_audience_match: input.audienceMatch,
    target_requirements_match: input.requirementsMatch,
    target_status: input.status,
    target_notes: input.notes ?? null,
  });
  if (error) {
    if (error.message.includes("DUPLICATE_JOURNAL_TARGET")) throw new DuplicateJournalTargetError();
    if (error.message.includes("ACCESS_DENIED") || error.message.includes("TARGET_NOT_FOUND")) {
      throw new JournalTargetAccessError();
    }
    throw error;
  }
  return data as JournalTarget;
}

export async function deleteJournalTarget(id: string) {
  await requireIdentity(["participant"]);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("delete_journal_target", { target_id: id });
  if (error) {
    if (error.message.includes("ACCESS_DENIED") || error.message.includes("NOT_FOUND")) {
      throw new JournalTargetAccessError();
    }
    throw error;
  }
}
