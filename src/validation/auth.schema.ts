import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Masukkan alamat email yang valid."),
  password: z.string().min(8, "Password minimal 8 karakter."),
});
export const registerSchema = loginSchema.extend({
  fullName: z.string().trim().min(2, "Nama minimal 2 karakter.").max(120),
  classCode: z.string().trim().max(40).optional(),
});
