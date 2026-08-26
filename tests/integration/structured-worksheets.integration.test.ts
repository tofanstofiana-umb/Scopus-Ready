import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
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
    auth: { autoRefreshToken: false, persistSession: false, storageKey: `structured-test-${crypto.randomUUID()}` },
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
    email: `structured.${crypto.randomUUID()}@scopusready.test`,
    password,
    email_confirm: true,
    user_metadata: { full_name: "Structured Outsider" },
  });
  expect(error).toBeNull();
  const user = data.user as User;
  createdUserIds.push(user.id);
  return { email: user.email!, password };
}

async function saveWorksheet(
  client: SupabaseClient,
  projectId: string,
  moduleCode: "literature" | "gap" | "novelty" | "blueprint",
  content: Record<string, string>,
  updatedAt: string | null,
) {
  return client.rpc("save_structured_worksheet", {
    target_project_id: projectId,
    target_module_code: moduleCode,
    target_content: content,
    last_known_updated_at: updatedAt,
  });
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

describe.skipIf(!configured)("Literature Map and Gap Detector persistence and RLS", () => {
  it("persists both worksheets and enforces owner-only writes", async () => {
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
        title: `Structured Integration ${crypto.randomUUID()}`,
        research_stage: "idea",
        status: "active",
      })
      .select("id")
      .single();
    expect(projectError).toBeNull();
    createdProjectIds.push(project!.id);

    const literature = {
      key_findings: "Temuan utama telah dipetakan.",
      theories: "Teori A dan kerangka B.",
      methods: "Survei dan studi longitudinal.",
      contexts: "Perguruan tinggi di Asia Tenggara.",
      limitations: "Sampel dan periode observasi terbatas.",
    };
    const gap = {
      established_knowledge: "Hubungan utama telah diketahui.",
      inconsistency: "Arah pengaruh belum konsisten.",
      underexplored_area: "Konteks institusi kecil belum diteliti.",
      consequence: "Generalisasi teori masih terbatas.",
      research_gap: "Belum ada pengujian longitudinal pada konteks tersebut.",
    };

    const { data: literatureSave, error: literatureError } = await saveWorksheet(
      owner, project!.id, "literature", literature, null,
    );
    expect(literatureError).toBeNull();
    expect(literatureSave?.completion_percent).toBe(100);

    const { data: gapSave, error: gapError } = await saveWorksheet(owner, project!.id, "gap", gap, null);
    expect(gapError).toBeNull();
    expect(gapSave?.content).toEqual(gap);

    const { error: invalidError } = await saveWorksheet(
      owner,
      project!.id,
      "literature",
      { ...literature, injected: "not allowed" },
      literatureSave!.updated_at,
    );
    expect(invalidError?.message).toContain("INVALID_CONTENT");

    const revisedLiterature = { ...literature, key_findings: "Temuan utama diperbarui." };
    const { data: revisedSave, error: revisedError } = await saveWorksheet(
      owner, project!.id, "literature", revisedLiterature, literatureSave!.updated_at,
    );
    expect(revisedError).toBeNull();

    const { error: staleError } = await saveWorksheet(
      owner, project!.id, "literature", literature, literatureSave!.updated_at,
    );
    expect(staleError?.message).toContain("VERSION_CONFLICT");
    await owner.auth.signOut();

    const { client: restoredOwner } = await signIn(participantEmail!, participantPassword!);
    const { data: restored, error: restoreError } = await restoredOwner
      .from("worksheet_answers")
      .select("content")
      .in("id", [revisedSave!.id, gapSave!.id]);
    expect(restoreError).toBeNull();
    expect(restored).toHaveLength(2);
    expect(restored?.some((answer) => answer.content.key_findings === "Temuan utama diperbarui.")).toBe(true);
    expect(restored?.some((answer) => answer.content.research_gap === gap.research_gap)).toBe(true);

    const { client: trainer } = await signIn(trainerEmail!, trainerPassword!);
    const { data: trainerRead, error: trainerReadError } = await trainer
      .from("worksheet_answers")
      .select("id")
      .in("id", [revisedSave!.id, gapSave!.id]);
    expect(trainerReadError).toBeNull();
    expect(trainerRead).toHaveLength(2);
    const { error: trainerWriteError } = await saveWorksheet(
      trainer, project!.id, "gap", gap, gapSave!.updated_at,
    );
    expect(trainerWriteError?.message).toContain("ACCESS_DENIED");

    const outsiderCredentials = await createTemporaryParticipant();
    const { client: outsider } = await signIn(outsiderCredentials.email, outsiderCredentials.password);
    const { data: outsiderRead, error: outsiderReadError } = await outsider
      .from("worksheet_answers")
      .select("id")
      .eq("id", gapSave!.id);
    expect(outsiderReadError).toBeNull();
    expect(outsiderRead).toEqual([]);
    const { error: outsiderWriteError } = await saveWorksheet(
      outsider, project!.id, "gap", gap, gapSave!.updated_at,
    );
    expect(outsiderWriteError?.message).toContain("ACCESS_DENIED");
  });

  it("persists Novelty Builder and Article Blueprint with exact server validation", async () => {
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
        title: `Sprint 11 Integration ${crypto.randomUUID()}`,
        research_stage: "proposal",
        status: "active",
      })
      .select("id")
      .single();
    expect(projectError).toBeNull();
    createdProjectIds.push(project!.id);

    const novelty = {
      gap_basis: "Konteks institusi kecil belum teruji secara longitudinal.",
      difference: "Penelitian menggunakan desain longitudinal dan konteks berbeda.",
      new_contribution: "Model keterlibatan adaptif pada institusi kecil.",
      originality_evidence: "Pemetaan literatur tidak menemukan kombinasi tersebut.",
      novelty_statement: "Studi ini menawarkan model longitudinal yang kontekstual.",
    };
    const blueprint = {
      working_title: "Model Keterlibatan Adaptif pada Institusi Kecil",
      research_objective: "Menguji perubahan keterlibatan mahasiswa secara longitudinal.",
      article_structure: "Pendahuluan, metode, hasil, pembahasan, dan kesimpulan.",
      key_argument: "Pendampingan adaptif meningkatkan keterlibatan secara berkelanjutan.",
      evidence_plan: "Data tiga gelombang, model pertumbuhan, dan triangulasi wawancara.",
    };

    const { data: noveltySave, error: noveltyError } = await saveWorksheet(
      owner, project!.id, "novelty", novelty, null,
    );
    expect(noveltyError).toBeNull();
    expect(noveltySave?.completion_percent).toBe(100);

    const { data: blueprintSave, error: blueprintError } = await saveWorksheet(
      owner, project!.id, "blueprint", blueprint, null,
    );
    expect(blueprintError).toBeNull();
    expect(blueprintSave?.content).toEqual(blueprint);

    const { error: titleLimitError } = await saveWorksheet(
      owner,
      project!.id,
      "blueprint",
      { ...blueprint, working_title: "x".repeat(501) },
      blueprintSave!.updated_at,
    );
    expect(titleLimitError?.message).toContain("INVALID_CONTENT");
    await owner.auth.signOut();

    const { client: restoredOwner } = await signIn(participantEmail!, participantPassword!);
    const { data: restored, error: restoreError } = await restoredOwner
      .from("worksheet_answers")
      .select("id,content")
      .in("id", [noveltySave!.id, blueprintSave!.id]);
    expect(restoreError).toBeNull();
    expect(restored).toHaveLength(2);
    expect(restored?.some((answer) => answer.content.novelty_statement === novelty.novelty_statement)).toBe(true);
    expect(restored?.some((answer) => answer.content.working_title === blueprint.working_title)).toBe(true);

    const { client: trainer } = await signIn(trainerEmail!, trainerPassword!);
    const { data: trainerRead, error: trainerReadError } = await trainer
      .from("worksheet_answers")
      .select("id")
      .in("id", [noveltySave!.id, blueprintSave!.id]);
    expect(trainerReadError).toBeNull();
    expect(trainerRead).toHaveLength(2);
    const { error: trainerWriteError } = await saveWorksheet(
      trainer, project!.id, "novelty", novelty, noveltySave!.updated_at,
    );
    expect(trainerWriteError?.message).toContain("ACCESS_DENIED");
  });
});
