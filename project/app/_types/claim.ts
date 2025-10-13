export interface CreateClaimPayload {
  allocation_id: number;
  requester_id: number;
  paycode: string;
  claimed_hours: number;
}

export interface Claim {
  claim_id: number;
  allocation_id: number;
  user_id: number;
  paycode: string;
  claimed_hours: number;
  claimed_amount: number;
  created_at: string;
}
