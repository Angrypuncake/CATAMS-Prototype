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

export interface TutorRequestRow {
  requestID: number;
  type: string;
  status: string;
  relatedSession: string;
  creatorRole: string;
  creator: string;
  user_id: number;
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
