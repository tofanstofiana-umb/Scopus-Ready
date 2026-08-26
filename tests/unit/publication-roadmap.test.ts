import { describe, expect, it } from "vitest";
import { calculatePublicationRoadmap, publicationRoadmapCriteria } from "@/domain/roadmap/publication-roadmap";
import type { ActionTask } from "@/types/action-plan";

function task(overrides: Partial<ActionTask> = {}): Pick<ActionTask, "due_date" | "priority" | "status"> {
  return {
    due_date: null,
    priority: "medium",
    status: "not_started",
    ...overrides,
  };
}

describe("Publication Roadmap domain", () => {
  it("uses five deterministic criteria", () => {
    expect(publicationRoadmapCriteria).toHaveLength(5);
    expect(calculatePublicationRoadmap([])).toEqual({
      content: { task_count: 0, dated_count: 0, high_priority_count: 0, completed_count: 0 },
      completionPercent: 0,
      status: "not_started",
    });
  });

  it("requires three dated milestones, a high priority, and full completion", () => {
    const planned = calculatePublicationRoadmap([
      task({ due_date: "2026-09-01", priority: "high" }),
      task({ due_date: "2026-09-08" }),
      task({ due_date: "2026-09-15" }),
    ]);
    expect(planned.completionPercent).toBe(80);
    expect(planned.status).toBe("in_progress");

    const completed = calculatePublicationRoadmap([
      task({ due_date: "2026-09-01", priority: "high", status: "completed" }),
      task({ due_date: "2026-09-08", status: "completed" }),
      task({ due_date: "2026-09-15", status: "completed" }),
    ]);
    expect(completed.completionPercent).toBe(100);
    expect(completed.status).toBe("completed");
  });

  it("does not award the dated criterion when a milestone has no deadline", () => {
    const snapshot = calculatePublicationRoadmap([
      task({ due_date: "2026-09-01", priority: "high" }),
      task({ due_date: "2026-09-08" }),
      task(),
    ]);
    expect(snapshot.content.dated_count).toBe(2);
    expect(snapshot.completionPercent).toBe(60);
  });
});
