import axios from "@/lib/axios";
import { Claim, CreateClaimPayload } from "../_types/claim";

export async function createClaim(payload: CreateClaimPayload): Promise<Claim> {
  const res = await axios.post("/claims", payload);
  return res.data.data as Claim;
}
