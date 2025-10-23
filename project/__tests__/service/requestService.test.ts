import axios from "@/lib/axios";
import {
  getRequestById,
  postCorrectionRequest,
  createRequestService,
  getOpenRequestTypes,
  getRequestsByAllocation,
  getTutorRequests,
} from "@/app/services/requestService";
import type {
  CreateRequestPayload,
  TutorCorrectionPayload,
  ClaimDetails,
  SwapDetails,
  CorrectionDetails,
} from "@/app/_types/request";

jest.mock("@/lib/axios", () => ({ get: jest.fn(), post: jest.fn() }));
const mockedAxios = axios as jest.Mocked<typeof axios>;

afterEach(() => jest.resetAllMocks());

describe("getRequestById (mocked paths)", () => {
  test.each([
    { id: "0", type: "claim" },
    { id: "1", type: "swap" },
    { id: "2", type: "cancellation" },
    { id: "3", type: "correction" },
    { id: "4", type: "query" },
    { id: "5", type: "claim" },
  ])("id %p → %p", async ({ id, type }) => {
    const r = await getRequestById(id);
    expect(r.requestId).toBe(Number(id));
    expect(r.requestType).toBe(type);
    expect(r.requestStatus).toBe("pending");
    expect(typeof r.createdAt).toBe("string");
    expect(typeof r.updatedAt).toBe("string");
    if (type === "claim") {
      expect(r.details).toEqual({ hours: 2, paycode: "TUT01" });
    }
    if (type === "swap") {
      expect(r.details).toEqual({ suggested_tutor_id: 10 });
    }
    if (type === "correction") {
      expect(r.details).toEqual({
        date: "2025-10-12",
        start_at: "09:00",
        end_at: "11:00",
        location: "Room 302, Engineering Building",
        hours: "2",
        session_type: "Tutorial",
      });
    }
    if (type === "cancellation" || type === "query") {
      expect(r.details).toBeNull();
    }
  });
});

describe("postCorrectionRequest", () => {
  test("posts and returns data", async () => {
    const correctionDetails: CorrectionDetails = {
      date: "2025-10-15",
      start_at: "09:00",
      end_at: "11:00",
      location: "Room A",
      hours: "2",
      session_type: "tutorial",
    };
    const payload: TutorCorrectionPayload = {
      allocation_id: 45,
      ...correctionDetails,
    };
    mockedAxios.post.mockResolvedValueOnce({ data: { ok: true } });
    const res = await postCorrectionRequest(45, payload);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      "/tutor/allocations/45/requests/correction",
      payload,
    );
    expect(res).toEqual({ ok: true });
  });
});

describe("createRequestService", () => {
  test("claim", async () => {
    const details: ClaimDetails = { paycode: "TUT102", hours: 2 };
    const payload: CreateRequestPayload<"claim"> = {
      requesterId: 12,
      allocationId: 45,
      requestType: "claim",
      requestReason: "Claiming unpaid session",
      details,
    };
    mockedAxios.post.mockResolvedValueOnce({ data: { id: 1 } });
    const res = await createRequestService(payload);
    expect(mockedAxios.post).toHaveBeenCalledWith("/requests", payload);
    expect(res).toEqual({ id: 1 });
  });

  test("swap", async () => {
    const details: SwapDetails = { suggested_tutor_id: 10 };
    const payload: CreateRequestPayload<"swap"> = {
      requesterId: 12,
      allocationId: 45,
      requestType: "swap",
      requestReason: "Scheduling conflict",
      details,
    };
    mockedAxios.post.mockResolvedValueOnce({ data: { id: 2 } });
    const res = await createRequestService(payload);
    expect(mockedAxios.post).toHaveBeenCalledWith("/requests", payload);
    expect(res).toEqual({ id: 2 });
  });

  test("correction", async () => {
    const details: CorrectionDetails = {
      date: "2025-10-15",
      start_at: "09:00",
      end_at: "11:00",
      location: "Room A",
      hours: "2",
      session_type: "tutorial",
    };
    const payload: CreateRequestPayload<"correction"> = {
      requesterId: 12,
      allocationId: 45,
      requestType: "correction",
      requestReason: "Incorrect session time",
      details,
    };
    mockedAxios.post.mockResolvedValueOnce({ data: { id: 3 } });
    const res = await createRequestService(payload);
    expect(mockedAxios.post).toHaveBeenCalledWith("/requests", payload);
    expect(res).toEqual({ id: 3 });
  });

  test("cancellation", async () => {
    const payload: CreateRequestPayload<"cancellation"> = {
      requesterId: 12,
      allocationId: 45,
      requestType: "cancellation",
      requestReason: "Illness",
      details: { suggested_tutor_id: 34 },
    };
    mockedAxios.post.mockResolvedValueOnce({ data: { id: 4 } });
    const res = await createRequestService(payload);
    expect(mockedAxios.post).toHaveBeenCalledWith("/requests", payload);
    expect(res).toEqual({ id: 4 });
  });

  test("query", async () => {
    const payload: CreateRequestPayload<"query"> = {
      requesterId: 12,
      allocationId: 45,
      requestType: "query",
      requestReason: "Clarification on allocation hours",
      details: null,
    };
    mockedAxios.post.mockResolvedValueOnce({ data: { id: 5 } });
    const res = await createRequestService(payload);
    expect(mockedAxios.post).toHaveBeenCalledWith("/requests", payload);
    expect(res).toEqual({ id: 5 });
  });
});

describe("getOpenRequestTypes", () => {
  test("returns unique lowercased types", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        data: [
          { request_type: "Claim" },
          { request_type: "claim" },
          { request_type: "Swap" },
          { request_type: null },
          { request_type: "QUERY" },
        ],
      },
    });
    const res = await getOpenRequestTypes(7);
    expect(mockedAxios.get).toHaveBeenCalledWith("/requests?allocationId=7");
    expect(res.sort()).toEqual(["claim", "query", "swap"]);
  });
});

describe("getRequestsByAllocation", () => {
  test("maps/filters rows without user header", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        data: [
          {
            request_id: 1,
            requester_id: 2,
            allocation_id: 3,
            request_type: "claim",
            request_status: "pending",
            request_reason: "r",
            created_at: "t",
          },
          {
            request_id: 2,
            requester_id: 3,
            allocation_id: 3,
            request_type: null,
            request_status: "pending",
            request_reason: null,
            created_at: "t",
          },
        ],
      },
    });
    const res = await getRequestsByAllocation(3);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      "/requests?allocationId=3",
      undefined,
    );
    expect(res).toEqual([
      {
        requestId: 1,
        requesterId: 2,
        allocationId: 3,
        requestType: "claim",
        requestStatus: "pending",
        requestReason: "r",
        createdAt: "t",
      },
    ]);
  });

  test("passes x-user-id header when userId provided", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { data: [] } });
    await getRequestsByAllocation(9, 42);
    expect(mockedAxios.get).toHaveBeenCalledWith("/requests?allocationId=9", {
      headers: { "x-user-id": "42" },
    });
  });
});

describe("getTutorRequests", () => {
  test("returns paginated tutor requests", async () => {
    const page = 2;
    const limit = 25;
    const payload = { data: [], total: 0, page, limit };
    mockedAxios.get.mockResolvedValueOnce({ data: payload });
    const res = await getTutorRequests(page, limit);
    expect(mockedAxios.get).toHaveBeenCalledWith("/tutor/requests", {
      params: { page, limit },
    });
    expect(res).toEqual(payload);
  });
});
