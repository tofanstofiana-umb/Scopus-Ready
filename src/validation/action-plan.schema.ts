import { z } from "zod";
import { projectIdSchema } from "./project.schema";

export const createActionTaskSchema = z.object({
  projectId: projectIdSchema,
  title: z.string().trim().min(3, "Judul tugas minimal 3 karakter.").max(300),
  description: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().max(2000).optional(),
  ),
  dueDate: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal target tidak valid.").optional(),
  ),
  priority: z.enum(["low", "medium", "high"]),
});

export const actionTaskStatusSchema = z.object({
  taskId: projectIdSchema,
  projectId: projectIdSchema,
  status: z.enum(["not_started", "in_progress", "completed"]),
});

export const deleteActionTaskSchema = z.object({
  taskId: projectIdSchema,
  projectId: projectIdSchema,
});
