import axios from "@/lib/axios";
import {
  getBudgetByOfferingId,
  getAllocatedBudgetByOfferingId,
  getClaimedBudgetByOfferingId,
  getUnitBudgetRow,
  getUnitBudgetOverviews,
} from "../../app/services/budgetService";

jest.mock("@/lib/axios", () => ({
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
}));
jest.mock("@/app/services/unitService", () => ({
  getUnitOffering: jest.fn(),
  getCoordinatorUnits: jest.fn(),
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;
const { getUnitOffering, getCoordinatorUnits } = jest.requireMock("@/app/services/unitService");

beforeEach(() => {
  jest.resetAllMocks();
});

test("getBudgetByOfferingId hits correct endpoint and returns data", async () => {
  mockedAxios.get.mockResolvedValueOnce({ data: { budget: 1000 } });
  const res = await getBudgetByOfferingId(123);
  expect(mockedAxios.get).toHaveBeenCalledWith("/offerings/123/budget/total");
  expect(res).toEqual({ budget: 1000 });
});

test("getAllocatedBudgetByOfferingId hits correct endpoint and returns data", async () => {
  mockedAxios.get.mockResolvedValueOnce({ data: { allocatedAmount: 600 } });
  const res = await getAllocatedBudgetByOfferingId(5);
  expect(mockedAxios.get).toHaveBeenCalledWith("/offerings/5/budget/allocations");
  expect(res).toEqual({ allocatedAmount: 600 });
});

test("getClaimedBudgetByOfferingId hits correct endpoint and returns data", async () => {
  mockedAxios.get.mockResolvedValueOnce({ data: { totalClaimed: 420 } });
  const res = await getClaimedBudgetByOfferingId(7);
  expect(mockedAxios.get).toHaveBeenCalledWith("/offerings/7/budget/claims");
  expect(res).toEqual({ totalClaimed: 420 });
});

test("getUnitBudgetRow aggregates and computes metrics (uses API budget when present)", async () => {
  (getUnitOffering as jest.Mock).mockResolvedValueOnce({
    offeringId: 1,
    unitCode: "COMP1000",
    unitName: "Software",
    year: 2025,
    session: "T1",
    budget: 999,
  });
  mockedAxios.get
    .mockResolvedValueOnce({ data: { budget: 1000 } }) // total
    .mockResolvedValueOnce({ data: { allocatedAmount: 650 } }) // allocated
    .mockResolvedValueOnce({ data: { totalClaimed: 500 } }); // claimed

  const row = await getUnitBudgetRow(1);
  expect(row).toMatchObject({
    offeringId: 1,
    unitCode: "COMP1000",
    unitName: "Software",
    year: 2025,
    session: "T1",
    budget: 1000,
    allocated: 650,
    claimed: 500,
    variance: 500,
  });
  expect(row.pctUsed).toBeCloseTo(0.5);
});

test("getUnitBudgetRow falls back to offering.budget, then 0", async () => {
  (getUnitOffering as jest.Mock).mockResolvedValueOnce({
    offeringId: 2,
    unitCode: "MATH2000",
    unitName: "Math",
    year: 2025,
    session: "T1",
    budget: 800,
  });
  mockedAxios.get
    .mockResolvedValueOnce({ data: { budget: undefined } }) // no API budget -> use offering.budget
    .mockResolvedValueOnce({ data: { allocatedAmount: undefined } })
    .mockResolvedValueOnce({ data: { totalClaimed: 400 } });

  const rowA = await getUnitBudgetRow(2);
  expect(rowA.budget).toBe(800);
  expect(rowA.allocated).toBe(0);
  expect(rowA.claimed).toBe(400);
  expect(rowA.pctUsed).toBeCloseTo(0.5);
  expect(rowA.variance).toBe(400);

  (getUnitOffering as jest.Mock).mockResolvedValueOnce({
    offeringId: 3,
    unitCode: "PHYS1000",
    unitName: "Physics",
    year: 2025,
    session: "T1",
    budget: undefined,
  });
  mockedAxios.get
    .mockResolvedValueOnce({ data: { budget: undefined } }) // no API, no offering budget -> 0
    .mockResolvedValueOnce({ data: { allocatedAmount: 0 } })
    .mockResolvedValueOnce({ data: { totalClaimed: 0 } });

  const rowB = await getUnitBudgetRow(3);
  expect(rowB.budget).toBe(0);
  expect(rowB.allocated).toBe(0);
  expect(rowB.claimed).toBe(0);
  expect(rowB.pctUsed).toBe(0);
  expect(rowB.variance).toBe(0);
});

test("getUnitBudgetRow logs and rethrows on error", async () => {
  const errSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  (getUnitOffering as jest.Mock).mockRejectedValueOnce(new Error("boom"));
  await expect(getUnitBudgetRow(99)).rejects.toThrow("boom");
  expect(errSpy).toHaveBeenCalled();
  errSpy.mockRestore();
});

test("getUnitBudgetOverviews aggregates rows and emits alerts at threshold", async () => {
  (getCoordinatorUnits as jest.Mock).mockResolvedValueOnce([
    { offering_id: 10 },
    { offering_id: 20 },
  ]);

  (getUnitOffering as jest.Mock)
    .mockResolvedValueOnce({
      offeringId: 10,
      unitCode: "COMP1",
      unitName: "A",
      year: 2025,
      session: "T1",
      budget: 1000,
    })
    .mockResolvedValueOnce({
      offeringId: 20,
      unitCode: "COMP2",
      unitName: "B",
      year: 2025,
      session: "T1",
      budget: 1000,
    });

  mockedAxios.get
    // offering 10
    .mockResolvedValueOnce({ data: { budget: 1000 } })
    .mockResolvedValueOnce({ data: { allocatedAmount: 800 } })
    .mockResolvedValueOnce({ data: { totalClaimed: 950 } })
    // offering 20
    .mockResolvedValueOnce({ data: { budget: 1000 } })
    .mockResolvedValueOnce({ data: { allocatedAmount: 300 } })
    .mockResolvedValueOnce({ data: { totalClaimed: 300 } });

  const overview = await getUnitBudgetOverviews(2025, "T1", 0.9);
  expect(overview.year).toBe(2025);
  expect(overview.session).toBe("T1");
  expect(overview.rows).toHaveLength(2);

  const [r1, r2] = overview.rows;
  expect(r1.unitCode).toBe("COMP1");
  expect(r1.pctUsed).toBeCloseTo(0.95);
  expect(r2.unitCode).toBe("COMP2");
  expect(r2.pctUsed).toBeCloseTo(0.3);

  expect(overview.alerts).toBeDefined();
  expect(overview.alerts!.length).toBe(1);
  expect(overview.alerts![0]).toMatchObject({
    offeringId: 10,
    unitCode: "COMP1",
  });
});

test("getUnitBudgetOverviews returns empty when no offerings", async () => {
  (getCoordinatorUnits as jest.Mock).mockResolvedValueOnce([]);
  const o = await getUnitBudgetOverviews(2025, "T1", 0.9);
  expect(o.rows).toEqual([]);
  expect(o.alerts).toBeUndefined();
  expect(mockedAxios.get).not.toHaveBeenCalled();
  expect(getUnitOffering).not.toHaveBeenCalled();
});

test("getUnitBudgetOverviews logs and rethrows on error", async () => {
  const errSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  (getCoordinatorUnits as jest.Mock).mockRejectedValueOnce(new Error("fail"));
  await expect(getUnitBudgetOverviews(2025, "T1")).rejects.toThrow("fail");
  expect(errSpy).toHaveBeenCalledWith("Failed to compile UC budget overview:", expect.any(Error));
  errSpy.mockRestore();
});
