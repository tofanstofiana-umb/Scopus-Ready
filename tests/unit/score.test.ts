import { describe, expect, it } from "vitest";
import { calculateScopusReadyScore, SCOPUS_READY_RUBRIC } from "@/domain/scoring/score";

describe("SCOPUS READY Score", () => {
  it("does not publish a score while the rubric is incomplete", () => {
    const result = calculateScopusReadyScore([{ dimension: "problem", score: 7, maxScore: 8 }]);
    expect(result.score).toBeNull();
    expect(result.complete).toBe(false);
    expect(result.assessedDimensions).toBe(1);
  });

  it("calculates a score only from all ten valid rubric dimensions", () => {
    const assessments = SCOPUS_READY_RUBRIC.map((item) => ({
      dimension: item.dimension,
      score: item.maxScore * 0.8,
      maxScore: item.maxScore,
    }));
    const result = calculateScopusReadyScore(assessments);
    expect(result.score).toBe(80);
    expect(result.complete).toBe(true);
    expect(result.assessedDimensions).toBe(10);
  });

  it("rejects an assessment whose maximum does not match the official rubric", () => {
    const assessments = SCOPUS_READY_RUBRIC.map((item) => ({
      dimension: item.dimension,
      score: item.maxScore,
      maxScore: item.dimension === "problem" ? 10 : item.maxScore,
    }));
    expect(calculateScopusReadyScore(assessments).score).toBeNull();
  });
});
