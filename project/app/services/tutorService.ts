import api from "@/lib/axios";
import type { Tutor } from "@/app/_types/tutor";

export async function getAllTutors(page = 1, limit = 50) {
  const res = await api.get("/admin/tutors", { params: { page, limit } });
  return res.data.data as Tutor[];
}
