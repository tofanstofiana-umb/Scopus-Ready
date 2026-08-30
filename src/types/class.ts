export type ClassStatus = "draft" | "active" | "completed" | "archived";

export interface AdminClassSummary {
  id: string;
  name: string;
  code: string;
  status: ClassStatus;
  start_date: string | null;
  end_date: string | null;
  trainer_id: string | null;
  trainerName: string | null;
  participantCount: number;
  price: number;
}

export interface TrainerOption {
  id: string;
  full_name: string;
  email: string;
}

export interface AdminUserSummary {
  id: string;
  full_name: string;
  email: string;
  role: "participant" | "trainer" | "admin";
  institution: string | null;
  created_at: string;
  is_active: boolean;
}
