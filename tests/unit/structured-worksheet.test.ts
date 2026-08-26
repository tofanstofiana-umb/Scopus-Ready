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
    for (const code of ["literature", "gap"] as const) {
      expect(structuredWorksheets[code].fields).toHaveLength(5);
      expect(Object.keys(createEmptyStructuredContent(code))).toHaveLength(5);
      expect(Object.values(createEmptyStructuredContent(code))).toEqual(["", "", "", "", ""]);
    }
  });

  it("accepts only the two supported module codes", () => {
    expect(isStructuredWorksheetCode("literature")).toBe(true);
    expect(isStructuredWorksheetCode("gap")).toBe(true);
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
});
