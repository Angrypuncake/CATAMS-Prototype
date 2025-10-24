/**
 * @jest-environment node
 */
import "@testing-library/jest-dom";
import axios from "@/lib/axios";
import {
  getTutorAllocations,
  getAllocationById,
  getFormattedAllocationById,
  getAllocationsByUnit,
  getAllocationsByUnitAndActivityType,
  getAdminAllocations,
  getCurrentUser,
  patchAdminAllocation,
  importAdminData,
  rollbackRun,
  commitImport,
  discardImport,
  getPreview,
  getImportHistory,
  createUnscheduledAllocation,
  updateUnscheduledAllocation,
  deleteUnscheduledAllocation,
  getUnscheduledAllocations,
  getUnscheduledAllocationsByOffering,
  getAllUnscheduledAllocationsForUC,
} from "../../app/services/allocationService";
import { SaveAllocationPayload } from "@/app/_types/allocations";

jest.mock("@/lib/axios", () => ({
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
}));
jest.mock("../../app/services/unitService", () => ({
  getCoordinatorUnits: jest.fn(),
  getUnitOffering: jest.fn(),
}));

global.fetch = jest.fn();

const mockedAxios = axios as jest.Mocked<typeof axios>;
const { getCoordinatorUnits, getUnitOffering } = jest.requireMock(
  "../../app/services/unitService",
);

beforeEach(() => {
  jest.clearAllMocks();
});

/* ------------------------------ Basic GETs ------------------------------ */

test("getTutorAllocations builds params and returns data", async () => {
  mockedAxios.get.mockResolvedValueOnce({ data: { data: ["ok"], total: 1 } });
  const res = await getTutorAllocations("u1", 2, 5, "abc", "unit", "asc");
  expect(mockedAxios.get).toHaveBeenCalledWith(
    "/tutor/allocations",
    expect.any(Object),
  );
  expect(res).toEqual({ data: ["ok"], total: 1 });
});

test("getAllocationById returns mapped row", async () => {
  mockedAxios.get.mockResolvedValueOnce({
    data: {
      data: {
        allocation_id: 1,
        session_date: "2025-01-01",
        start_at: "10:00",
        end_at: "12:00",
      },
    },
  });
  const row = await getAllocationById("1");
  expect(row.id).toBe(1);
});

test("getAllocationById throws if missing row", async () => {
  mockedAxios.get.mockResolvedValueOnce({ data: { data: null } });
  await expect(getAllocationById("9")).rejects.toThrow(
    "Allocation 9 not found",
  );
});

test("getFormattedAllocationById formats and normalizes", async () => {
  mockedAxios.get.mockResolvedValueOnce({
    data: {
      data: {
        allocation_id: 1,
        session_date: "2025-01-02T00:00:00Z",
        start_at: "10:00",
        end_at: "12:00",
        status: "approved",
      },
    },
  });
  const row = await getFormattedAllocationById("1");
  expect(row.status).toBe("Confirmed");
  expect(row.session_date).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  expect(row.hours).toBe("2.00h");
});

test("getAllocationsByUnit and ByUnitAndActivityType call correct endpoints", async () => {
  mockedAxios.get.mockResolvedValueOnce({ data: { data: ["x"] } });
  await getAllocationsByUnit("COMP1000");
  expect(mockedAxios.get).toHaveBeenCalledWith(
    "/admin/allocations",
    expect.any(Object),
  );

  mockedAxios.get.mockResolvedValueOnce({ data: { data: ["y"] } });
  const res = await getAllocationsByUnitAndActivityType("COMP", "Lab", 1);
  expect(res).toEqual(["y"]);
});

test("getAdminAllocations builds URLSearchParams properly", async () => {
  mockedAxios.get.mockResolvedValueOnce({ data: { ok: 1 } });
  await getAdminAllocations({ page: 2, limit: 10, q: "x", unitCode: "COMP" });
  expect(mockedAxios.get).toHaveBeenCalledWith(
    expect.stringContaining("/admin/allocations?"),
  );
});

test("getCurrentUser uses withCredentials", async () => {
  mockedAxios.get.mockResolvedValueOnce({ data: { userId: "1" } });
  const res = await getCurrentUser();
  expect(mockedAxios.get).toHaveBeenCalledWith("/auth/me", {
    withCredentials: true,
  });
  expect(res.userId).toBe("1");
});

/* --------------------------- Mutations (axios) --------------------------- */

