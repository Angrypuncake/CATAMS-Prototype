import axios from "@/lib/axios";
import { getPaycodes } from "../../app/services/paycodeService";
import type { Paycode } from "../../app/_types/paycode";

jest.mock("@/lib/axios", () => ({ get: jest.fn() }));
const mockedAxios = axios as jest.Mocked<typeof axios>;

afterEach(() => jest.resetAllMocks());

test("getPaycodes calls /admin/paycodes and returns typed list", async () => {
  const apiData: Paycode[] = [
    { code: "PC1", paycode_description: "Tutorial", amount: 50 },
    { code: "PC2", paycode_description: "Lab", amount: 55 },
  ];

  mockedAxios.get.mockResolvedValueOnce({ data: { data: apiData } });

  const res = await getPaycodes();
  expect(mockedAxios.get).toHaveBeenCalledWith("/admin/paycodes");
  expect(res).toEqual(apiData);
});

test("getPaycodes returns [] when API returns empty list", async () => {
  mockedAxios.get.mockResolvedValueOnce({ data: { data: [] } });
  const res = await getPaycodes();
  expect(res).toEqual([]);
});
