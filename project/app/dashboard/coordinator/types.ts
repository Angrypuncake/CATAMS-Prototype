export interface UnitBudgetRow {
  offeringId: number;
  unitCode: string;
  unitName: string;
  year: number;
  session: string;
  budget: number;
  spent: number;
  pctUsed: number;
  variance: number;
}
export interface CoordinatorBudgetOverview {
  year: number;
  session: string;
  threshold: number; // 0..1
  rows: UnitBudgetRow[];
  alerts?: {
    message: string;
    offeringId: number;
    unitCode: string;
    pctUsed: number;
  }[];
}

export interface TutorRequestRow {
  requestID: string;
  type: string;
  relatedSession: string;
  status: string;
  creator: string;
  creatorRole: string;
  user_id: number;
}
