import { describe, expect, it } from "vitest";
import { justReachedFullCompletion } from "@/domain/progress/notification-gate";

describe("justReachedFullCompletion", () => {
  it("fires the first time completion reaches 100", () => {
    expect(justReachedFullCompletion(80, 100)).toBe(true);
  });

  it("does not fire again once already at 100", () => {
    expect(justReachedFullCompletion(100, 100)).toBe(false);
  });

  it("does not fire below 100", () => {
    expect(justReachedFullCompletion(60, 80)).toBe(false);
  });

  it("treats a missing previous value as 0", () => {
    expect(justReachedFullCompletion(null, 100)).toBe(true);
  });
});
