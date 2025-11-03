import axios from "@/lib/axios";
import { OccurrenceRow } from "@/app/admin/allocations/types";

export async function getActivityOccurrences(activityId: number): Promise<OccurrenceRow[]> {
  const res = await axios.get(`/admin/activities/${activityId}/occurrences`);
  return res.data.data || [];
}
