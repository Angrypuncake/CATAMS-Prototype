// types/request.ts

export type RequestType = "swap" | "correction" | "cancellation" | "general";
export type RequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "withdrawn"
  | "in_review";

// types/request.ts
export type ClaimDetails = {
  hours: number;
  paycode: string;
};

export type SwapDetails = {
  suggested_tutor_id: number;
};

export type CorrectionDetails = {
  date: string;
  start_at: string;
  end_at: string;
  location: string;
  hours: string;
  session_type: string;
  justification: string;
};

// Cancellation and Query have no fields
export type EmptyDetails = null;

export interface BaseRequest {
  requestId: number;
  requesterId: number;
  reviewerId: number;
  requestDate: string;
  allocationId: number;
  requestStatus: "pending" | "approved" | "rejected";
  requestReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export type TutorRequest =
  | ({ requestType: "claim"; details: ClaimDetails } & BaseRequest)
  | ({ requestType: "swap"; details: SwapDetails } & BaseRequest)
  | ({ requestType: "correction"; details: CorrectionDetails } & BaseRequest)
  | ({
      requestType: "cancellation" | "query";
      details: EmptyDetails;
    } & BaseRequest);

export type TutorCorrectionPayload = Extract<
  TutorRequest,
  { requestType: "correction" }
>["details"] & {
  allocation_id: string | number;
};
