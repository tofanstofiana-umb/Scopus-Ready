import { createClient } from "@supabase/supabase-js";
import { afterEach, describe, expect, it } from "vitest";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const participantEmail = process.env.SUPABASE_TEST_PARTICIPANT_EMAIL;
const participantPassword = process.env.SUPABASE_TEST_PARTICIPANT_PASSWORD;

const isLocal = (() => {
  if (!url) return false;
  try {
    return ["127.0.0.1", "localhost"].includes(new URL(url).hostname);
  } catch {
    return false;
  }
})();
const configured = Boolean(isLocal && anonKey && serviceRoleKey && participantEmail && participantPassword);
const service = configured
  ? createClient(url!, serviceRoleKey!, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;
const createdProjectIds: string[] = [];

function newClient() {
  return createClient(url!, anonKey!, {
    auth: { autoRefreshToken: false, persistSession: false, storageKey: `sprint14-${crypto.randomUUID()}` },
  });
}

afterEach(async () => {
  if (!service) return;
  for (const projectId of createdProjectIds.splice(0)) {
    await service.from("projects").delete().eq("id", projectId);
  }
});

describe.skipIf(!configured)("Sprint 14 Journal Adaptation and Submission Checklist", () => {
  it("persists adaptation and derives submission completion from exact booleans", async () => {
    const owner = newClient();
    const { data: auth, error: authError } = await owner.auth.signInWithPassword({
      email: participantEmail!,
      password: participantPassword!,
    });
    expect(authError).toBeNull();

    const { data: membership, error: membershipError } = await owner
      .from("class_members")
      .select("class_id")
      .eq("user_id", auth.user!.id)
      .eq("member_role", "participant")
      .single();
    expect(membershipError).toBeNull();

    const { data: project, error: projectError } = await owner
      .from("projects")
      .insert({
        owner_id: auth.user!.id,
        class_id: membership!.class_id,
        title: `Sprint 14 Integration ${crypto.randomUUID()}`,
        research_stage: "journal_targeting",
        status: "active",
      })
      .select("id")
      .single();
    expect(projectError).toBeNull();
    createdProjectIds.push(project!.id);

    const adaptation = {
      author_guidelines: "IMRaD, maksimal 7.000 kata, dan blind review.",
      title_abstract_keywords: "Judul dipadatkan dan kata kunci diselaraskan dengan scope.",
      structure_word_limit: "Pendahuluan dan pembahasan dipadatkan sesuai batas kata.",
      citations_references: "Sitasi, referensi, tabel, dan gambar mengikuti gaya jurnal.",
      submission_package: "Manuskrip, title page, cover letter, dan deklarasi tersedia.",
    };
    const { data: adapted, error: adaptationError } = await owner.rpc("save_structured_worksheet", {
      target_project_id: project!.id,
      target_module_code: "journal_adaptation",
      target_content: adaptation,
      last_known_updated_at: null,
    });
    expect(adaptationError).toBeNull();
    expect(adapted?.completion_percent).toBe(100);
    expect(adapted?.status).toBe("in_progress");

    const partialChecklist = {
      manuscript_file_ready: true,
      journal_format_confirmed: true,
      metadata_complete: true,
      ethics_and_declarations_complete: true,
      supplementary_files_ready: false,
    };
    const { data: partial, error: partialError } = await owner.rpc("save_structured_worksheet", {
      target_project_id: project!.id,
      target_module_code: "submission",
      target_content: partialChecklist,
      last_known_updated_at: null,
    });
    expect(partialError).toBeNull();
    expect(partial?.completion_percent).toBe(80);
    expect(partial?.status).toBe("in_progress");

    const { data: complete, error: completeError } = await owner.rpc("save_structured_worksheet", {
      target_project_id: project!.id,
      target_module_code: "submission",
      target_content: { ...partialChecklist, supplementary_files_ready: true },
      last_known_updated_at: partial!.updated_at,
    });
    expect(completeError).toBeNull();
    expect(complete?.completion_percent).toBe(100);
    expect(complete?.status).toBe("completed");

    const { error: invalidTypeError } = await owner.rpc("save_structured_worksheet", {
      target_project_id: project!.id,
      target_module_code: "submission",
      target_content: { ...partialChecklist, supplementary_files_ready: "yes" },
      last_known_updated_at: complete!.updated_at,
    });
    expect(invalidTypeError?.message).toContain("INVALID_CONTENT");

    const { data: reopened, error: reopenError } = await owner.rpc("save_structured_worksheet", {
      target_project_id: project!.id,
      target_module_code: "submission",
      target_content: partialChecklist,
      last_known_updated_at: complete!.updated_at,
    });
    expect(reopenError).toBeNull();
    expect(reopened?.completion_percent).toBe(80);
    expect(reopened?.status).toBe("in_progress");
  });
});
