import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireIdentity } from "./auth.service";

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
  await requireIdentity(["trainer", "admin"]);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("classes").select("id,name,code,status,start_date,end_date,trainer_id").eq("id", classId).maybeSingle();
  if (error) throw error;
  return data;
}
