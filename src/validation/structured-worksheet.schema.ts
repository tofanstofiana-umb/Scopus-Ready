import { z } from "zod";
import { structuredWorksheets, type StructuredWorksheetCode } from "@/domain/worksheets/structured-worksheets";
import { projectIdSchema } from "@/validation/project.schema";

export function structuredWorksheetContentSchema(code: StructuredWorksheetCode) {
  const shape = Object.fromEntries(
    structuredWorksheets[code].fields.map((field) => [field.key, z.string().max(field.maxLength)]),
  ) as Record<string, z.ZodString>;
  return z.object(shape).strict();
}

export const saveStructuredWorksheetSchema = z.object({
  projectId: projectIdSchema,
  moduleCode: z.enum(["literature", "gap"]),
  content: z.record(z.string(), z.string()),
  lastKnownUpdatedAt: z.string().datetime({ offset: true }).nullable().optional(),
}).superRefine((input, context) => {
  const result = structuredWorksheetContentSchema(input.moduleCode).safeParse(input.content);
  if (!result.success) {
    for (const issue of result.error.issues) {
      context.addIssue({ ...issue, path: ["content", ...issue.path] });
    }
  }
});
