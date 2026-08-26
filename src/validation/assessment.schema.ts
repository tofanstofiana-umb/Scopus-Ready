import { z } from "zod";
import { getRubricDefinition, SCOPUS_READY_RUBRIC, type RubricDimension } from "@/domain/scoring/score";
import { projectIdSchema } from "./project.schema";

const rubricDimensions = SCOPUS_READY_RUBRIC.map((item) => item.dimension) as [RubricDimension, ...RubricDimension[]];

export const assessmentItemSchema = z.object({
  dimension: z.enum(rubricDimensions),
  score: z.number().int("Nilai harus berupa bilangan bulat.").min(0, "Nilai minimal 0."),
  notes: z.string().trim().max(3000, "Catatan maksimal 3.000 karakter.").optional(),
}).superRefine((value, context) => {
  const rubric = getRubricDefinition(value.dimension);
  if (!rubric || value.score > rubric.maxScore) {
    context.addIssue({
      code: "custom",
      path: ["score"],
      message: `Nilai ${value.dimension} tidak boleh melebihi ${rubric?.maxScore ?? 0}.`,
    });
  }
});

export const assessmentBatchSchema = z.object({
  projectId: projectIdSchema,
  worksheetAnswerId: projectIdSchema,
  assessments: z.array(assessmentItemSchema).min(1, "Isi minimal satu dimensi penilaian.").max(10),
}).superRefine((value, context) => {
  const dimensions = value.assessments.map((item) => item.dimension);
  if (new Set(dimensions).size !== dimensions.length) {
    context.addIssue({ code: "custom", path: ["assessments"], message: "Dimensi penilaian tidak boleh duplikat." });
  }
});