test("patchAdminAllocation, importAdminData, rollbackRun etc return data", async () => {
  mockedAxios.patch.mockResolvedValueOnce({ data: { ok: 1 } });
  const payload: SaveAllocationPayload = {
    unit_code: "COMP1511",
    activity_type: "Tutorial",
    session_date: "2025-05-01",
    start_at: "10:00",
    end_at: "12:00",
    location: "K17-201",
    status: "Confirmed",
    note: "Mock payload for test",
  };
  expect(await patchAdminAllocation(1, payload)).toEqual({ ok: 1 });

  mockedAxios.post.mockResolvedValueOnce({ data: { done: true } });
  expect(await importAdminData(new FormData())).toEqual({ done: true });

  mockedAxios.post.mockResolvedValueOnce({ data: { rolled: true } });
  expect(await rollbackRun(5)).toEqual({ rolled: true });

  mockedAxios.post.mockResolvedValueOnce({ data: { committed: true } });
  expect(await commitImport(9)).toEqual({ committed: true });

  mockedAxios.post.mockResolvedValueOnce({ data: { discarded: true } });
  expect(await discardImport(2)).toEqual({ discarded: true });

  mockedAxios.get.mockResolvedValueOnce({ data: { preview: true } });
  expect(await getPreview(8)).toEqual({ preview: true });

  mockedAxios.get.mockResolvedValueOnce({ data: { staged: [], runs: [] } });
  expect(await getImportHistory()).toEqual({ staged: [], runs: [] });
});

/* ----------------------- Unscheduled Allocations ------------------------ */

test("createUnscheduledAllocation posts and returns data", async () => {
  mockedAxios.post.mockResolvedValueOnce({ data: { allocationId: 10 } });
  const res = await createUnscheduledAllocation({
    offeringId: 1,
    tutorId: 2,
    hours: 3,
    note: "ok",
  });
  expect(mockedAxios.post).toHaveBeenCalledWith(
    "/allocations/unscheduled",
    expect.any(Object),
  );
  expect(res.allocationId).toBe(10);
});

test("updateUnscheduledAllocation and deleteUnscheduledAllocation use fetch", async () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    json: async () => ({ updated: true }),
  });
  const r = await updateUnscheduledAllocation(1, { note: "a" });
  expect(r.updated).toBe(true);

  (global.fetch as jest.Mock).mockResolvedValueOnce({
    json: async () => ({ deleted: true }),
  });
  const d = await deleteUnscheduledAllocation(5);
  expect(d.deleted).toBe(true);
});

test("getUnscheduledAllocations uses fetch and returns json", async () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    json: async () => [{ a: 1 }],
  });
  const r = await getUnscheduledAllocations(9, "Lab");
  expect(global.fetch).toHaveBeenCalledWith(
    "/api/allocations/unscheduled?offeringId=9&activityType=Lab",
  );
  expect(r[0].a).toBe(1);
});

test("getUnscheduledAllocationsByOffering calls axios with params", async () => {
  mockedAxios.get.mockResolvedValueOnce({ data: [{ allocation_id: 1 }] });
  const res = await getUnscheduledAllocationsByOffering(3, "Marking");
  expect(mockedAxios.get).toHaveBeenCalledWith("/allocations/unscheduled", {
    params: { offeringId: 3, activityType: "Marking" },
  });
  expect(res[0].allocation_id).toBe(1);
});

/* ---------------- UC-level combined unscheduled allocations -------------- */

test("getAllUnscheduledAllocationsForUC returns merged data", async () => {
  getCoordinatorUnits.mockResolvedValueOnce([
    { offering_id: 1 },
    { offering_id: 2 },
  ]);
  getUnitOffering.mockResolvedValueOnce({
    offeringId: 1,
    unitCode: "COMP1",
    unitName: "A",
    year: 2024,
    session: "T1",
  });
  getUnitOffering.mockResolvedValueOnce({
    offeringId: 2,
    unitCode: "COMP2",
    unitName: "B",
    year: 2024,
    session: "T1",
  });
  mockedAxios.get
    .mockResolvedValueOnce({ data: [{ last_name: "Z", unitCode: "COMP1" }] })
    .mockResolvedValueOnce({ data: [{ last_name: "A", unitCode: "COMP2" }] });

  const merged = await getAllUnscheduledAllocationsForUC("Marking");
  expect(merged.length).toBe(2);
  expect(merged[0].unitCode).toBe("COMP1");
});

test("getAllUnscheduledAllocationsForUC handles no offerings", async () => {
  getCoordinatorUnits.mockResolvedValueOnce([]);
  const res = await getAllUnscheduledAllocationsForUC();
  expect(res).toEqual([]);
});

