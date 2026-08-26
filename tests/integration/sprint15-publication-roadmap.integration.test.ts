import { createClient } from "@supabase/supabase-js";
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

function newClient() {
  return createClient(url!, anonKey!, { auth: { autoRefreshToken: false, persistSession: false, storageKey: `sprint15-${crypto.randomUUID()}` } });
}

async function signIn(email: string, password: string) {
  const client = newClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  expect(error).toBeNull();
  return { client, user: data.user! };
}

async function readRoadmap(client: ReturnType<typeof newClient>, projectId: string) {
  return client
    .from("worksheet_answers")
    .select("id,status,completion_percent,content,worksheet_modules!inner(code)")
    .eq("project_id", projectId)
    .eq("worksheet_modules.code", "roadmap")
    .single();
}

afterEach(async () => {
  if (!service) return;
  for (const projectId of createdProjectIds.splice(0)) await service.from("projects").delete().eq("id", projectId);
});

describe.skipIf(!configured)("Sprint 15 Publication Roadmap", () => {
  it("derives roadmap progress from Action Plan and permits trainer reads", async () => {
    const { client: owner, user } = await signIn(participantEmail!, participantPassword!);
    const { data: membership, error: membershipError } = await owner.from("class_members").select("class_id").eq("user_id", user.id).eq("member_role", "participant").single();
    expect(membershipError).toBeNull();
    const { data: project, error: projectError } = await owner.from("projects").insert({
      owner_id: user.id,
      class_id: membership!.class_id,
      title: `Sprint 15 Integration ${crypto.randomUUID()}`,
      research_stage: "review_revision",
      status: "active",
    }).select("id").single();
    expect(projectError).toBeNull();
    createdProjectIds.push(project!.id);

    const createTask = (title: string, dueDate: string, priority: "high" | "medium") => owner.rpc("create_action_task", {
      target_project_id: project!.id,
      target_title: title,
      target_description: "Milestone publication roadmap.",
      target_due_date: dueDate,
      target_priority: priority,
    });
    const { data: first, error: firstError } = await createTask("Final manuscript", "2026-09-01", "high");
    expect(firstError).toBeNull();
    const { data: firstRoadmap } = await readRoadmap(owner, project!.id);
    expect(firstRoadmap?.completion_percent).toBe(60);
    expect(firstRoadmap?.content.task_count).toBe(1);

    const { data: second, error: secondError } = await createTask("Submit manuscript", "2026-09-08", "medium");
    const { data: third, error: thirdError } = await createTask("Monitor editorial review", "2026-09-15", "medium");
    expect(secondError).toBeNull();
    expect(thirdError).toBeNull();
    const { data: planned } = await readRoadmap(owner, project!.id);
    expect(planned?.completion_percent).toBe(80);
    expect(planned?.status).toBe("in_progress");

    for (const task of [first!, second!, third!]) {
      const { error } = await owner.rpc("set_action_task_status", { target_task_id: task.id, target_status: "completed" });
      expect(error).toBeNull();
    }
    const { data: completed } = await readRoadmap(owner, project!.id);
    expect(completed?.completion_percent).toBe(100);
    expect(completed?.status).toBe("completed");
    expect(completed?.content.completed_count).toBe(3);

    const { error: manualWriteError } = await owner.rpc("save_structured_worksheet", {
      target_project_id: project!.id,
      target_module_code: "roadmap",
      target_content: { injected: "manual progress is forbidden" },
      last_known_updated_at: null,
    });
    expect(manualWriteError?.message).toContain("UNSUPPORTED_MODULE");

    const { client: trainer } = await signIn(trainerEmail!, trainerPassword!);
    const { data: trainerRoadmap, error: trainerReadError } = await readRoadmap(trainer, project!.id);
    expect(trainerReadError).toBeNull();
    expect(trainerRoadmap?.completion_percent).toBe(100);

    const { error: deleteError } = await owner.rpc("delete_action_task", { target_task_id: third!.id });
    expect(deleteError).toBeNull();
    const { data: reduced } = await readRoadmap(owner, project!.id);
    expect(reduced?.completion_percent).toBe(80);
    expect(reduced?.status).toBe("in_progress");
  });
});
