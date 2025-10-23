import axios from "@/lib/axios";
import { getActivityOccurrences } from "../../app/services/activityService";

jest.mock("@/lib/axios", () => ({
  get: jest.fn(),
}));

describe("getActivityOccurrences", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("calls axios.get with the correct endpoint", async () => {
    (axios.get as jest.Mock).mockResolvedValueOnce({
      data: { data: [{ id: 1, name: "Occ1" }] },
    });

    const result = await getActivityOccurrences(123);

    expect(axios.get).toHaveBeenCalledWith("/admin/activities/123/occurrences");
    expect(result).toEqual([{ id: 1, name: "Occ1" }]);
  });

  it("returns an empty array when data.data is missing", async () => {
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: {} });

    const result = await getActivityOccurrences(99);
    expect(result).toEqual([]);
  });

  it("returns an empty array when data.data is null", async () => {
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: { data: null } });

    const result = await getActivityOccurrences(42);
    expect(result).toEqual([]);
  });
});
