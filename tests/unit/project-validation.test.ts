import { describe, expect, it } from "vitest";
import { createProjectSchema, projectIdSchema } from "@/validation/project.schema";

describe("project validation", () => {
  it("accepts and trims a valid project", () => {
    const result = createProjectSchema.safeParse({
      title: "  Manuskrip Pendidikan Digital  ",
      field: "Pendidikan",
      researchStage: "idea",
      classId: "",
    });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.title).toBe("Manuskrip Pendidikan Digital");
  });

  it("rejects short titles, unknown stages, and invalid class identifiers", () => {
    expect(createProjectSchema.safeParse({ title: "Ide", researchStage: "idea" }).success).toBe(false);
    expect(createProjectSchema.safeParse({ title: "Judul valid", researchStage: "unknown" }).success).toBe(false);
    expect(createProjectSchema.safeParse({ title: "Judul valid", researchStage: "idea", classId: "not-a-uuid" }).success).toBe(false);
  });

  it("validates dynamic project route identifiers", () => {
    expect(projectIdSchema.safeParse("2f29b16e-cd44-4a7e-9a84-a358902794e8").success).toBe(true);
    expect(projectIdSchema.safeParse("project-orang-lain").success).toBe(false);
  });
});
