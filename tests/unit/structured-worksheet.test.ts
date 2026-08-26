import { describe, expect, it } from "vitest";
import {
  createEmptyStructuredContent,
  isStructuredWorksheetCode,
  structuredWorksheets,
} from "@/domain/worksheets/structured-worksheets";
import { saveStructuredWorksheetSchema } from "@/validation/structured-worksheet.schema";

const projectId = "2f29b16e-cd44-4a7e-9a84-a358902794e8";

describe("structured worksheet definitions and validation", () => {
  it("provides exactly five empty fields for each active module", () => {
    for (const code of ["literature", "gap", "novelty", "blueprint", "method", "scientific_story", "internal_review", "journal_adaptation"] as const) {
      expect(structuredWorksheets[code].fields).toHaveLength(5);
      expect(Object.keys(createEmptyStructuredContent(code))).toHaveLength(5);
      expect(Object.values(createEmptyStructuredContent(code))).toEqual(["", "", "", "", ""]);
    }
  });

  it("accepts every supported structured module code", () => {
    expect(isStructuredWorksheetCode("literature")).toBe(true);
    expect(isStructuredWorksheetCode("gap")).toBe(true);
    expect(isStructuredWorksheetCode("novelty")).toBe(true);
    expect(isStructuredWorksheetCode("blueprint")).toBe(true);
    expect(isStructuredWorksheetCode("method")).toBe(true);
    expect(isStructuredWorksheetCode("scientific_story")).toBe(true);
    expect(isStructuredWorksheetCode("internal_review")).toBe(true);
    expect(isStructuredWorksheetCode("journal_adaptation")).toBe(true);
    expect(isStructuredWorksheetCode("submission")).toBe(true);
    expect(isStructuredWorksheetCode("problem")).toBe(false);
  });

  it("accepts an exact valid payload", () => {
    const result = saveStructuredWorksheetSchema.safeParse({
      projectId,
      moduleCode: "literature",
      content: createEmptyStructuredContent("literature"),
      lastKnownUpdatedAt: "2026-08-26T01:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing, additional, and oversized fields", () => {
    const content = createEmptyStructuredContent("gap");
    delete content.research_gap;
    content.injected = "not allowed";
    content.consequence = "x".repeat(2001);
    const result = saveStructuredWorksheetSchema.safeParse({ projectId, moduleCode: "gap", content });
    expect(result.success).toBe(false);
  });

  it("enforces the shorter title and novelty statement limits", () => {
    const blueprint = createEmptyStructuredContent("blueprint");
    blueprint.working_title = "x".repeat(501);
    expect(saveStructuredWorksheetSchema.safeParse({ projectId, moduleCode: "blueprint", content: blueprint }).success).toBe(false);

    const novelty = createEmptyStructuredContent("novelty");
    novelty.novelty_statement = "x".repeat(1501);
    expect(saveStructuredWorksheetSchema.safeParse({ projectId, moduleCode: "novelty", content: novelty }).success).toBe(false);
  });

  it("enforces Method Fit and Scientific Story field limits", () => {
    const method = createEmptyStructuredContent("method");
    method.research_design = "x".repeat(1501);
    expect(saveStructuredWorksheetSchema.safeParse({ projectId, moduleCode: "method", content: method }).success).toBe(false);

    const story = createEmptyStructuredContent("scientific_story");
    story.take_home_message = "x".repeat(1001);
    expect(saveStructuredWorksheetSchema.safeParse({ projectId, moduleCode: "scientific_story", content: story }).success).toBe(false);
  });

  it("enforces the Internal Review submission readiness limit", () => {
    const review = createEmptyStructuredContent("internal_review");
    review.submission_readiness = "x".repeat(1501);
    expect(saveStructuredWorksheetSchema.safeParse({ projectId, moduleCode: "internal_review", content: review }).success).toBe(false);
  });

  it("enforces Journal Adaptation limits and creates a boolean Submission Checklist", () => {
    const adaptation = createEmptyStructuredContent("journal_adaptation");
    adaptation.submission_package = "x".repeat(1501);
    expect(saveStructuredWorksheetSchema.safeParse({ projectId, moduleCode: "journal_adaptation", content: adaptation }).success).toBe(false);

    const checklist = createEmptyStructuredContent("submission");
    expect(Object.keys(checklist)).toHaveLength(5);
    expect(Object.values(checklist)).toEqual([false, false, false, false, false]);
    expect(saveStructuredWorksheetSchema.safeParse({ projectId, moduleCode: "submission", content: checklist }).success).toBe(true);
    checklist.manuscript_file_ready = "yes";
    expect(saveStructuredWorksheetSchema.safeParse({ projectId, moduleCode: "submission", content: checklist }).success).toBe(false);
  });
});
