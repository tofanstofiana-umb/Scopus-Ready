import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const email = process.env.SUPABASE_TEST_PARTICIPANT_EMAIL;
const password = process.env.SUPABASE_TEST_PARTICIPANT_PASSWORD;
const trainerEmail = process.env.SUPABASE_TEST_TRAINER_EMAIL;
const trainerPassword = process.env.SUPABASE_TEST_TRAINER_PASSWORD;
const adminEmail = process.env.SUPABASE_TEST_ADMIN_EMAIL;
const adminPassword = process.env.SUPABASE_TEST_ADMIN_PASSWORD;
const configured = Boolean(
  url &&
    anonKey &&
    email &&
    password &&
    trainerEmail &&
    trainerPassword &&
    adminEmail &&
    adminPassword,
);

async function authenticatedClient(targetEmail: string, targetPassword: string) {
  const supabase = createClient(url!, anonKey!);
  const { data, error } = await supabase.auth.signInWithPassword({
    email: targetEmail,
    password: targetPassword,
  });
  expect(error).toBeNull();
  expect(data.user?.id).toBeTruthy();
  return { supabase, user: data.user! };
}

describe.skipIf(!configured)("Supabase persistence integration", () => {
  it("authenticates a participant and reads only RLS-permitted projects", async () => {
    const { supabase, user } = await authenticatedClient(email!, password!);

    const { data: projects, error } = await supabase.from("projects").select("id,owner_id");
    expect(error).toBeNull();
    expect((projects ?? []).every((project) => project.owner_id === user.id)).toBe(true);
    await supabase.auth.signOut();
  });

  it("recognizes participant, trainer, and admin profiles", async () => {
    const credentials = [
      { email: email!, password: password!, role: "participant" },
      { email: trainerEmail!, password: trainerPassword!, role: "trainer" },
      { email: adminEmail!, password: adminPassword!, role: "admin" },
    ];

    for (const credential of credentials) {
      const { supabase, user } = await authenticatedClient(credential.email, credential.password);
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("id,role")
        .eq("id", user.id)
        .single();
      expect(error).toBeNull();
      expect(profile?.role).toBe(credential.role);
      await supabase.auth.signOut();
    }
  });

  it("blocks participant role escalation and other-user profile reads", async () => {
    const { supabase, user } = await authenticatedClient(email!, password!);

    const { error: escalationError } = await supabase
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", user.id);
    expect(escalationError).not.toBeNull();

    const { data: trainerProfile, error: trainerReadError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", trainerEmail!)
      .maybeSingle();
    expect(trainerReadError).toBeNull();
    expect(trainerProfile).toBeNull();
    await supabase.auth.signOut();
  });

  it("lets the assigned trainer read class participants and admin read all profiles", async () => {
    const { supabase: trainerClient } = await authenticatedClient(trainerEmail!, trainerPassword!);
    const { data: participantProfile, error: participantError } = await trainerClient
      .from("profiles")
      .select("id")
      .eq("email", email!)
      .single();
    expect(participantError).toBeNull();
    expect(participantProfile?.id).toBeTruthy();
    await trainerClient.auth.signOut();

    const { supabase: adminClient } = await authenticatedClient(adminEmail!, adminPassword!);
    const { data: profiles, error: profilesError } = await adminClient
      .from("profiles")
      .select("id,role");
    expect(profilesError).toBeNull();
    expect(new Set((profiles ?? []).map((profile) => profile.role))).toEqual(
      new Set(["participant", "trainer", "admin"]),
    );
    await adminClient.auth.signOut();
  });
});
