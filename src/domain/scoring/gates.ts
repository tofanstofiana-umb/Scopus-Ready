import type { ScopusReadyScore } from "./score";

export type CriticalGateId = "problem" | "research_gap" | "novelty" | "method" | "journal_fit" | "reviewer";
export type CriticalGateStatus = "pass" | "fail" | "pending";
export type ReadinessStatus = "awaiting_assessment" | "major_revision" | "minor_revision" | "ready_to_submit";

export interface CriticalGateResult {
  id: CriticalGateId;
  label: string;
  status: CriticalGateStatus;
  score: number | null;
  maxScore: number | null;
  threshold: number | null;
  explanation: string;
}

export interface ReadinessResult {
  status: ReadinessStatus;
  label: string;
  explanation: string;
}

const ASSESSMENT_GATES = [
  { id: "problem", label: "Problem Gate", threshold: 6 },
  { id: "research_gap", label: "Gap Gate", threshold: 8 },
  { id: "novelty", label: "Novelty Gate", threshold: 8 },
  { id: "method", label: "Method Gate", threshold: 8 },
  { id: "journal_fit", label: "Journal Fit Gate", threshold: 6 },
] as const;

export function evaluateCriticalGates(score: ScopusReadyScore, internalReviewCompleted: boolean): CriticalGateResult[] {
  const breakdown = new Map(score.breakdown.map((item) => [item.dimension, item]));
  const assessmentGates: CriticalGateResult[] = ASSESSMENT_GATES.map((rule) => {
    const assessment = breakdown.get(rule.id);
    const value = assessment?.score ?? null;
    const status: CriticalGateStatus = value === null ? "pending" : value >= rule.threshold ? "pass" : "fail";
    return {
      id: rule.id,
      label: rule.label,
      status,
      score: value,
      maxScore: assessment?.maxScore ?? null,
      threshold: rule.threshold,
      explanation: value === null
        ? "Dimensi belum dinilai."
        : status === "pass"
          ? `Nilai memenuhi ambang minimal ${rule.threshold}.`
          : `Nilai belum mencapai ambang minimal ${rule.threshold}.`,
    };
  });

  return [
    ...assessmentGates,
    {
      id: "reviewer",
      label: "Reviewer Gate",
      status: internalReviewCompleted ? "pass" : "pending",
      score: null,
      maxScore: null,
      threshold: null,
      explanation: internalReviewCompleted ? "Internal Review telah selesai." : "Internal Review belum selesai.",
    },
  ];
}

export function determineReadinessStatus(score: ScopusReadyScore, gates: CriticalGateResult[]): ReadinessResult {
  if (gates.some((gate) => gate.status === "fail")) {
    return {
      status: "major_revision",
      label: "Perlu Revisi Besar",
      explanation: "Setidaknya satu Critical Gate belum memenuhi ambang kesiapan.",
    };
  }
  if (!score.complete || gates.some((gate) => gate.status === "pending")) {
    return {
      status: "awaiting_assessment",
      label: "Belum Lengkap",
      explanation: "Lengkapi seluruh dimensi penilaian dan Internal Review.",
    };
  }
  if ((score.score ?? 0) >= 85) {
    return {
      status: "ready_to_submit",
      label: "Siap Submit",
      explanation: "Seluruh Critical Gate lulus dan score minimal 85.",
    };
  }
  if ((score.score ?? 0) >= 75) {
    return {
      status: "minor_revision",
      label: "Perlu Revisi Kecil",
      explanation: "Seluruh Critical Gate lulus, tetapi score masih di bawah 85.",
    };
  }
  return {
    status: "major_revision",
    label: "Perlu Revisi Besar",
    explanation: "Seluruh gate lulus, tetapi score kesiapan masih di bawah 75.",
  };
}
