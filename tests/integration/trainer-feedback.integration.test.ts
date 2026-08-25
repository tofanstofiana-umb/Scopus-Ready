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
      storageKey: `trainer-feedback-test-${crypto.randomUUID()}`,
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

async function createTemporaryTrainer() {
  const password = "Temporary123!";
  const { data, error } = await service!.auth.admin.createUser({
    email: `trainer.${crypto.randomUUID()}@scopusready.test`,
    password,
    email_confirm: true,
    user_metadata: { full_name: "Outside Trainer" },
  });
  expect(error).toBeNull();
  expect(data.user).toBeTruthy();
  const user = data.user as User;
  createdUserIds.push(user.id);
  const { error: profileError } = await service!.from("profiles").update({ role: "trainer" }).eq("id", user.id);
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

describe.skipIf(!configured)("Trainer feedback persistence and RLS", () => {
  it("allows only the assigned trainer to review, comment, and resolve feedback", async () => {
    const { client: owner, user: ownerUser } = await signIn(participantEmail!, participantPassword!);
    const { data: membership, error: membershipError } = await owner
      .from("class_members")
      .select("class_id")
      .eq("user_id", ownerUser.id)
      .eq("member_role", "participant")
      .single();
    expect(membershipError).toBeNull();

    const createProjectWithAnswer = async (suffix: string) => {
      const { data: project, error: projectError } = await owner
        .from("projects")
        .insert({
          owner_id: ownerUser.id,
          class_id: membership!.class_id,
          title: `Feedback Integration ${suffix} ${crypto.randomUUID()}`,
          research_stage: "idea",
          status: "active",
        })
        .select("id")
        .single();
      expect(projectError).toBeNull();
      createdProjectIds.push(project!.id);
      const { data: answer, error: answerError } = await owner.rpc("save_problem_builder", {
        target_project_id: project!.id,
        target_content: {
          topic: "Pembelajaran digital",
          phenomenon: "Penggunaan platform meningkat.",
          problem: "Keterlibatan mahasiswa belum optimal.",
          evidence: "Data interaksi menunjukkan penurunan.",
          importance: "Keterlibatan memengaruhi hasil belajar.",
        },
        last_known_updated_at: null,
      });
      expect(answerError).toBeNull();
      return { project: project!, answer: answer! };
    };

    const primary = await createProjectWithAnswer("primary");
    const secondary = await createProjectWithAnswer("secondary");
    const { client: assignedTrainer, user: trainerUser } = await signIn(trainerEmail!, trainerPassword!);

    const { error: validAssessmentError } = await assignedTrainer.from("assessments").insert({
      project_id: primary.project.id,
      worksheet_answer_id: primary.answer.id,
      assessor_id: trainerUser.id,
      dimension: "problem",
      score: 7,
      max_score: 8,
    });
    expect(validAssessmentError).toBeNull();
    const { error: mismatchedAssessmentError } = await assignedTrainer.from("assessments").insert({
      project_id: primary.project.id,
      worksheet_answer_id: secondary.answer.id,
      assessor_id: trainerUser.id,
      dimension: "problem",
      score: 7,
      max_score: 8,
    });
    expect(mismatchedAssessmentError).not.toBeNull();

    const { error: directInsertError } = await assignedTrainer.from("feedback").insert({
      project_id: primary.project.id,
      worksheet_answer_id: primary.answer.id,
      trainer_id: primary.answer.id,
      comment: "Direct writes must stay disabled.",
      priority: "medium",
    });
    expect(directInsertError).not.toBeNull();

    const comment = "Perjelas hubungan antara bukti masalah dan dampaknya pada hasil belajar.";
    const { data: feedback, error: feedbackError } = await assignedTrainer.rpc("create_trainer_feedback", {
      target_project_id: primary.project.id,
      target_worksheet_answer_id: primary.answer.id,
      target_comment: comment,
      target_priority: "high",
    });
    expect(feedbackError).toBeNull();
    expect(feedback?.comment).toBe(comment);
    expect(feedback?.status).toBe("open");

    const { error: mismatchedTargetError } = await assignedTrainer.rpc("create_trainer_feedback", {
      target_project_id: primary.project.id,
      target_worksheet_answer_id: secondary.answer.id,
      target_comment: "This answer belongs to a different project.",
      target_priority: "medium",
    });
    expect(mismatchedTargetError?.message).toContain("INVALID_FEEDBACK_TARGET");

    const outsiderCredentials = await createTemporaryTrainer();
    const { client: outsider } = await signIn(outsiderCredentials.email, outsiderCredentials.password);
    const { error: outsiderError } = await outsider.rpc("create_trainer_feedback", {
      target_project_id: primary.project.id,
      target_worksheet_answer_id: primary.answer.id,
      target_comment: "An unrelated trainer must not create feedback.",
      target_priority: "medium",
    });
    expect(outsiderError?.message).toContain("INVALID_FEEDBACK_TARGET");

    const { data: participantFeedback, error: participantFeedbackError } = await owner
      .from("feedback")
      .select("id,comment,status")
      .eq("id", feedback!.id)
      .single();
    expect(participantFeedbackError).toBeNull();
    expect(participantFeedback?.comment).toBe(comment);

    const { data: revisedAnswer, error: revisedAnswerError } = await owner
      .from("worksheet_answers")
      .select("status")
      .eq("id", primary.answer.id)
      .single();
    expect(revisedAnswerError).toBeNull();
    expect(revisedAnswer?.status).toBe("needs_revision");

    const { error: addressedError } = await owner.rpc("mark_feedback_addressed", {
      target_feedback_id: feedback!.id,
    });
    expect(addressedError).toBeNull();

    const { error: resolvedError } = await assignedTrainer.rpc("resolve_trainer_feedback", {
      target_feedback_id: feedback!.id,
    });
    expect(resolvedError).toBeNull();
    const { data: resolvedFeedback, error: resolvedReadError } = await assignedTrainer
      .from("feedback")
      .select("status,resolved_at")
      .eq("id", feedback!.id)
      .single();
    expect(resolvedReadError).toBeNull();
    expect(resolvedFeedback?.status).toBe("resolved");
    expect(resolvedFeedback?.resolved_at).toBeTruthy();

    const { data: completedAnswer, error: completedAnswerError } = await owner
      .from("worksheet_answers")
      .select("status")
      .eq("id", primary.answer.id)
      .single();
    expect(completedAnswerError).toBeNull();
    expect(completedAnswer?.status).toBe("completed");
  });
});
