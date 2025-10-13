// app/services/paycodeService.ts

import axios from "@/lib/axios";
import { Paycode } from "../_types/paycode";

export async function getPaycodes(): Promise<Paycode[]> {
  const res = await axios.get("/admin/paycodes");
  return res.data.data as Paycode[];
}
