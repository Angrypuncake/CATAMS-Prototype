import axios from "@/lib/axios";

export interface UnitOffering {
  offeringId: number;
  courseUnitId: string;
  unitCode: string;
  unitName: string;
  year: number;
  session: string;
  budget: number;
}
export async function getUnitOffering(
  offeringId: number,
): Promise<UnitOffering> {
  const res = await axios.get(`/offerings/${offeringId}`);
  return res.data as UnitOffering;
}
