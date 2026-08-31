export type LibraryCategory = "bacaan" | "video" | "template" | "rubrik" | "prompt";

export interface LibraryResource {
  id: string;
  module_id: string | null;
  category: LibraryCategory;
  title: string;
  description: string;
  body: string | null;
  url: string | null;
  sequence: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface LibraryModuleOption {
  id: string;
  name: string;
  sequence: number;
}

export interface LibraryModuleGroup {
  moduleId: string | null;
  moduleName: string | null;
  moduleSequence: number | null;
  resources: LibraryResource[];
}
