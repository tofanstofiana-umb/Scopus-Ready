import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireIdentity } from "./auth.service";
import type { ParticipantSearchResult, ProjectSearchResult } from "@/types/search";

export async function searchMyProjects(query: string): Promise<ProjectSearchResult[]> {
  const { profile } = await requireIdentity(["participant", "trainer", "admin"]);
  const supabase = await createSupabaseServerClient();
  let q = supabase.from("projects").select("id,title,owner_id").ilike("title", `%${query}%`).eq("status", "active").limit(10);
  if (profile.role === "participant") q = q.eq("owner_id", profile.id);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map((project) => ({ kind: "project" as const, id: project.id, title: project.title, href: `/projects/${project.id}` }));
}

export async function searchParticipants(query: string): Promise<ParticipantSearchResult[]> {
  const { profile } = await requireIdentity(["trainer", "admin"]);
  const supabase = await createSupabaseServerClient();
  // PostgREST's `.or()` filter DSL uses "," to separate conditions and "()"
  // for grouping — a query value containing either (e.g. an institution
  // name like "Universitas X, Fakultas Y") must be double-quoted, per
  // https://postgrest.org/en/stable/references/api/tables_views.html#operators,
  // with any literal double-quote/backslash in the value itself escaped.
  const escaped = query.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const pattern = `"%${escaped}%"`;
  const { data, error } = await supabase
    .from("profiles")
    .select("id,full_name,email,institution")
    .eq("role", "participant")
    .or(`full_name.ilike.${pattern},email.ilike.${pattern},institution.ilike.${pattern}`)
    .limit(10);
  if (error) throw error;
  // Trainer RLS already scopes this to shared-class participants; a precise
  // per-class deep link would need a self-join on class_members, so this
  // points to the role's participant overview instead of a specific class.
  const href = profile.role === "admin" ? "/admin#users" : "/trainer";
  return (data ?? []).map((participant) => ({
    kind: "participant" as const,
    id: participant.id,
    fullName: participant.full_name,
    email: participant.email,
    institution: participant.institution,
    href,
  }));
}
