// app/services/paycodeService.ts

import axios from "@/lib/axios";

export async function getPaycodes() {
  const res = await axios.get("/admin/paycodes");
  return res.data.data;
}
