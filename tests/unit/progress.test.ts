import { describe, expect, it } from "vitest";
import { calculateProjectProgress, calculateWorksheetCompletion, determineWorksheetStatus } from "@/domain/progress/progress";

describe("worksheet progress", () => {
  it("returns 60 percent when three of five problem fields are filled", () => {
    expect(calculateWorksheetCompletion({ topic: "A", phenomenon: "B", problem: "C", evidence: "", importance: "" })).toBe(60);
  });

  it("ignores whitespace-only values", () => {
    expect(calculateWorksheetCompletion({ topic: "   ", phenomenon: "B" })).toBe(20);
  });

  it("derives deterministic worksheet statuses", () => {
    expect(determineWorksheetStatus({})).toBe("not_started");
    expect(determineWorksheetStatus({ topic: "A" })).toBe("in_progress");
    expect(determineWorksheetStatus({ topic: "A" }, true)).toBe("needs_revision");
    expect(determineWorksheetStatus({ topic: "A", phenomenon: "B", problem: "C", evidence: "D", importance: "E" }, false, true)).toBe("completed");
  });

  it("uses the official status weights across all modules", () => {
    expect(calculateProjectProgress([
      { status: "completed" },
      { status: "in_progress" },
      { status: "needs_revision" },
      { status: "not_started" },
    ])).toBe(56.3);
  });

  it("returns 33.3 percent when four of twelve modules are complete", () => {
    expect(calculateProjectProgress([
      ...Array.from({ length: 4 }, () => ({ status: "completed" as const })),
      ...Array.from({ length: 8 }, () => ({ status: "not_started" as const })),
    ])).toBe(33.3);
  });
});
