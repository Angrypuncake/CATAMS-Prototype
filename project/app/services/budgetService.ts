import axios from "@/lib/axios";
import { getUnitOffering, getCoordinatorUnits } from "./unitService";

export async function getBudgetByOfferingId(offeringId: number) {
  const res = await axios.get(`/offerings/${offeringId}/budget/total`);
  return res.data as { budget: number };
}

export async function getAllocatedBudgetByOfferingId(offeringId: number) {
  const res = await axios.get(`/offerings/${offeringId}/budget/allocations`);
  return res.data as { allocatedAmount: number };
}

export async function getClaimedBudgetByOfferingId(offeringId: number) {
  const res = await axios.get(`/offerings/${offeringId}/budget/claims`);
  return res.data as { totalClaimed: number };
}

/** Represents a single unit offering's financial breakdown */
export interface UnitBudgetRow {
  offeringId: number;
  unitCode: string;
  unitName: string;
  year: number;
  session: string;
  budget: number;
  allocated: number;
  claimed: number;
  pctUsed: number;
  variance: number;
}

/** Represents the full Unit Coordinator budget summary table */
export interface CoordinatorBudgetOverview {
  year: number;
  session: string;

  /** e.g. 0.9 for 90% */
  threshold: number;

  /** All unit rows in the table */
  rows: UnitBudgetRow[];

  /** Derived alerts generated when pctUsed >= threshold */
  alerts?: {
    offeringId: number;
    unitCode: string;
    message: string;
    pctUsed: number;
  }[];
}

/** === Aggregated overview === */
export async function getUnitBudgetRow(offeringId: number): Promise<UnitBudgetRow> {
  try {
    //  Fetch all data in parallel
    const [offering, budgetRes, allocRes, claimRes] = await Promise.all([
      getUnitOffering(offeringId),
      getBudgetByOfferingId(offeringId),
      getAllocatedBudgetByOfferingId(offeringId),
      getClaimedBudgetByOfferingId(offeringId),
    ]);

    // 2Extract numeric values
    const totalBudget = budgetRes.budget ?? offering.budget ?? 0;

    const allocatedAmount = allocRes.allocatedAmount ?? 0;
    const claimedAmount = claimRes.totalClaimed ?? 0;

    // 3 Derive calculated metrics
    const pctUsed = totalBudget > 0 ? claimedAmount / totalBudget : 0;
    const variance = totalBudget - claimedAmount;

    // 4 Return unified object — fully satisfies UnitBudgetRow
    return {
      offeringId: offering.offeringId,
      unitCode: offering.unitCode,
      unitName: offering.unitName,
      year: offering.year,
      session: offering.session,
      budget: totalBudget,
      allocated: allocatedAmount,
      claimed: claimedAmount,
      pctUsed,
      variance,
    };
  } catch (err) {
    console.error(`Failed to assemble budget overview for offering ${offeringId}`, err);
    throw err;
  }
}

/** === Aggregated overview for all UC units === */
export async function getUnitBudgetOverviews(
  year: number,
  session: string,
  threshold = 0.9
): Promise<CoordinatorBudgetOverview> {
  try {
    // 1 Get all unit offering IDs for this UC
    const rawOfferings = await getCoordinatorUnits();
    const offeringIds = rawOfferings.map((r) => r.offering_id);

    // 2 For each unit, fetch its budget row in parallel
    const rows = await Promise.all(offeringIds.map((id) => getUnitBudgetRow(id)));

    // 3Generate alert objects for rows exceeding threshold
    const alerts = rows
      .filter((r) => r.pctUsed >= threshold)
      .map((r) => ({
        offeringId: r.offeringId,
        unitCode: r.unitCode,
        pctUsed: r.pctUsed,
        message: `⚠️ ${r.unitCode} is at ${(r.pctUsed * 100).toFixed(1)}% of budget.`,
      }));

    // 4 Return fully typed CoordinatorBudgetOverview object
    return {
      year,
      session,
      threshold,
      rows,
      alerts: alerts.length > 0 ? alerts : undefined,
    };
  } catch (err) {
    console.error("Failed to compile UC budget overview:", err);
    throw err;
  }
}
