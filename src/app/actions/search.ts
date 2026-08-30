"use server";

import { accessErrorResult } from "@/domain/errors/access-errors";
import { requireIdentity } from "@/services/auth.service";
import { searchMyProjects, searchParticipants } from "@/services/search.service";
import type { ActionResult } from "@/types/auth";
import type { SearchResult } from "@/types/search";

export async function searchAction(query: string): Promise<ActionResult<SearchResult[]>> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return { ok: true, data: [] };

  try {
    const { profile } = await requireIdentity();
    const results: SearchResult[] = [...(await searchMyProjects(trimmed))];
    if (profile.role === "trainer" || profile.role === "admin") {
      results.push(...(await searchParticipants(trimmed)));
    }
    return { ok: true, data: results };
  } catch (error) {
    const accessError = accessErrorResult<SearchResult[]>(error);
    if (accessError) return accessError;
    console.error("search error", error instanceof Error ? error.message : "unknown");
    return { ok: false, code: "DATABASE", message: "Pencarian gagal." };
  }
}
