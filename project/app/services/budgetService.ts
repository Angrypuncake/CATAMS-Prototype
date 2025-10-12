import axios from "@/lib/axios";
import { getUnitOffering } from "./unitService";

export async function getBudgetByOfferingId(offeringId: number) {
  const res = await axios.get(`/offerings/${offeringId}/budget/total`);
  return res.data as { budget: number };
}

export async function getAllocatedBudgetByOfferingId(offeringId: number) {
  const res = await axios.get(`/offerings/${offeringId}/budget/allocations`);
  return res.data as { totalAllocated: number };
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

  /** Total funding available for the offering (from getBudgetByOfferingId) */
  totalBudget: number;

  /** Sum of all allocated hours × rates (from getAllocationsByOfferingId) */
  allocatedAmount: number;

  /** Sum of all finalised tutor claims (from getClaimsByOfferingId) */
  claimedAmount: number;

  /** Ratio of claimed amount over total budget (claimedAmount / totalBudget) */
  pctUsed: number;

  /** Remaining balance = totalBudget - claimedAmount */
  variance: number;

  /** Optional forecast column, if you later model projection */
  forecast?: number | null;

  /** Derived status (Healthy / Exceeding) based on threshold */
  status: "Healthy" | "Exceeding";
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
export async function getUnitBudgetOverview(
  offeringId: number,
  threshold = 0.9,
): Promise<UnitBudgetRow> {
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
    const allocatedAmount = allocRes.totalAllocated ?? 0;
    const claimedAmount = claimRes.totalClaimed ?? 0;

    // 3 Derive calculated metrics
    const pctUsed = totalBudget > 0 ? claimedAmount / totalBudget : 0;
    const variance = totalBudget - claimedAmount;
    const status: "Healthy" | "Exceeding" =
      pctUsed >= threshold ? "Exceeding" : "Healthy";

    // 4 Return unified object — fully satisfies UnitBudgetRow
    return {
      offeringId: offering.offeringId,
      unitCode: offering.unitCode,
      unitName: offering.unitName,
      year: offering.year,
      session: offering.sessionCode,
      totalBudget,
      allocatedAmount,
      claimedAmount,
      pctUsed,
      variance,
      status,
    };
  } catch (err) {
    console.error(
      `Failed to assemble budget overview for offering ${offeringId}`,
      err,
    );
    throw err;
  }
}