test("getAllUnscheduledAllocationsForUC throws on error", async () => {
  const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {}); // silence console.error
  getCoordinatorUnits.mockRejectedValueOnce(new Error("fail"));

  await expect(getAllUnscheduledAllocationsForUC()).rejects.toThrow("fail");

  expect(errorSpy).toHaveBeenCalledWith(
    "Failed to fetch all UC unscheduled allocations:",
    expect.any(Error),
  );
  errorSpy.mockRestore();
});

test("getAllUnscheduledAllocationsForUC sorts by last_name when unitCode is same", async () => {
  getCoordinatorUnits.mockResolvedValueOnce([{ offering_id: 1 }]);
  getUnitOffering.mockResolvedValueOnce({
    offeringId: 1,
    unitCode: "COMP1",
    unitName: "A",
    year: 2024,
    session: "T1",
  });

  // Return multiple allocations with same unitCode but different last_name
  mockedAxios.get.mockResolvedValueOnce({
    data: [
      { last_name: "Zimmerman", unitCode: "COMP1" },
      { last_name: "Anderson", unitCode: "COMP1" },
      { last_name: "Miller", unitCode: "COMP1" },
    ],
  });

  const merged = await getAllUnscheduledAllocationsForUC("Marking");

  // Should be sorted by last_name (line 491)
  expect(merged.length).toBe(3);
  expect(merged[0].last_name).toBe("Anderson");
  expect(merged[1].last_name).toBe("Miller");
  expect(merged[2].last_name).toBe("Zimmerman");
});

/* ------------------------- normalizeStatus tests ------------------------- */

test("getFormattedAllocationById normalizes status with 'pending' substring", async () => {
  const mockData = {
    allocation_id: 1,
    user_id: 10,
    first_name: "John",
    last_name: "Doe",
    email: "john@test.com",
    unit_code: "COMP1511",
    unit_name: "Programming Fundamentals",
    start_at: "10:00:00",
    end_at: "12:00:00",
    activity_type: "Tutorial",
    activity_name: "Week 5",
    session_date: "2025-03-15",
    status: "status_pending_approval", // Contains "pending" substring (line 229)
    location: "Room 101",
    note: null,
  };

  mockedAxios.get.mockResolvedValueOnce({ data: { data: mockData } });
  const row = await getFormattedAllocationById("1");

  expect(row.status).toBe("Pending");
});

test("getFormattedAllocationById normalizes status with 'review' substring", async () => {
  const mockData = {
    allocation_id: 1,
    user_id: 10,
    first_name: "John",
    last_name: "Doe",
    email: "john@test.com",
    unit_code: "COMP1511",
    unit_name: "Programming Fundamentals",
    start_at: "10:00:00",
    end_at: "12:00:00",
    activity_type: "Tutorial",
    activity_name: "Week 5",
    session_date: "2025-03-15",
    status: "under_review", // Contains "review" substring (line 230)
    location: "Room 101",
    note: null,
  };

  mockedAxios.get.mockResolvedValueOnce({ data: { data: mockData } });
  const row = await getFormattedAllocationById("1");

  expect(row.status).toBe("Pending");
});

test("getFormattedAllocationById normalizes status with 'await' substring", async () => {
  const mockData = {
    allocation_id: 1,
    user_id: 10,
    first_name: "John",
    last_name: "Doe",
    email: "john@test.com",
    unit_code: "COMP1511",
    unit_name: "Programming Fundamentals",
    start_at: "10:00:00",
    end_at: "12:00:00",
    activity_type: "Tutorial",
    activity_name: "Week 5",
    session_date: "2025-03-15",
    status: "awaiting_confirmation", // Contains "await" substring (line 231)
    location: "Room 101",
    note: null,
  };

  mockedAxios.get.mockResolvedValueOnce({ data: { data: mockData } });
  const row = await getFormattedAllocationById("1");

  expect(row.status).toBe("Pending");
});

test("getFormattedAllocationById normalizes unknown status to Cancelled", async () => {
  const mockData = {
    allocation_id: 1,
    user_id: 10,
    first_name: "John",
    last_name: "Doe",
    email: "john@test.com",
    unit_code: "COMP1511",
    unit_name: "Programming Fundamentals",
    start_at: "10:00:00",
    end_at: "12:00:00",
    activity_type: "Tutorial",
    activity_name: "Week 5",
    session_date: "2025-03-15",
    status: "unknown_status", // Falls through to fallback (line 237)
    location: "Room 101",
    note: null,
  };

  mockedAxios.get.mockResolvedValueOnce({ data: { data: mockData } });
  const row = await getFormattedAllocationById("1");

  expect(row.status).toBe("Cancelled");
});
