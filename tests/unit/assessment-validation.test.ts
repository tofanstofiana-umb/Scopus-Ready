import { describe, expect, it } from "vitest";
import { assessmentBatchSchema } from "@/validation/assessment.schema";

const base = {
  projectId: "11111111-1111-4111-8111-111111111111",
  worksheetAnswerId: "22222222-2222-4222-8222-222222222222",
};

describe("assessment validation", () => {
  it("accepts official rubric scores", () => {
    expect(assessmentBatchSchema.safeParse({ ...base, assessments: [{ dimension: "problem", score: 8, notes: "Masalah jelas." }] }).success).toBe(true);
  });

  it("rejects scores above the official maximum", () => {
    expect(assessmentBatchSchema.safeParse({ ...base, assessments: [{ dimension: "problem", score: 9 }] }).success).toBe(false);
  });

  it("rejects duplicate dimensions and empty batches", () => {
    expect(assessmentBatchSchema.safeParse({ ...base, assessments: [] }).success).toBe(false);
    expect(assessmentBatchSchema.safeParse({ ...base, assessments: [{ dimension: "problem", score: 6 }, { dimension: "problem", score: 7 }] }).success).toBe(false);
  });
});
