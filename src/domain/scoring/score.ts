export const SCOPUS_READY_RUBRIC = [
  { dimension: "problem", label: "Masalah", maxScore: 8 },
  { dimension: "research_gap", label: "Research Gap", maxScore: 12 },
  { dimension: "novelty", label: "Novelty", maxScore: 12 },
  { dimension: "contribution", label: "Kontribusi", maxScore: 10 },
  { dimension: "theory_literature", label: "Teori & Literatur", maxScore: 10 },
  { dimension: "method", label: "Metode", maxScore: 12 },
  { dimension: "evidence", label: "Hasil & Bukti", maxScore: 10 },
  { dimension: "discussion", label: "Pembahasan", maxScore: 12 },
  { dimension: "journal_fit", label: "Journal Fit", maxScore: 8 },
  { dimension: "language_technical", label: "Bahasa & Teknis", maxScore: 6 },
] as const;

export type RubricDimension = (typeof SCOPUS_READY_RUBRIC)[number]["dimension"];

export function getRubricDefinition(dimension: string) {
  return SCOPUS_READY_RUBRIC.find((item) => item.dimension === dimension) ?? null;
}

export interface AssessmentInput {
  dimension: string;
  score: number;
  maxScore: number;
}

export interface ScoreBreakdownItem {
  dimension: string;
  label: string;
  score: number | null;
  maxScore: number;
}

export interface ScopusReadyScore {
  score: number | null;
  complete: boolean;
  assessedDimensions: number;
  totalDimensions: number;
  breakdown: ScoreBreakdownItem[];
}

export function calculateScopusReadyScore(assessments: AssessmentInput[]): ScopusReadyScore {
  const assessmentByDimension = new Map(assessments.map((assessment) => [assessment.dimension, assessment]));
  const breakdown = SCOPUS_READY_RUBRIC.map((rubric) => {
    const assessment = assessmentByDimension.get(rubric.dimension);
    const valid = Boolean(
      assessment
      && assessment.maxScore === rubric.maxScore
      && assessment.score >= 0
      && assessment.score <= rubric.maxScore,
    );
    return {
      dimension: rubric.dimension,
      label: rubric.label,
      score: valid ? assessment!.score : null,
      maxScore: rubric.maxScore,
    };
  });
  const assessedDimensions = breakdown.filter((item) => item.score !== null).length;
  const complete = assessedDimensions === SCOPUS_READY_RUBRIC.length;
  const totalScore = breakdown.reduce((sum, item) => sum + (item.score ?? 0), 0);
  const totalMaximum = breakdown.reduce((sum, item) => sum + item.maxScore, 0);

  return {
    score: complete ? Math.round(((totalScore / totalMaximum) * 100) * 10) / 10 : null,
    complete,
    assessedDimensions,
    totalDimensions: SCOPUS_READY_RUBRIC.length,
    breakdown,
  };
}
