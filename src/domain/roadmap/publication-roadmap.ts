import type { ActionTask } from "@/types/action-plan";
import type { RoadmapModuleContent, WorksheetStatus } from "@/types/worksheet";

export interface PublicationRoadmapSnapshot {
  content: RoadmapModuleContent;
  completionPercent: number;
  status: WorksheetStatus;
}

export const publicationRoadmapCriteria = [
  { key: "has_task", label: "Memiliki milestone", isMet: (content: RoadmapModuleContent) => content.task_count >= 1 },
  { key: "three_tasks", label: "Minimal 3 milestone", isMet: (content: RoadmapModuleContent) => content.task_count >= 3 },
  { key: "all_dated", label: "Semua bertanggal", isMet: (content: RoadmapModuleContent) => content.task_count > 0 && content.dated_count === content.task_count },
  { key: "high_priority", label: "Ada prioritas tinggi", isMet: (content: RoadmapModuleContent) => content.high_priority_count >= 1 },
  { key: "all_completed", label: "Semua diselesaikan", isMet: (content: RoadmapModuleContent) => content.task_count > 0 && content.completed_count === content.task_count },
] as const;

export function calculatePublicationRoadmap(
  tasks: Pick<ActionTask, "due_date" | "priority" | "status">[],
): PublicationRoadmapSnapshot {
  const content: RoadmapModuleContent = {
    task_count: tasks.length,
    dated_count: tasks.filter((task) => Boolean(task.due_date)).length,
    high_priority_count: tasks.filter((task) => task.priority === "high").length,
    completed_count: tasks.filter((task) => task.status === "completed").length,
  };
  const completionPercent = publicationRoadmapCriteria.filter((criterion) => criterion.isMet(content)).length * 20;
  return {
    content,
    completionPercent,
    status: completionPercent === 0 ? "not_started" : completionPercent === 100 ? "completed" : "in_progress",
  };
}
