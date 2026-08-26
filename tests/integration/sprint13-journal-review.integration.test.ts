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

function newClient() {
  return createClient(url!, anonKey!, {
    auth: { autoRefreshToken: false, persistSession: false, storageKey: `sprint13-${crypto.randomUUID()}` },
  });
}

async function signIn(email: string, password: string) {
  const client = newClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  expect(error).toBeNull();
  expect(data.user).toBeTruthy();
  return { client, user: data.user! };
}

async function readModuleAnswer(client: ReturnType<typeof newClient>, projectId: string, code: string) {
  return client
    .from("worksheet_answers")
    .select("id,status,completion_percent,content,updated_at,worksheet_modules!inner(code)")
    .eq("project_id", projectId)
    .eq("worksheet_modules.code", code)
    .single();
}

afterEach(async () => {
  if (!service) return;
  for (const projectId of createdProjectIds.splice(0)) {
    await service.from("projects").delete().eq("id", projectId);
  }
});

describe.skipIf(!configured)("Sprint 13 Journal Target and Internal Review", () => {
  it("derives journal progress and requires trainer approval for Reviewer Gate", async () => {
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
        title: `Sprint 13 Integration ${crypto.randomUUID()}`,
        research_stage: "journal_targeting",
        status: "active",
      })
      .select("id")
      .single();
    expect(projectError).toBeNull();
    createdProjectIds.push(project!.id);

    const saveTarget = (name: string, status: "primary" | "backup") => owner.rpc("save_journal_target", {
      target_id: null,
      target_project_id: project!.id,
      target_journal_name: name,
      target_publisher: "SCOPUS READY Press",
      target_website_url: "https://example.test/journal",
      target_quartile: "q1",
      target_scope_match: 5,
      target_article_type_match: 5,
      target_audience_match: 5,
      target_requirements_match: 5,
      target_status: status,
      target_notes: "Dinilai melalui matrix resmi.",
    });

    const { data: primary, error: primaryError } = await saveTarget("Primary Journal", "primary");
    expect(primaryError).toBeNull();
    const { data: primaryOnly, error: primaryReadError } = await readModuleAnswer(owner, project!.id, "journal_target");
    expect(primaryReadError).toBeNull();
    expect(primaryOnly?.completion_percent).toBe(60);
    expect(primaryOnly?.status).toBe("in_progress");
    expect(primaryOnly?.content.primary_assessed).toBe(true);

    const { data: backup, error: backupError } = await saveTarget("Backup Journal", "backup");
    expect(backupError).toBeNull();
    const { data: completeMatrix, error: completeMatrixError } = await readModuleAnswer(owner, project!.id, "journal_target");
    expect(completeMatrixError).toBeNull();
    expect(completeMatrix?.completion_percent).toBe(100);
    expect(completeMatrix?.status).toBe("completed");
    expect(completeMatrix?.content.best_fit).toBe(100);

    const { error: unsupportedWriteError } = await owner.rpc("save_structured_worksheet", {
      target_project_id: project!.id,
      target_module_code: "journal_target",
      target_content: { injected: "manual progress is forbidden" },
      last_known_updated_at: completeMatrix!.updated_at,
    });
    expect(unsupportedWriteError?.message).toContain("UNSUPPORTED_MODULE");

    const { error: deleteBackupError } = await owner.rpc("delete_journal_target", { target_id: backup!.id });
    expect(deleteBackupError).toBeNull();
    const { data: reducedMatrix } = await readModuleAnswer(owner, project!.id, "journal_target");
    expect(reducedMatrix?.completion_percent).toBe(60);
    expect(reducedMatrix?.status).toBe("in_progress");
    expect(primary?.id).toBeTruthy();

    const reviewContent = {
      scope_alignment: "Scope, audiens, dan jenis artikel sesuai target utama.",
      argument_coherence: "Alur masalah hingga kesimpulan telah koheren.",
      evidence_quality: "Setiap klaim utama memiliki bukti dan referensi.",
      method_reporting: "Metode telah dilaporkan lengkap dan dapat direplikasi.",
      submission_readiness: "Pemeriksaan akhir format dan metadata telah selesai.",
    };
    const { data: review, error: reviewError } = await owner.rpc("save_structured_worksheet", {
      target_project_id: project!.id,
      target_module_code: "internal_review",
      target_content: reviewContent,
      last_known_updated_at: null,
    });
    expect(reviewError).toBeNull();
    expect(review?.completion_percent).toBe(100);
    expect(review?.status).toBe("in_progress");

    const { error: ownerApprovalError } = await owner.rpc("complete_internal_review", {
      target_project_id: project!.id,
    });
    expect(ownerApprovalError?.message).toContain("ACCESS_DENIED");

    const { client: trainer } = await signIn(trainerEmail!, trainerPassword!);
    const { data: approved, error: approvalError } = await trainer.rpc("complete_internal_review", {
      target_project_id: project!.id,
    });
    expect(approvalError).toBeNull();
    expect(approved?.status).toBe("completed");

    const { data: revisedReview, error: revisedReviewError } = await owner.rpc("save_structured_worksheet", {
      target_project_id: project!.id,
      target_module_code: "internal_review",
      target_content: { ...reviewContent, submission_readiness: "Perbaikan metadata sedang diverifikasi." },
      last_known_updated_at: approved!.updated_at,
    });
    expect(revisedReviewError).toBeNull();
    expect(revisedReview?.status).toBe("in_progress");

    const { data: feedback, error: feedbackError } = await trainer.rpc("create_trainer_feedback", {
      target_project_id: project!.id,
      target_worksheet_answer_id: review!.id,
      target_comment: "Pastikan metadata dan format akhir telah diverifikasi kembali.",
      target_priority: "high",
    });
    expect(feedbackError).toBeNull();
    const { error: blockedApprovalError } = await trainer.rpc("complete_internal_review", {
      target_project_id: project!.id,
    });
    expect(blockedApprovalError?.message).toContain("REVIEW_NOT_READY");

    const { error: addressedError } = await owner.rpc("mark_feedback_addressed", {
      target_feedback_id: feedback!.id,
    });
    expect(addressedError).toBeNull();
    const { error: resolvedError } = await trainer.rpc("resolve_trainer_feedback", {
      target_feedback_id: feedback!.id,
    });
    expect(resolvedError).toBeNull();

    const { data: completedReview, error: completedReviewError } = await readModuleAnswer(
      owner, project!.id, "internal_review",
    );
    expect(completedReviewError).toBeNull();
    expect(completedReview?.status).toBe("completed");
  });
});
