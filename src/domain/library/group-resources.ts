import type { LibraryModuleGroup, LibraryModuleOption, LibraryResource } from "@/types/library";

/**
 * Groups library resources by their workbook module, ordered by module
 * sequence. Resources with no module (module_id = null, "materi pendukung")
 * are collected into a single trailing group. Pure function — no DB access
 * — so it's testable on its own, same pattern as
 * src/domain/progress/notification-gate.ts.
 */
export function groupResourcesByModule(resources: LibraryResource[], modules: LibraryModuleOption[]): LibraryModuleGroup[] {
  const modulesBySequence = [...modules].sort((a, b) => a.sequence - b.sequence);
  const resourcesByModule = new Map<string, LibraryResource[]>();
  const unassigned: LibraryResource[] = [];

  for (const resource of resources) {
    if (!resource.module_id) {
      unassigned.push(resource);
      continue;
    }
    const bucket = resourcesByModule.get(resource.module_id) ?? [];
    bucket.push(resource);
    resourcesByModule.set(resource.module_id, bucket);
  }

  const sortBySequence = (a: LibraryResource, b: LibraryResource) => a.sequence - b.sequence;

  const groups: LibraryModuleGroup[] = modulesBySequence
    .map((module) => ({
      moduleId: module.id,
      moduleName: module.name,
      moduleSequence: module.sequence,
      resources: (resourcesByModule.get(module.id) ?? []).sort(sortBySequence),
    }))
    .filter((group) => group.resources.length > 0);

  if (unassigned.length > 0) {
    groups.push({
      moduleId: null,
      moduleName: "Materi Pendukung",
      moduleSequence: null,
      resources: unassigned.sort(sortBySequence),
    });
  }

  return groups;
}
