import { z } from "zod";
import { projectIdSchema } from "@/validation/project.schema";

export const problemBuilderContentSchema = z.object({
  topic: z.string().max(500),
  phenomenon: z.string().max(1500),
  problem: z.string().max(1500),
  evidence: z.string().max(2000),
  importance: z.string().max(1500),
}).strict();

export const saveProblemBuilderSchema = z.object({
  projectId: projectIdSchema,
  content: problemBuilderContentSchema,
  lastKnownUpdatedAt: z.string().datetime({ offset: true }).nullable().optional(),
});

export type ProblemBuilderInput = z.infer<typeof saveProblemBuilderSchema>;
