import axios from "@/lib/axios";
import { getUserFromAuth, login, logout } from "../../app/services/authService";

jest.mock("@/lib/axios", () => ({ get: jest.fn(), post: jest.fn() }));

const mockedAxios = axios as jest.Mocked<typeof axios>;

afterEach(() => {
  jest.clearAllMocks();
});

test("getUserFromAuth calls correct endpoint and returns data", async () => {
  mockedAxios.get.mockResolvedValueOnce({
    data: { userId: "u1", email: "a@b.com" },
  });
  const res = await getUserFromAuth();
  expect(mockedAxios.get).toHaveBeenCalledWith("auth/me");
  expect(res).toEqual({ userId: "u1", email: "a@b.com" });
});

test("login posts credentials with withCredentials and returns data", async () => {
  mockedAxios.post.mockResolvedValueOnce({ data: { ok: true } });
  const res = await login("a@b.com", "secret");
  expect(mockedAxios.post).toHaveBeenCalledWith(
    "/auth/login",
    { useremail: "a@b.com", password: "secret" },
    { withCredentials: true },
  );
  expect(res).toEqual({ ok: true });
});

test("logout posts to /auth/logout with withCredentials", async () => {
  mockedAxios.post.mockResolvedValueOnce({ data: {} });
  await logout();
  expect(mockedAxios.post).toHaveBeenCalledWith(
    "/auth/logout",
    {},
    { withCredentials: true },
  );
});
