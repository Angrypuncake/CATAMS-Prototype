// project/app/services/authService.ts
import api from "@/lib/axios";

export async function login(email: string, password: string) {
  const res = await api.post(
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
  await api.post("/auth/logout", {}, { withCredentials: true });
}
