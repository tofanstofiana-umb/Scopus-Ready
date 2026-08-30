import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ActionTask, ActionTaskPriority, ActionTaskStatus } from "@/types/action-plan";
import { projectIdSchema } from "@/validation/project.schema";
import { requireIdentity } from "./auth.service";
import { getProject } from "./project.service";
import { assertClassPaymentClear } from "./payment.service";

export class ActionTaskAccessError extends Error {
  constructor() {
    super("ACTION_TASK_ACCESS_DENIED");
    this.name = "ActionTaskAccessError";
  }
}

export async function getActionTasks(projectId: string): Promise<ActionTask[]> {
  if (!projectIdSchema.safeParse(projectId).success) return [];
  await requireIdentity(["participant", "trainer", "admin"]);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("action_tasks")
    .select("*")
    .eq("project_id", projectId)
    .order("status")
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ActionTask[];
}

export async function createActionTask(input: {
  projectId: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: ActionTaskPriority;
}): Promise<ActionTask> {
  const { profile } = await requireIdentity(["participant"]);
  const project = await getProject(input.projectId);
  await assertClassPaymentClear(project?.class_id ?? null, profile.id);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("create_action_task", {
    target_project_id: input.projectId,
    target_title: input.title,
    target_description: input.description ?? null,
    target_due_date: input.dueDate ?? null,
    target_priority: input.priority,
  });
  if (error) {
    if (error.message.includes("ACCESS_DENIED")) throw new ActionTaskAccessError();
    throw error;
  }
  return data as ActionTask;
}

export async function setActionTaskStatus(id: string, status: ActionTaskStatus): Promise<ActionTask> {
  await requireIdentity(["participant"]);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("set_action_task_status", {
    target_task_id: id,
    target_status: status,
  });
  if (error) {
    if (error.message.includes("ACCESS_DENIED") || error.message.includes("NOT_FOUND")) {
      throw new ActionTaskAccessError();
    }
    throw error;
  }
  return data as ActionTask;
}

export async function deleteActionTask(id: string) {
  await requireIdentity(["participant"]);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("delete_action_task", { target_task_id: id });
  if (error) {
    if (error.message.includes("ACCESS_DENIED") || error.message.includes("NOT_FOUND")) {
      throw new ActionTaskAccessError();
    }
    throw error;
  }
}
