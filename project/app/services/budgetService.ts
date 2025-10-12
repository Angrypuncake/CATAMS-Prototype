import axios from "@/lib/axios";

export async function getBudgetByOfferingId(offeringId: number) {
  const res = await axios.get("/offerings/${offeringId}/budget/total");
  return res;
}

export async function getAllocatedBudgetByOfferingId(offeringId: number) {
  const res = await axios.get("/offerings/${offeringId}/budget/allocations");
  return res;
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

// app/services/budgetService.ts
// import { getAllocationsByOfferingId } from "./allocationService";
// import { getClaimsByOfferingId } from "./claimService";

// export async function getUnitBudgetOverview(offeringId: number) {
//   try {
//     const [budgetRes, allocRes, claimRes] = await Promise.all([
//       getBudgetByOfferingId(offeringId),
//     //   getAllocationsByOfferingId(offeringId),
//     //   getClaimsByOfferingId(offeringId),
//     ]);

//     const budget = budgetRes.data.budget;
//     const allocated = allocRes.data.totalAllocated;
//     const claimed = claimRes.data.totalClaimed;

//     const spent = claimed; // or combine with allocated if you want total usage
//     const pctUsed = spent / budget;
//     const variance = budget - spent;

//     return {
//       offeringId,
//       budget,
//       spent,
//       pctUsed,
//       variance,
//     };
//   } catch (err) {
//     console.error(`Failed to assemble budget overview for offering ${offeringId}`, err);
//     throw err;
//   }
// }
