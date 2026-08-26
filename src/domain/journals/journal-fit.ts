export interface JournalFitRatings {
  scopeMatch: number;
  articleTypeMatch: number;
  audienceMatch: number;
  requirementsMatch: number;
}

function boundedRating(value: number): number {
  return Number.isFinite(value) ? Math.min(5, Math.max(0, value)) : 0;
}

export function calculateJournalFit(ratings: JournalFitRatings): number {
  const total =
    boundedRating(ratings.scopeMatch) +
    boundedRating(ratings.articleTypeMatch) +
    boundedRating(ratings.audienceMatch) +
    boundedRating(ratings.requirementsMatch);
  return Math.round((total / 20) * 100);
}

export function determineJournalFitLabel(score: number): "Sangat sesuai" | "Sesuai" | "Pertimbangkan" | "Kurang sesuai" {
  if (score >= 80) return "Sangat sesuai";
  if (score >= 60) return "Sesuai";
  if (score >= 40) return "Pertimbangkan";
  return "Kurang sesuai";
}
