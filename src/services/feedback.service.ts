import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireIdentity } from "./auth.service";
import { getProject } from "./project.service";
import { assertClassPaymentClear } from "./payment.service";
import { createNotification } from "./notification.service";
import type { FeedbackPriority, TrainerFeedback } from "@/types/feedback";
import { projectIdSchema } from "@/validation/project.schema";

export class FeedbackAccessError extends Error {
  constructor() {
    super("FEEDBACK_ACCESS_DENIED");
    this.name = "FeedbackAccessError";
  }
}

export async function getWorksheetFeedback(worksheetAnswerId: string): Promise<TrainerFeedback[]> {
  if (!projectIdSchema.safeParse(worksheetAnswerId).success) return [];
  await requireIdentity();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("feedback").select("*").eq("worksheet_answer_id", worksheetAnswerId).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as TrainerFeedback[];
}

export async function createFeedback(input: {
  projectId: string;
  worksheetAnswerId: string;
  comment: string;
  priority: FeedbackPriority;
}): Promise<TrainerFeedback> {
  await requireIdentity(["trainer"]);
  const project = await getProject(input.projectId);
  if (project) await assertClassPaymentClear(project.class_id, project.owner_id);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("create_trainer_feedback", {
    target_project_id: input.projectId,
    target_worksheet_answer_id: input.worksheetAnswerId,
    target_comment: input.comment,
    target_priority: input.priority,
  });
  if (error) {
    if (error.message.includes("ACCESS_DENIED") || error.message.includes("INVALID_FEEDBACK_TARGET")) {
      throw new FeedbackAccessError();
    }
    throw error;
  }

  if (project) {
    await createNotification(project.owner_id, "feedback_received", "Feedback baru dari trainer", input.comment.slice(0, 120), `/projects/${input.projectId}`);
  }

  return data as TrainerFeedback;
}

export async function markFeedbackAddressed(feedbackId: string) {
  await requireIdentity(["participant"]);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("mark_feedback_addressed", { target_feedback_id: feedbackId });
  if (error) throw error;
}

export async function resolveFeedback(feedbackId: string) {
  await requireIdentity(["trainer"]);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("resolve_trainer_feedback", { target_feedback_id: feedbackId });
  if (error) {
    if (error.message.includes("ACCESS_DENIED") || error.message.includes("NOT_FOUND")) {
      throw new FeedbackAccessError();
    }
    throw error;
  }
}
