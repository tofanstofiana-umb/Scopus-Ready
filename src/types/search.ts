export interface ProjectSearchResult {
  kind: "project";
  id: string;
  title: string;
  href: string;
}

export interface ParticipantSearchResult {
  kind: "participant";
  id: string;
  fullName: string;
  email: string;
  institution: string | null;
  href: string;
}

export type SearchResult = ProjectSearchResult | ParticipantSearchResult;
