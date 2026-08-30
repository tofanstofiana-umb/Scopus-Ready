/** True only the moment completion first reaches 100 — not on every save at 100%, and not below 100. */
export function justReachedFullCompletion(oldCompletionPercent: number | null, newCompletionPercent: number): boolean {
  return newCompletionPercent === 100 && (oldCompletionPercent ?? 0) < 100;
}
