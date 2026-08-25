import "server-only";

import { calculateProjectProgress } from "@/domain/progress/progress";
import { calculateScopusReadyScore, type ScopusReadyScore } from "@/domain/scoring/score";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { projectIdSchema } from "@/validation/project.schema";
import type { WorksheetStatus } from "@/types/worksheet";
import { requireIdentity } from "./auth.service";

export interface ProjectModuleMetric {
  id: string;
  code: string;
  name: string;
  sequence: number;
  status: WorksheetStatus;
}

export interface ProjectMetrics {
  progress: number;
  modules: ProjectModuleMetric[];
  score: ScopusReadyScore;
}

export async function getProjectsMetrics(projectIds: string[]): Promise<Map<string, ProjectMetrics>> {
  await requireIdentity(["participant", "trainer", "admin"]);
  const validProjectIds = [...new Set(projectIds.filter((id) => projectIdSchema.safeParse(id).success))];
  if (validProjectIds.length === 0) return new Map();

  const supabase = await createSupabaseServerClient();
  const [modulesResult, answersResult, assessmentsResult] = await Promise.all([
    supabase.from("worksheet_modules").select("id,code,name,sequence").order("sequence"),
    supabase.from("worksheet_answers").select("project_id,module_id,status").in("project_id", validProjectIds),
    supabase.from("assessments").select("project_id,dimension,score,max_score,updated_at").in("project_id", validProjectIds).order("updated_at", { ascending: false }),
  ]);
  if (modulesResult.error) throw modulesResult.error;
  if (answersResult.error) throw answersResult.error;
  if (assessmentsResult.error) throw assessmentsResult.error;

  const modules = modulesResult.data ?? [];
  const answers = answersResult.data ?? [];
  const assessments = assessmentsResult.data ?? [];
  const metrics = new Map<string, ProjectMetrics>();

  for (const projectId of validProjectIds) {
    const answerByModule = new Map(
      answers.filter((answer) => answer.project_id === projectId).map((answer) => [answer.module_id, answer]),
    );
    const projectModules = modules.map((module) => ({
      ...module,
      status: (answerByModule.get(module.id)?.status ?? "not_started") as WorksheetStatus,
    }));
    const latestAssessments = new Map<string, { dimension: string; score: number; maxScore: number }>();
    for (const assessment of assessments.filter((item) => item.project_id === projectId)) {
      if (!latestAssessments.has(assessment.dimension)) {
        latestAssessments.set(assessment.dimension, {
          dimension: assessment.dimension,
          score: Number(assessment.score),
          maxScore: Number(assessment.max_score),
        });
      }
    }
    metrics.set(projectId, {
      progress: calculateProjectProgress(projectModules),
      modules: projectModules,
      score: calculateScopusReadyScore([...latestAssessments.values()]),
    });
  }

  return metrics;
}

export async function getProjectMetrics(projectId: string): Promise<ProjectMetrics | null> {
  if (!projectIdSchema.safeParse(projectId).success) return null;
  return (await getProjectsMetrics([projectId])).get(projectId) ?? null;
}
