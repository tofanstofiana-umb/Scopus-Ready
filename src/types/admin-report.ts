export interface AdminReadinessBreakdown {
  ready_to_submit: number;
  minor_revision: number;
  major_revision: number;
  awaiting_assessment: number;
}

export interface AdminClassReport {
  classId: string | null;
  className: string;
  totalProjects: number;
  averageScore: number | null;
  readiness: AdminReadinessBreakdown;
}

export interface AdminReportSummary {
  totalProjects: number;
  averageScore: number | null;
  readiness: AdminReadinessBreakdown;
  byClass: AdminClassReport[];
}
