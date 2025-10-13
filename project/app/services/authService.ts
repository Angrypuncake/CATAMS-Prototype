import axios from "@/lib/axios";
import { CurrentUser } from "../_types/user";

export async function getUserFromAuth() {
  const res = await axios.get("auth/me");
  return res.data as CurrentUser;
}
// project/app/services/authService.ts

export async function login(email: string, password: string) {
  const res = await axios.post(
    "/auth/login",
    {
      useremail: email,
      password: password,
    },
    { withCredentials: true },
  );
  return res.data;
}

export async function logout() {
  await axios.post("/auth/logout", {}, { withCredentials: true });
}
