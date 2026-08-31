import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireIdentity } from "./auth.service";
import { groupResourcesByModule } from "@/domain/library/group-resources";
import type { LibraryModuleGroup, LibraryResource } from "@/types/library";
import type { z } from "zod";
import type { upsertLibraryResourceSchema } from "@/validation/library.schema";

type UpsertLibraryResourceInput = z.infer<typeof upsertLibraryResourceSchema>;

const fields = "id,module_id,category,title,description,body,url,sequence,is_published,created_at,updated_at";

export async function getPublishedLibraryResources(): Promise<LibraryModuleGroup[]> {
  await requireIdentity(["participant", "trainer", "admin"]);
  const supabase = await createSupabaseServerClient();
  const [{ data: resources, error }, { data: modules, error: moduleError }] = await Promise.all([
    supabase.from("library_resources").select(fields).eq("is_published", true).order("sequence"),
    supabase.from("worksheet_modules").select("id,name,sequence").order("sequence"),
  ]);
  if (error) throw error;
  if (moduleError) throw moduleError;
  return groupResourcesByModule((resources ?? []) as LibraryResource[], modules ?? []);
}

export async function getAllLibraryResourcesForAdmin(): Promise<LibraryModuleGroup[]> {
  await requireIdentity(["admin"]);
  const supabase = await createSupabaseServerClient();
  const [{ data: resources, error }, { data: modules, error: moduleError }] = await Promise.all([
    supabase.from("library_resources").select(fields).order("sequence"),
    supabase.from("worksheet_modules").select("id,name,sequence").order("sequence"),
  ]);
  if (error) throw error;
  if (moduleError) throw moduleError;
  return groupResourcesByModule((resources ?? []) as LibraryResource[], modules ?? []);
}

export async function upsertLibraryResource(input: UpsertLibraryResourceInput): Promise<void> {
  await requireIdentity(["admin"]);
  const supabase = await createSupabaseServerClient();
  const payload = {
    module_id: input.moduleId || null,
    category: input.category,
    title: input.title,
    description: input.description,
    body: input.body || null,
    url: input.url || null,
    sequence: input.sequence ?? 0,
    is_published: input.status === "published",
  };
  const { error } = input.id
    ? await supabase.from("library_resources").update(payload).eq("id", input.id)
    : await supabase.from("library_resources").insert(payload);
  if (error) throw error;
}

export async function deleteLibraryResource(id: string): Promise<void> {
  await requireIdentity(["admin"]);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("library_resources").delete().eq("id", id);
  if (error) throw error;
}
