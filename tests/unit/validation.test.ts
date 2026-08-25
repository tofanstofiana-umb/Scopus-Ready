import { describe, expect, it } from "vitest";
import {
  problemBuilderContentSchema,
  saveProblemBuilderSchema,
} from "@/validation/problem-builder.schema";

describe("Problem Builder validation", () => {
  it("accepts the five MVP fields", () => {
    expect(problemBuilderContentSchema.safeParse({ topic: "", phenomenon: "", problem: "", evidence: "", importance: "" }).success).toBe(true);
  });

  it("rejects oversized values and unknown content keys", () => {
    expect(problemBuilderContentSchema.safeParse({ topic: "", phenomenon: "", problem: "", evidence: "x".repeat(2001), importance: "" }).success).toBe(false);
    expect(problemBuilderContentSchema.safeParse({ topic: "", phenomenon: "", problem: "", evidence: "", importance: "", injected: "value" }).success).toBe(false);
  });

  it("validates project identifiers and concurrency timestamps", () => {
    const content = { topic: "", phenomenon: "", problem: "", evidence: "", importance: "" };
    expect(saveProblemBuilderSchema.safeParse({ projectId: "not-a-uuid", content }).success).toBe(false);
    expect(saveProblemBuilderSchema.safeParse({ projectId: "2f29b16e-cd44-4a7e-9a84-a358902794e8", content, lastKnownUpdatedAt: "not-a-date" }).success).toBe(false);
  });
});
