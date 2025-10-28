// types/request.ts

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
  suggested_tutor_id: number | null;
  suggested_alloc_id: number | null;
};

export type CorrectionDetails = {
  date: string;
  start_at: string;
  end_at: string;
  location: string;
  hours: string;
  session_type: string;
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

export type RequestType = TutorRequest["requestType"];

export interface CancellationDetails {
  suggested_tutor_id: number | null;
}

export type RequestDetailsMap = {
  claim: ClaimDetails;
  swap: SwapDetails;
  correction: CorrectionDetails;
  cancellation: CancellationDetails;
  query: EmptyDetails;
};

export type CreateRequestPayload<T extends RequestType = RequestType> = {
  requesterId: number;
  allocationId: number;
  requestType: T;
  requestReason?: string | null;
  details: RequestDetailsMap[T];
};

// This is a read only type that excludes the details field
export type BasicRequest = {
  requestId: number;
  requesterId: number;
  allocationId: number;
  requestType: "claim" | "swap" | "correction" | "cancellation" | "query";
  requestStatus: string;
  requestReason: string | null;
  createdAt: string;
};

export interface RequestRow {
  requestId: number;
  type: "claim" | "swap" | "correction" | "cancellation" | "query";
  status: string;
  reason: string | null;
  createdAt: string;
  relatedSession: string;
  actions: string;
}
export interface PaginatedRequests {
  page: number;
  limit: number;
  total: number;
  data: RequestRow[];
}

export interface UCApproval {
  requestId: number;
  requestType: string;
  sessionDate: string;
  startAt: string;
  endAt: string;
  activityName: string;
  requesterName: string;
  reviewerName: number | null;
  requestStatus: string;
}

export interface UCApprovalResponse {
  approvals: UCApproval[];
}
