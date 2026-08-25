import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireIdentity } from "./auth.service";
import type { Project, ProjectClassOption } from "@/types/project";
import type { z } from "zod";
import { projectIdSchema, type createProjectSchema } from "@/validation/project.schema";

type CreateProjectInput = z.infer<typeof createProjectSchema>;
const projectFields = "id,owner_id,class_id,title,field,research_stage,status,created_at,updated_at";

export class ProjectClassAccessError extends Error {
  constructor() {
    super("Kelas tidak aktif atau Anda bukan peserta kelas tersebut.");
    this.name = "ProjectClassAccessError";
  }
}

export async function getUserProjects(): Promise<Project[]> {
  const { profile } = await requireIdentity(["participant", "trainer", "admin"]);
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("projects")
    .select(projectFields)
    .eq("status", "active")
    .order("updated_at", { ascending: false });
  if (profile.role === "participant") query = query.eq("owner_id", profile.id);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Project[];
}

export async function getProject(projectId: string): Promise<Project | null> {
  if (!projectIdSchema.safeParse(projectId).success) return null;
  await requireIdentity(["participant", "trainer", "admin"]);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("projects")
    .select(projectFields)
    .eq("id", projectId)
    .maybeSingle();
  if (error) throw error;
  return data as Project | null;
}

export async function getParticipantProjectClasses(): Promise<ProjectClassOption[]> {
  const { profile } = await requireIdentity(["participant"]);
  const supabase = await createSupabaseServerClient();
  const { data: memberships, error: membershipError } = await supabase
    .from("class_members")
    .select("class_id")
    .eq("user_id", profile.id)
    .eq("member_role", "participant");
  if (membershipError) throw membershipError;

  const classIds = (memberships ?? []).map((membership) => membership.class_id);
  if (classIds.length === 0) return [];

  const { data, error } = await supabase
    .from("classes")
    .select("id,name,code")
    .in("id", classIds)
    .eq("status", "active")
    .order("name");
  if (error) throw error;
  return (data ?? []) as ProjectClassOption[];
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const { profile } = await requireIdentity(["participant"]);
  const supabase = await createSupabaseServerClient();

  if (input.classId) {
    const { data: membership, error: membershipError } = await supabase
      .from("class_members")
      .select("class_id")
      .eq("class_id", input.classId)
      .eq("user_id", profile.id)
      .eq("member_role", "participant")
      .maybeSingle();
    if (membershipError) throw membershipError;

    const { data: activeClass, error: classError } = await supabase
      .from("classes")
      .select("id")
      .eq("id", input.classId)
      .eq("status", "active")
      .maybeSingle();
    if (classError) throw classError;
    if (!membership || !activeClass) throw new ProjectClassAccessError();
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({
      owner_id: profile.id,
      class_id: input.classId || null,
      title: input.title,
      field: input.field || null,
      research_stage: input.researchStage,
      status: "active",
    })
    .select(projectFields)
    .single();
  if (error) throw error;
  return data as Project;
}
