import type { User } from "./user";

// types/tutor.ts
export interface Tutor extends User {
  units?: string[]; // list of unit codes the tutor belongs to
}
