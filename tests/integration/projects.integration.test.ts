import { createClient, type User } from "@supabase/supabase-js";
import { afterEach, describe, expect, it } from "vitest";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const participantEmail = process.env.SUPABASE_TEST_PARTICIPANT_EMAIL;
const participantPassword = process.env.SUPABASE_TEST_PARTICIPANT_PASSWORD;
const trainerEmail = process.env.SUPABASE_TEST_TRAINER_EMAIL;
const trainerPassword = process.env.SUPABASE_TEST_TRAINER_PASSWORD;
const adminEmail = process.env.SUPABASE_TEST_ADMIN_EMAIL;
const adminPassword = process.env.SUPABASE_TEST_ADMIN_PASSWORD;

const isLocal = (() => {
  if (!url) return false;
  try {
    return ["127.0.0.1", "localhost"].includes(new URL(url).hostname);
  } catch {
    return false;
  }
})();

const configured = Boolean(
  isLocal &&
    anonKey &&
    serviceRoleKey &&
    participantEmail &&
    participantPassword &&
    trainerEmail &&
    trainerPassword &&
    adminEmail &&
    adminPassword,
);

const service = configured
  ? createClient(url!, serviceRoleKey!, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;
const createdProjectIds: string[] = [];
const createdUserIds: string[] = [];

async function signIn(email: string, password: string) {
  const client = createClient(url!, anonKey!, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  expect(error).toBeNull();
  expect(data.user).toBeTruthy();
  return { client, user: data.user! };
}

async function createTemporaryUser(role: "participant" | "trainer") {
  const suffix = crypto.randomUUID();
  const password = "Temporary123!";
  const { data, error } = await service!.auth.admin.createUser({
    email: `${role}.${suffix}@scopusready.test`,
    password,
    email_confirm: true,
    user_metadata: { full_name: `Temporary ${role}` },
  });
  expect(error).toBeNull();
  expect(data.user).toBeTruthy();
  const user = data.user as User;
  createdUserIds.push(user.id);

  const { error: profileError } = await service!
    .from("profiles")
    .update({ role })
    .eq("id", user.id);
  expect(profileError).toBeNull();
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

describe.skipIf(!configured)("project persistence and RLS", () => {
  it("persists a project and exposes it only to its owner, assigned trainer, and admin", async () => {
    const { client: participant, user: participantUser } = await signIn(participantEmail!, participantPassword!);
    const { data: membership, error: membershipError } = await participant
      .from("class_members")
      .select("class_id")
      .eq("user_id", participantUser.id)
      .eq("member_role", "participant")
      .single();
    expect(membershipError).toBeNull();
    expect(membership?.class_id).toBeTruthy();

    const title = `Integration Project ${crypto.randomUUID()}`;
    const { data: project, error: createError } = await participant
      .from("projects")
      .insert({
        owner_id: participantUser.id,
        class_id: membership!.class_id,
        title,
        field: "Pendidikan",
        research_stage: "idea",
        status: "active",
      })
      .select("id,owner_id,class_id,title")
      .single();
    expect(createError).toBeNull();
    expect(project?.id).toBeTruthy();
    createdProjectIds.push(project!.id);

    const { error: invalidTitleError } = await participant.from("projects").insert({
      owner_id: participantUser.id,
      class_id: membership!.class_id,
      title: "x",
      research_stage: "idea",
      status: "active",
    });
    expect(invalidTitleError).not.toBeNull();
    await participant.auth.signOut();

    const { client: restoredParticipant } = await signIn(participantEmail!, participantPassword!);
    const { data: restored, error: restoreError } = await restoredParticipant
      .from("projects")
      .select("id,title")
      .eq("id", project!.id)
      .single();
    expect(restoreError).toBeNull();
    expect(restored?.title).toBe(title);

    const { client: assignedTrainer } = await signIn(trainerEmail!, trainerPassword!);
    const { data: trainerProject, error: trainerError } = await assignedTrainer
      .from("projects")
      .select("id")
      .eq("id", project!.id)
      .single();
    expect(trainerError).toBeNull();
    expect(trainerProject?.id).toBe(project!.id);

    const outsiderParticipantCredentials = await createTemporaryUser("participant");
    const { client: outsiderParticipant, user: outsiderUser } = await signIn(
      outsiderParticipantCredentials.email,
      outsiderParticipantCredentials.password,
    );
    const { data: outsiderRead, error: outsiderReadError } = await outsiderParticipant
      .from("projects")
      .select("id")
      .eq("id", project!.id);
    expect(outsiderReadError).toBeNull();
    expect(outsiderRead).toEqual([]);

    const { error: foreignClassCreateError } = await outsiderParticipant.from("projects").insert({
      owner_id: outsiderUser.id,
      class_id: membership!.class_id,
      title: "Proyek dengan kelas yang bukan haknya",
      research_stage: "idea",
      status: "active",
    });
    expect(foreignClassCreateError).not.toBeNull();

    const outsiderTrainerCredentials = await createTemporaryUser("trainer");
    const { client: outsiderTrainer } = await signIn(
      outsiderTrainerCredentials.email,
      outsiderTrainerCredentials.password,
    );
    const { data: unrelatedTrainerRead, error: unrelatedTrainerError } = await outsiderTrainer
      .from("projects")
      .select("id")
      .eq("id", project!.id);
    expect(unrelatedTrainerError).toBeNull();
    expect(unrelatedTrainerRead).toEqual([]);

    const { client: admin } = await signIn(adminEmail!, adminPassword!);
    const { data: adminProject, error: adminError } = await admin
      .from("projects")
      .select("id")
      .eq("id", project!.id)
      .single();
    expect(adminError).toBeNull();
    expect(adminProject?.id).toBe(project!.id);
  });
});
