import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireIdentity } from "./auth.service";
import { projectIdSchema } from "@/validation/project.schema";
import type { z } from "zod";
import type { createClassSchema } from "@/validation/class.schema";
import type { AdminClassSummary, AdminUserSummary, TrainerOption } from "@/types/class";

type CreateClassInput = z.infer<typeof createClassSchema>;

export async function getTrainerClasses() {
  const { profile } = await requireIdentity(["trainer", "admin"]);
  const supabase = await createSupabaseServerClient();
  let query = supabase.from("classes").select("id,name,code,status,start_date,end_date,trainer_id").order("created_at", { ascending: false });
  if (profile.role === "trainer") query = query.eq("trainer_id", profile.id);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getTrainerParticipants(classId: string) {
  if (!projectIdSchema.safeParse(classId).success) return [];
  await requireIdentity(["trainer", "admin"]);
  const supabase = await createSupabaseServerClient();
  const { data: members, error } = await supabase
    .from("class_members")
    .select("user_id, profile:profiles!class_members_user_id_fkey(id,full_name,email,institution)")
    .eq("class_id", classId)
    .eq("member_role", "participant");
  if (error) throw error;
  const userIds = (members ?? []).map((member) => member.user_id);
  if (userIds.length === 0) return [];
  const { data: projects, error: projectError } = await supabase.from("projects").select("id,owner_id,title,status,updated_at").eq("class_id", classId).in("owner_id", userIds).eq("status", "active");
  if (projectError) throw projectError;
  return (members ?? []).map((member) => ({ ...member, projects: (projects ?? []).filter((project) => project.owner_id === member.user_id) }));
}

export async function getTrainerClass(classId: string) {
  if (!projectIdSchema.safeParse(classId).success) return null;
  await requireIdentity(["trainer", "admin"]);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("classes").select("id,name,code,status,start_date,end_date,trainer_id").eq("id", classId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getAdminClassSummaries(): Promise<AdminClassSummary[]> {
  await requireIdentity(["admin"]);
  const supabase = await createSupabaseServerClient();

  const { data: classes, error } = await supabase
    .from("classes")
    .select("id,name,code,status,start_date,end_date,trainer_id,price")
    .order("created_at", { ascending: false });
  if (error) throw error;
  if (!classes || classes.length === 0) return [];

  const trainerIds = [...new Set(classes.map((c) => c.trainer_id).filter((id): id is string => Boolean(id)))];
  const [{ data: trainers, error: trainerError }, { data: members, error: memberError }] = await Promise.all([
    trainerIds.length > 0
      ? supabase.from("profiles").select("id,full_name").in("id", trainerIds)
      : Promise.resolve({ data: [], error: null }),
    supabase
      .from("class_members")
      .select("class_id")
      .eq("member_role", "participant")
      .in("class_id", classes.map((c) => c.id)),
  ]);
  if (trainerError) throw trainerError;
  if (memberError) throw memberError;

  const trainerNameById = new Map((trainers ?? []).map((t) => [t.id, t.full_name]));
  const participantCountByClass = new Map<string, number>();
  for (const member of members ?? []) {
    participantCountByClass.set(member.class_id, (participantCountByClass.get(member.class_id) ?? 0) + 1);
  }

  return classes.map((c) => ({
    ...c,
    trainerName: c.trainer_id ? trainerNameById.get(c.trainer_id) ?? null : null,
    participantCount: participantCountByClass.get(c.id) ?? 0,
  }));
}

export async function getTrainerOptions(): Promise<TrainerOption[]> {
  await requireIdentity(["admin"]);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("profiles").select("id,full_name,email").eq("role", "trainer").order("full_name");
  if (error) throw error;
  return data ?? [];
}

export async function getAdminUserSummaries(): Promise<AdminUserSummary[]> {
  await requireIdentity(["admin"]);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id,full_name,email,role,institution,created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createClass(input: CreateClassInput) {
  await requireIdentity(["admin"]);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("classes")
    .insert({
      name: input.name,
      code: input.code,
      trainer_id: input.trainerId || null,
      start_date: input.startDate || null,
      end_date: input.endDate || null,
      price: input.price ?? 0,
      // "draft" exists in the schema for a future publish workflow, but no
      // such workflow (or admin UI to promote a class out of it) exists yet
      // — join_class_by_code only matches status='active', so defaulting to
      // "draft" here made every class created through this form unjoinable.
      status: "active",
    })
    .select("id,name,code,status,start_date,end_date,trainer_id,price")
    .single();
  if (error) {
    if (error.code === "23505") throw new ClassCodeConflictError();
    throw error;
  }
  return data;
}

export class ClassCodeConflictError extends Error {
  constructor() {
    super("Kode kelas sudah digunakan. Gunakan kode lain.");
    this.name = "ClassCodeConflictError";
  }
}

export class InvalidClassCodeError extends Error {
  constructor() {
    super("Kode kelas tidak ditemukan atau kelas belum aktif.");
    this.name = "InvalidClassCodeError";
  }
}

export async function joinClassByCode(code: string): Promise<void> {
  await requireIdentity(["participant"]);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("join_class_by_code", { target_code: code });
  if (error) {
    if (error.message.includes("Class not found or inactive")) throw new InvalidClassCodeError();
    throw error;
  }
}
