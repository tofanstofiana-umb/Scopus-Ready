import { describe, expect, it } from "vitest";
import { calculateActionPlanProgress } from "@/domain/action-plan/progress";
import { calculateJournalFit, determineJournalFitLabel } from "@/domain/journals/journal-fit";
import { createActionTaskSchema } from "@/validation/action-plan.schema";
import { journalTargetSchema } from "@/validation/journal.schema";

const projectId = "2f29b16e-cd44-4a7e-9a84-a358902794e8";

describe("Sprint 8 planning domain", () => {
  it("calculates journal fit from four bounded ratings", () => {
    expect(calculateJournalFit({ scopeMatch: 5, articleTypeMatch: 4, audienceMatch: 3, requirementsMatch: 4 })).toBe(80);
    expect(calculateJournalFit({ scopeMatch: 9, articleTypeMatch: -2, audienceMatch: 5, requirementsMatch: Number.NaN })).toBe(50);
    expect(determineJournalFitLabel(80)).toBe("Sangat sesuai");
    expect(determineJournalFitLabel(59)).toBe("Pertimbangkan");
  });

  it("derives action plan progress only from completed tasks", () => {
    expect(calculateActionPlanProgress([])).toBe(0);
    expect(calculateActionPlanProgress(["completed", "in_progress", "not_started"])).toBe(33);
    expect(calculateActionPlanProgress(["completed", "completed"])).toBe(100);
  });

  it("validates journal ratings, URL, and task input", () => {
    const journal = {
      projectId,
      journalName: "Journal of Educational Technology",
      publisher: "Example Publisher",
      websiteUrl: "https://example.test/journal",
      quartile: "q1",
      scopeMatch: "5",
      articleTypeMatch: "4",
      audienceMatch: "4",
      requirementsMatch: "3",
      status: "primary",
      notes: "Scope sesuai.",
    };
    expect(journalTargetSchema.safeParse(journal).success).toBe(true);
    expect(journalTargetSchema.safeParse({ ...journal, websiteUrl: "javascript:alert(1)" }).success).toBe(false);
    expect(journalTargetSchema.safeParse({ ...journal, scopeMatch: 6 }).success).toBe(false);

    expect(createActionTaskSchema.safeParse({ projectId, title: "Perbaiki bukti", description: "", dueDate: "2026-09-01", priority: "high" }).success).toBe(true);
    expect(createActionTaskSchema.safeParse({ projectId, title: "x", dueDate: "01/09/2026", priority: "urgent" }).success).toBe(false);
  });
});
