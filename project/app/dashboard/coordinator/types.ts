export interface UnitBudgetRow {
  offeringId: number;
  unitCode: string;
  unitName: string;
  year: number;
  session: string;
  budget: number;
  spent: number;
  percentUsed: number;
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
