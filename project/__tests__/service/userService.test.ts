import axios from "@/lib/axios";
import {
  getTutors,
  getTutorsByUnit,
  getAdminOverview,
  getBudgetOverview,
  getTutorById,
  getUserById,
  getUserRoles,
  getUserUnits,
  getUsers,
} from "@/app/services/userService";
import type { Tutor } from "@/app/_types/tutor";

jest.mock("@/lib/axios", () => ({ get: jest.fn() }));
const mockedAxios = axios as jest.Mocked<typeof axios>;

afterEach(() => {
  jest.resetAllMocks();
});

test("getTutors calls /admin/tutors with page/limit and returns tutors", async () => {
  const data: Tutor[] = [
    {
      user_id: 1,
      first_name: "A",
      last_name: "B",
      email: "a@b.com",
      units: [],
    } as unknown as Tutor,
  ];
  mockedAxios.get.mockResolvedValueOnce({ data: { data } });

  const res = await getTutors(2, 25);
  expect(mockedAxios.get).toHaveBeenCalledWith("/admin/tutors", {
    params: { page: 2, limit: 25 },
  });
  expect(res).toEqual(data);
});

test("getTutorsByUnit calls /admin/tutors with unit_code param and returns tutors", async () => {
  const data: Tutor[] = [
    {
      user_id: 2,
      first_name: "C",
      last_name: "D",
      email: "c@d.com",
      units: ["INFO1111"],
    } as unknown as Tutor,
  ];
  mockedAxios.get.mockResolvedValueOnce({ data: { data } });

  const res = await getTutorsByUnit("INFO1111");
  expect(mockedAxios.get).toHaveBeenCalledWith("/admin/tutors", {
    params: { unit_code: "INFO1111" },
  });
  expect(res).toEqual(data);
});

test("getAdminOverview calls /admin/overview and returns data", async () => {
  const payload = { totals: { tutors: 10 } };
  mockedAxios.get.mockResolvedValueOnce({ data: payload });

  const res = await getAdminOverview();
  expect(mockedAxios.get).toHaveBeenCalledWith("/admin/overview");
  expect(res).toEqual(payload);
});

test("getBudgetOverview calls /uc/overview with params and returns data", async () => {
  const payload = { rows: [] };
  mockedAxios.get.mockResolvedValueOnce({ data: payload });

  const res = await getBudgetOverview(2025, "T1", 0.9);
  expect(mockedAxios.get).toHaveBeenCalledWith("/uc/overview", {
    params: { year: 2025, session: "T1", threshold: 0.9 },
  });
  expect(res).toEqual(payload);
});

test("getTutorById calls /admin/tutors/:id and returns Tutor", async () => {
  const tutor = {
    user_id: 5,
    first_name: "E",
    last_name: "F",
    email: "e@f.com",
    units: [],
  };
  mockedAxios.get.mockResolvedValueOnce({ data: { data: tutor } });

  const res = await getTutorById(5);
  expect(mockedAxios.get).toHaveBeenCalledWith("/admin/tutors/5");
  expect(res).toEqual(tutor);
});

test("getUserById calls /users/:id and returns data", async () => {
  const payload = { user_id: 9, email: "x@y.com" };
  mockedAxios.get.mockResolvedValueOnce({ data: payload });

  const res = await getUserById(9);
  expect(mockedAxios.get).toHaveBeenCalledWith("/users/9");
  expect(res).toEqual(payload);
});

test("getUserRoles calls /users/:id/roles and returns data.data", async () => {
  const roles = [{ role: "tutor" }];
  mockedAxios.get.mockResolvedValueOnce({ data: { data: roles } });

  const res = await getUserRoles(11);
  expect(mockedAxios.get).toHaveBeenCalledWith("/users/11/roles");
  expect(res).toEqual(roles);
});

test("getUserUnits calls /users/:id/units and returns data.data", async () => {
  const units = [{ unit_code: "COMP1511" }];
  mockedAxios.get.mockResolvedValueOnce({ data: { data: units } });

  const res = await getUserUnits(12);
  expect(mockedAxios.get).toHaveBeenCalledWith("/users/12/units");
  expect(res).toEqual(units);
});

test("getUsers without filters calls /users and returns data.data", async () => {
  const list = [{ user_id: 1 }, { user_id: 2 }];
  mockedAxios.get.mockResolvedValueOnce({ data: { data: list } });

  const res = await getUsers();
  expect(mockedAxios.get).toHaveBeenCalledWith("/users");
  expect(res).toEqual(list);
});

test("getUsers with single filter builds query string", async () => {
  const list = [{ user_id: 3 }];
  mockedAxios.get.mockResolvedValueOnce({ data: { data: list } });

  const res = await getUsers({ q: "alex" });
  expect(mockedAxios.get).toHaveBeenCalledWith("/users?q=alex");
  expect(res).toEqual(list);
});

test("getUsers with multiple filters builds query string (any order)", async () => {
  const list = [{ user_id: 4 }];
  mockedAxios.get.mockResolvedValueOnce({ data: { data: list } });

  const res = await getUsers({ q: "alex", role: "admin" });

  // Accept either order of params (URLSearchParams preserves insertion, but be tolerant)
  expect(mockedAxios.get).toHaveBeenCalledWith(
    expect.stringMatching(/^\/users\?(q=alex&role=admin|role=admin&q=alex)$/)
  );
  expect(res).toEqual(list);
});
