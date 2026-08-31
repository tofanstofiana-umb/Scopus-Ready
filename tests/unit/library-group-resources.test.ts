import { describe, expect, it } from "vitest";
import { groupResourcesByModule } from "@/domain/library/group-resources";
import type { LibraryModuleOption, LibraryResource } from "@/types/library";

function resource(overrides: Partial<LibraryResource>): LibraryResource {
  return {
    id: "r1",
    module_id: null,
    category: "bacaan",
    title: "Judul",
    description: "Deskripsi",
    body: null,
    url: null,
    sequence: 0,
    is_published: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

const modules: LibraryModuleOption[] = [
  { id: "m1", name: "Problem Builder", sequence: 1 },
  { id: "m2", name: "Literature Map", sequence: 2 },
];

describe("groupResourcesByModule", () => {
  it("orders module groups by sequence and sorts resources within a group", () => {
    const groups = groupResourcesByModule(
      [
        resource({ id: "a", module_id: "m2", sequence: 2 }),
        resource({ id: "b", module_id: "m1", sequence: 2 }),
        resource({ id: "c", module_id: "m1", sequence: 1 }),
      ],
      modules,
    );
    expect(groups.map((g) => g.moduleId)).toEqual(["m1", "m2"]);
    expect(groups[0].resources.map((r) => r.id)).toEqual(["c", "b"]);
  });

  it("puts module_id = null resources into a trailing 'Materi Pendukung' group", () => {
    const groups = groupResourcesByModule(
      [resource({ id: "a", module_id: "m1" }), resource({ id: "b", module_id: null })],
      modules,
    );
    expect(groups.at(-1)?.moduleId).toBeNull();
    expect(groups.at(-1)?.moduleName).toBe("Materi Pendukung");
    expect(groups.at(-1)?.resources.map((r) => r.id)).toEqual(["b"]);
  });

  it("omits modules with no resources instead of rendering empty sections", () => {
    const groups = groupResourcesByModule([resource({ id: "a", module_id: "m1" })], modules);
    expect(groups).toHaveLength(1);
    expect(groups[0].moduleId).toBe("m1");
  });

  it("returns an empty array when there is nothing to show", () => {
    expect(groupResourcesByModule([], modules)).toEqual([]);
  });
});
