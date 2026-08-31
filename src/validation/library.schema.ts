import { z } from "zod";

export const upsertLibraryResourceSchema = z.object({
  id: z.string().uuid().optional(),
  moduleId: z.string().uuid().optional().or(z.literal("")),
  category: z.enum(["bacaan", "video", "template", "rubrik", "prompt"]),
  title: z.string().trim().min(3, "Judul minimal 3 karakter.").max(200),
  description: z.string().trim().min(3, "Deskripsi minimal 3 karakter.").max(500),
  body: z.string().trim().max(20000).optional().or(z.literal("")),
  url: z.string().trim().url("URL tidak valid.").optional().or(z.literal("")),
  sequence: z.coerce.number().int().min(0).optional(),
  status: z.enum(["draft", "published"]),
});

export const deleteLibraryResourceSchema = z.object({
  id: z.string().uuid(),
});
