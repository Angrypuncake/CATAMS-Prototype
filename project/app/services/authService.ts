import axios from "@/lib/axios";
import { CurrentUser } from "../_types/user";

export async function getUserFromAuth() {
  const res = await axios.get("auth/me");
  return res.data as CurrentUser;
}
