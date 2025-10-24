/**
 * @jest-environment node
 */
import axios from "@/lib/axios";
import { createClaim } from "@/app/services/claimService";
import type { CreateClaimPayload, Claim } from "@/app/_types/claim";

jest.mock("@/lib/axios", () => ({ post: jest.fn() }));
const mockedAxios = axios as jest.Mocked<typeof axios>;

afterEach(() => jest.resetAllMocks());

test("createClaim posts payload and returns Claim", async () => {
  const payload: CreateClaimPayload = {
    allocation_id: 42,
    requester_id: 7,
    paycode: "MK01",
    claimed_hours: 3.5,
  };

  const claim: Claim = {
    claim_id: 1001,
    allocation_id: 42,
    user_id: 7,
    paycode: "MK01",
    claimed_hours: 3.5,
    claimed_amount: 350.0,
    created_at: "2025-10-01T12:00:00Z",
  };

  mockedAxios.post.mockResolvedValueOnce({ data: { data: claim } });

  const res = await createClaim(payload);
  expect(mockedAxios.post).toHaveBeenCalledWith("/claims", payload);
  expect(res).toEqual(claim);
});

test("createClaim propagates axios errors", async () => {
  const payload: CreateClaimPayload = {
    allocation_id: 1,
    requester_id: 2,
    paycode: "PC01",
    claimed_hours: 1,
  };
  mockedAxios.post.mockRejectedValueOnce(new Error("Network fail"));
  await expect(createClaim(payload)).rejects.toThrow("Network fail");
});
