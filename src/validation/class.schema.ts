import { z } from "zod";

export const createClassSchema = z
  .object({
    name: z.string().trim().min(3, "Nama kelas minimal 3 karakter.").max(200),
    code: z
      .string()
      .trim()
      .min(3, "Kode minimal 3 karakter.")
      .max(50)
      .regex(/^[A-Za-z0-9-]+$/, "Kode hanya boleh huruf, angka, dan tanda hubung."),
    trainerId: z.string().uuid().optional().or(z.literal("")),
    startDate: z.string().optional().or(z.literal("")),
    endDate: z.string().optional().or(z.literal("")),
    price: z.coerce.number().int().min(0, "Harga tidak boleh negatif.").optional(),
  })
  .refine((data) => !data.startDate || !data.endDate || data.startDate <= data.endDate, {
    message: "Tanggal mulai harus sebelum atau sama dengan tanggal selesai.",
    path: ["endDate"],
  });

export const joinClassSchema = z.object({
  code: z.string().trim().min(3, "Kode kelas tidak valid.").max(50),
});
