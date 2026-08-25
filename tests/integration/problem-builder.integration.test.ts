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
  try {
    return ["127.0.0.1", "localhost"].includes(new URL(url).hostname);
  } catch {
    return false;
  }
})();
const configured = Boolean(
  isLocal && anonKey && serviceRoleKey && participantEmail && participantPassword && trainerEmail && trainerPassword,
);

const service = configured
  ? createClient(url!, serviceRoleKey!, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;
const createdProjectIds: string[] = [];
const createdUserIds: string[] = [];

function newClient() {
  return createClient(url!, anonKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      storageKey: `problem-builder-test-${crypto.randomUUID()}`,
    },
  });
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
    email: `participant.${crypto.randomUUID()}@scopusready.test`,
    password,
    email_confirm: true,
    user_metadata: { full_name: "Temporary Participant" },
  });
  expect(error).toBeNull();
  expect(data.user).toBeTruthy();
  const user = data.user as User;
  createdUserIds.push(user.id);
  return { email: user.email!, password };
}

afterEach(async () => {
  if (!service) return;
  for (const projectId of createdProjectIds.splice(0)) {
    await service.from("projects").delete().eq("id", projectId);
  }
  for (const userId of createdUserIds.splice(0)) {
    await service.auth.admin.deleteUser(userId);
  }
});

describe.skipIf(!configured)("Problem Builder persistence and RLS", () => {
  it("persists five answers, prevents unauthorized writes, and detects stale saves", async () => {
    const { client: owner, user: ownerUser } = await signIn(participantEmail!, participantPassword!);
    const { data: membership, error: membershipError } = await owner
      .from("class_members")
      .select("class_id")
      .eq("user_id", ownerUser.id)
      .eq("member_role", "participant")
      .single();
    expect(membershipError).toBeNull();

    const { data: project, error: projectError } = await owner
      .from("projects")
      .insert({
        owner_id: ownerUser.id,
        class_id: membership!.class_id,
        title: `Problem Builder Integration ${crypto.randomUUID()}`,
        research_stage: "idea",
        status: "active",
      })
      .select("id")
      .single();
    expect(projectError).toBeNull();
    createdProjectIds.push(project!.id);

    const initialContent = {
      topic: "Pembelajaran digital",
      phenomenon: "Penggunaan platform meningkat.",
      problem: "Keterlibatan mahasiswa belum optimal.",
      evidence: "Data kehadiran menunjukkan penurunan interaksi.",
      importance: "Keterlibatan memengaruhi hasil belajar.",
    };
    const { data: firstSave, error: firstSaveError } = await owner.rpc("save_problem_builder", {
      target_project_id: project!.id,
      target_content: initialContent,
      last_known_updated_at: null,
    });
    expect(firstSaveError).toBeNull();
    expect(firstSave?.completion_percent).toBe(100);
    expect(firstSave?.content).toEqual(initialContent);

    const { error: invalidPayloadError } = await owner.rpc("save_problem_builder", {
      target_project_id: project!.id,
      target_content: { ...initialContent, injected: "not allowed" },
      last_known_updated_at: firstSave!.updated_at,
    });
    expect(invalidPayloadError?.message).toContain("INVALID_CONTENT");

    const revisedContent = { ...initialContent, topic: "Keterlibatan dalam pembelajaran digital" };
    const { data: secondSave, error: secondSaveError } = await owner.rpc("save_problem_builder", {
      target_project_id: project!.id,
      target_content: revisedContent,
      last_known_updated_at: firstSave!.updated_at,
    });
    expect(secondSaveError).toBeNull();

    const { error: staleSaveError } = await owner.rpc("save_problem_builder", {
      target_project_id: project!.id,
      target_content: initialContent,
      last_known_updated_at: firstSave!.updated_at,
    });
    expect(staleSaveError?.message).toContain("VERSION_CONFLICT");

    const { error: directUpdateError } = await owner
      .from("worksheet_answers")
      .update({ content: initialContent })
      .eq("id", secondSave!.id);
    expect(directUpdateError).not.toBeNull();
    await owner.auth.signOut();

    const { client: restoredOwner } = await signIn(participantEmail!, participantPassword!);
    const { data: restoredAnswer, error: restoreError } = await restoredOwner
      .from("worksheet_answers")
      .select("content,completion_percent")
      .eq("id", secondSave!.id)
      .single();
    expect(restoreError).toBeNull();
    expect(restoredAnswer?.content).toEqual(revisedContent);
    expect(restoredAnswer?.completion_percent).toBe(100);

    const { client: assignedTrainer } = await signIn(trainerEmail!, trainerPassword!);
    const { data: trainerRead, error: trainerReadError } = await assignedTrainer
      .from("worksheet_answers")
      .select("id")
      .eq("id", secondSave!.id)
      .single();
    expect(trainerReadError).toBeNull();
    expect(trainerRead?.id).toBe(secondSave!.id);
    const { error: trainerWriteError } = await assignedTrainer.rpc("save_problem_builder", {
      target_project_id: project!.id,
      target_content: revisedContent,
      last_known_updated_at: secondSave!.updated_at,
    });
    expect(trainerWriteError?.message).toContain("ACCESS_DENIED");

    const outsiderCredentials = await createTemporaryParticipant();
    const { client: outsider } = await signIn(outsiderCredentials.email, outsiderCredentials.password);
    const { data: outsiderRead, error: outsiderReadError } = await outsider
      .from("worksheet_answers")
      .select("id")
      .eq("id", secondSave!.id);
    expect(outsiderReadError).toBeNull();
    expect(outsiderRead).toEqual([]);
    const { error: outsiderWriteError } = await outsider.rpc("save_problem_builder", {
      target_project_id: project!.id,
      target_content: revisedContent,
      last_known_updated_at: secondSave!.updated_at,
    });
    expect(outsiderWriteError?.message).toContain("ACCESS_DENIED");
  });
});
