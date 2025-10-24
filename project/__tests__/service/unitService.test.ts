import axios from "@/lib/axios";
import {
  getUnitOffering,
  getCoordinatorUnits,
  type UnitOffering,
} from "@/app/services/unitService";

jest.mock("@/lib/axios", () => ({ get: jest.fn() }));
const mockedAxios = axios as jest.Mocked<typeof axios>;

afterEach(() => jest.resetAllMocks());

test("getUnitOffering calls /offerings/:id and returns data", async () => {
  const offering: UnitOffering = {
    offeringId: 123,
    courseUnitId: "CU-1",
    unitCode: "COMP1511",
    unitName: "Programming Fundamentals",
    year: 2025,
    session: "T1",
    budget: 1000,
  };

  mockedAxios.get.mockResolvedValueOnce({ data: offering });

  const res = await getUnitOffering(123);
  expect(mockedAxios.get).toHaveBeenCalledWith("/offerings/123");
  expect(res).toEqual(offering);
});

test("getCoordinatorUnits calls /uc/units and returns list", async () => {
  const api = { data: [{ offering_id: 1 }, { offering_id: 2 }] };
  mockedAxios.get.mockResolvedValueOnce({ data: api });

  const res = await getCoordinatorUnits();
  expect(mockedAxios.get).toHaveBeenCalledWith("/uc/units");
  expect(res).toEqual(api.data);
});

test("getCoordinatorUnits returns [] for empty API payload", async () => {
  mockedAxios.get.mockResolvedValueOnce({ data: { data: [] } });

  const res = await getCoordinatorUnits();
  expect(res).toEqual([]);
});
