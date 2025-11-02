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
export async function getUnitOffering(offeringId: number): Promise<UnitOffering> {
  const res = await axios.get(`/offerings/${offeringId}`);
  return res.data as UnitOffering;
}
interface RawCoordinatorUnit {
  offering_id: number;
}
// Get all of the units that the currently logged in user is a unit coordinator in
export async function getCoordinatorUnits(): Promise<RawCoordinatorUnit[]> {
  const res = await axios.get(`/uc/units`);
  return res.data.data;
}
