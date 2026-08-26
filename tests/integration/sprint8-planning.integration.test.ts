import { createClient, type User } from "@supabase/supabase-js";
import { afterEach, describe, expect, it } from "vitest";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const participantEmail = process.env.SUPABASE_TEST_PARTICIPANT_EMAIL;
const participantPassword = process.env.SUPABASE_TEST_PARTICIPANT_PASSWORD;
const trainerEmail = process.env.SUPABASE_TEST_TRAINER_EMAIL;
const trainerPassword = process.env.SUPABASE_TEST_TRAINER_PASSWORD;

const isLocal = (() => {
  if (!url) return false;
  try { return ["127.0.0.1", "localhost"].includes(new URL(url).hostname); } catch { return false; }
})();
const configured = Boolean(isLocal && anonKey && serviceRoleKey && participantEmail && participantPassword && trainerEmail && trainerPassword);
const service = configured ? createClient(url!, serviceRoleKey!, { auth: { autoRefreshToken: false, persistSession: false } }) : null;
const createdProjectIds: string[] = [];
const createdUserIds: string[] = [];

function newClient() {
  return createClient(url!, anonKey!, { auth: { autoRefreshToken: false, persistSession: false, storageKey: `sprint8-${crypto.randomUUID()}` } });
}

async function signIn(email: string, password: string) {
  const client = newClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  expect(error).toBeNull();
  expect(data.user).toBeTruthy();
  return { client, user: data.user! };
}

async function createTemporaryParticipant() {
  const password = "Temporary123!";
  const { data, error } = await service!.auth.admin.createUser({
    email: `sprint8.${crypto.randomUUID()}@scopusready.test`,
    password,
    email_confirm: true,
    user_metadata: { full_name: "Sprint 8 Outsider" },
  });
  expect(error).toBeNull();
  const user = data.user as User;
  createdUserIds.push(user.id);
  return { email: user.email!, password };
}

afterEach(async () => {
  if (!service) return;
  for (const projectId of createdProjectIds.splice(0)) await service.from("projects").delete().eq("id", projectId);
  for (const userId of createdUserIds.splice(0)) await service.auth.admin.deleteUser(userId);
});

describe.skipIf(!configured)("Sprint 8 Journal Matrix and Action Plan persistence", () => {
  it("persists owner planning data, permits trainer reads, and blocks unrelated access", async () => {
    const { client: owner, user: ownerUser } = await signIn(participantEmail!, participantPassword!);
    const { data: membership, error: membershipError } = await owner.from("class_members").select("class_id").eq("user_id", ownerUser.id).eq("member_role", "participant").single();
    expect(membershipError).toBeNull();

    const { data: project, error: projectError } = await owner.from("projects").insert({
      owner_id: ownerUser.id,
      class_id: membership!.class_id,
      title: `Sprint 8 Integration ${crypto.randomUUID()}`,
      research_stage: "journal_targeting",
      status: "active",
    }).select("id").single();
    expect(projectError).toBeNull();
    createdProjectIds.push(project!.id);

    const { data: journal, error: journalError } = await owner.rpc("save_journal_target", {
      target_id: null,
      target_project_id: project!.id,
      target_journal_name: "Journal of Integration Testing",
      target_publisher: "Example Publisher",
      target_website_url: "https://example.test/journal",
      target_quartile: "q1",
      target_scope_match: 5,
      target_article_type_match: 4,
      target_audience_match: 4,
      target_requirements_match: 3,
      target_status: "primary",
      target_notes: "Primary target.",
    });
    expect(journalError).toBeNull();
    expect(journal?.journal_name).toBe("Journal of Integration Testing");

    const { data: task, error: taskError } = await owner.rpc("create_action_task", {
      target_project_id: project!.id,
      target_title: "Adapt manuscript to author guidelines",
      target_description: "Review word limit and reference style.",
      target_due_date: "2026-09-15",
      target_priority: "high",
    });
    expect(taskError).toBeNull();
    expect(task?.status).toBe("not_started");

    const { error: statusError } = await owner.rpc("set_action_task_status", { target_task_id: task!.id, target_status: "completed" });
    expect(statusError).toBeNull();
    const { data: completedTask, error: completedReadError } = await owner.from("action_tasks").select("status,completed_at").eq("id", task!.id).single();
    expect(completedReadError).toBeNull();
    expect(completedTask?.status).toBe("completed");
    expect(completedTask?.completed_at).toBeTruthy();

    const { error: directJournalWrite } = await owner.from("journal_targets").update({ notes: "Direct update" }).eq("id", journal!.id);
    const { error: directTaskWrite } = await owner.from("action_tasks").delete().eq("id", task!.id);
    expect(directJournalWrite).not.toBeNull();
    expect(directTaskWrite).not.toBeNull();

    const { client: trainer } = await signIn(trainerEmail!, trainerPassword!);
    const { data: trainerJournals, error: trainerJournalError } = await trainer.from("journal_targets").select("id").eq("project_id", project!.id);
    const { data: trainerTasks, error: trainerTaskError } = await trainer.from("action_tasks").select("id").eq("project_id", project!.id);
    expect(trainerJournalError).toBeNull();
    expect(trainerTaskError).toBeNull();
    expect(trainerJournals).toHaveLength(1);
    expect(trainerTasks).toHaveLength(1);
    const { error: trainerMutationError } = await trainer.rpc("set_action_task_status", { target_task_id: task!.id, target_status: "in_progress" });
    expect(trainerMutationError?.message).toContain("ACCESS_DENIED");

    const outsiderCredentials = await createTemporaryParticipant();
    const { client: outsider } = await signIn(outsiderCredentials.email, outsiderCredentials.password);
    const { data: outsiderJournals, error: outsiderJournalError } = await outsider.from("journal_targets").select("id").eq("project_id", project!.id);
    const { data: outsiderTasks, error: outsiderTaskError } = await outsider.from("action_tasks").select("id").eq("project_id", project!.id);
    expect(outsiderJournalError).toBeNull();
    expect(outsiderTaskError).toBeNull();
    expect(outsiderJournals).toEqual([]);
    expect(outsiderTasks).toEqual([]);
    const { error: outsiderMutationError } = await outsider.rpc("delete_journal_target", { target_id: journal!.id });
    expect(outsiderMutationError?.message).toContain("ACCESS_DENIED");
  });
});
