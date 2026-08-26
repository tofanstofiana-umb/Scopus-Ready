export type JournalQuartile = "q1" | "q2" | "q3" | "q4" | "unranked" | "unknown";
export type JournalTargetStatus = "candidate" | "primary" | "backup" | "rejected";

export interface JournalTarget {
  id: string;
  project_id: string;
  journal_name: string;
  publisher: string | null;
  website_url: string | null;
  quartile: JournalQuartile;
  scope_match: number;
  article_type_match: number;
  audience_match: number;
  requirements_match: number;
  status: JournalTargetStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface JournalTargetInput {
  id?: string;
  projectId: string;
  journalName: string;
  publisher?: string;
  websiteUrl?: string;
  quartile: JournalQuartile;
  scopeMatch: number;
  articleTypeMatch: number;
  audienceMatch: number;
  requirementsMatch: number;
  status: JournalTargetStatus;
  notes?: string;
}
