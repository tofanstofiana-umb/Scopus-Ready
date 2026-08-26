import { describe, expect, it } from "vitest";
import { evaluateCriticalGates, determineReadinessStatus } from "@/domain/scoring/gates";
import { calculateScopusReadyScore, SCOPUS_READY_RUBRIC } from "@/domain/scoring/score";

function scoreFrom(values: Record<string, number>) {
  return calculateScopusReadyScore(SCOPUS_READY_RUBRIC.map((rubric) => ({
    dimension: rubric.dimension,
    score: values[rubric.dimension] ?? rubric.maxScore,
    maxScore: rubric.maxScore,
  })));
}

describe("Critical Gates and readiness", () => {
  it("keeps missing assessments and Internal Review pending", () => {
    const score = calculateScopusReadyScore([{ dimension: "problem", score: 7, maxScore: 8 }]);
    const gates = evaluateCriticalGates(score, false);
    expect(gates.find((gate) => gate.id === "problem")?.status).toBe("pass");
    expect(gates.find((gate) => gate.id === "research_gap")?.status).toBe("pending");
    expect(gates.find((gate) => gate.id === "reviewer")?.status).toBe("pending");
    expect(determineReadinessStatus(score, gates).status).toBe("awaiting_assessment");
  });

  it("makes a failed gate override an incomplete assessment", () => {
    const score = calculateScopusReadyScore([{ dimension: "problem", score: 5, maxScore: 8 }]);
    const gates = evaluateCriticalGates(score, false);
    expect(determineReadinessStatus(score, gates).status).toBe("major_revision");
  });

  it("marks a complete high-quality assessment ready only when every gate passes", () => {
    const score = scoreFrom({});
    const gates = evaluateCriticalGates(score, true);
    expect(gates.every((gate) => gate.status === "pass")).toBe(true);
    expect(determineReadinessStatus(score, gates).status).toBe("ready_to_submit");
  });

  it("distinguishes minor and major revision by score after gates pass", () => {
    const minorScore = scoreFrom({ problem: 6, research_gap: 10, novelty: 10, contribution: 8, theory_literature: 8, method: 10, evidence: 8, discussion: 10, journal_fit: 6, language_technical: 4 });
    const majorScore = scoreFrom({ problem: 6, research_gap: 8, novelty: 8, contribution: 7, theory_literature: 7, method: 8, evidence: 7, discussion: 8, journal_fit: 6, language_technical: 5 });
    expect(determineReadinessStatus(minorScore, evaluateCriticalGates(minorScore, true)).status).toBe("minor_revision");
    expect(determineReadinessStatus(majorScore, evaluateCriticalGates(majorScore, true)).status).toBe("major_revision");
  });
});
