// types/tutor.ts
export interface Tutor {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  status?: "active" | "inactive";
  role?: "tutor" | "ta" | "admin";
  units?: string[]; // list of unit codes the tutor belongs to
}
