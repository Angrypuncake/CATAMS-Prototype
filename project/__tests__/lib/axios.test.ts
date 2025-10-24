import api from "@/lib/axios";
import type {
  AxiosAdapter,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

type TestAxiosError = Error & {
  isAxiosError?: boolean;
  config?: { url?: string; method?: string };
  response?: { status?: number; data?: unknown };
};

function setAdapter(
  fn: (config: InternalAxiosRequestConfig) => Promise<AxiosResponse>,
) {
  api.defaults.adapter = fn as unknown as AxiosAdapter;
}

function getHeaderValue(headers: unknown, key: string): string | undefined {
  if (!headers || typeof headers !== "object") return undefined;

  // AxiosHeaders case
  const maybeHeadersWithGet = headers as { get?: (k: string) => unknown };
  if (typeof maybeHeadersWithGet.get === "function") {
    const v = maybeHeadersWithGet.get(key);
    return typeof v === "string" ? v : undefined;
  }

  const obj = headers as Record<string, unknown>;
  const lower = key.toLowerCase();

  let v = obj[key] ?? obj[lower];
  if (
    v === undefined &&
    typeof obj.common === "object" &&
    obj.common !== null
  ) {
    const common = obj.common as Record<string, unknown>;
    v = common[key] ?? common[lower];
  }
  return typeof v === "string" ? v : undefined;
}

describe("axios instance (/lib/axios)", () => {
  const originalAdapter = api.defaults.adapter;

  beforeEach(() => {
    api.defaults.adapter = originalAdapter;
    localStorage.clear();
    jest.spyOn(console, "groupCollapsed").mockImplementation(() => {});
    jest.spyOn(console, "groupEnd").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    (console.groupCollapsed as jest.Mock).mockRestore();
    (console.groupEnd as jest.Mock).mockRestore();
    (console.error as jest.Mock).mockRestore();
  });

  test("has correct defaults (baseURL, timeout)", () => {
    expect(api.defaults.baseURL).toBe("/api");
    expect(api.defaults.timeout).toBe(10_000);
  });

  test("request interceptor adds Authorization header when token exists", async () => {
    localStorage.setItem("token", "abc123");

    const adapter = jest.fn(
      async (
        config: InternalAxiosRequestConfig,
      ): Promise<AxiosResponse<{ ok: true }>> => {
        const auth = getHeaderValue(config.headers, "Authorization");
        const ct =
          getHeaderValue(config.headers, "Content-Type") ??
          getHeaderValue(config.headers, "content-type");

        expect(auth).toBe("Bearer abc123");
        expect(ct).toBe("application/json");

        return {
          data: { ok: true },
          status: 200,
          statusText: "OK",
          headers: {},
          config,
        };
      },
    );
    setAdapter(adapter);

    const res = await api.get<{ ok: true }>("/test");
    expect(res.data).toEqual({ ok: true });
    expect(adapter).toHaveBeenCalled();
  });

  test("request interceptor does not add Authorization when no token", async () => {
    const adapter = jest.fn(
      async (
        config: InternalAxiosRequestConfig,
      ): Promise<AxiosResponse<{ ok: true }>> => {
        const auth = getHeaderValue(config.headers, "Authorization");
        expect(auth).toBeUndefined();

        return {
          data: { ok: true },
          status: 200,
          statusText: "OK",
          headers: {},
          config,
        };
      },
    );
    setAdapter(adapter);

    const res = await api.get<{ ok: true }>("/no-auth");
    expect(res.data).toEqual({ ok: true });
    expect(adapter).toHaveBeenCalled();
  });

  test("response interceptor logs details and rejects on error", async () => {
    const err: TestAxiosError = new Error("Boom");
    err.isAxiosError = true;
    err.config = { url: "/oops", method: "get" };
    err.response = { status: 500, data: { message: "fail" } };

    const adapter = jest.fn(async () => Promise.reject(err));
    setAdapter(adapter);

    await expect(api.get("/oops")).rejects.toThrow("Boom");

    expect(console.groupCollapsed).toHaveBeenCalledWith(
      expect.stringMatching(/^\%c\[API ERROR\] GET \/oops$/),
      expect.any(String),
    );
    expect(console.error).toHaveBeenCalled();
    expect(console.groupEnd).toHaveBeenCalled();
  });

  test("response interceptor falls back when JSON.stringify(details) throws", async () => {
    const err: TestAxiosError = new Error("Boom2");
    err.isAxiosError = true;
    err.config = { url: "/oops2", method: "get" };

    const circular: { self?: unknown } = {};
    circular.self = circular;
    err.response = { status: 500, data: circular };

    const adapter = jest.fn(async () => Promise.reject(err));
    setAdapter(adapter);

    await expect(api.get("/oops2")).rejects.toThrow("Boom2");

    const calls = (console.error as jest.Mock).mock.calls;
    const fallbackCall = calls.find(
      (args) =>
        args[0] === "Non-serializable error details:" &&
        args[1] &&
        typeof args[1] === "object",
    );

    expect(fallbackCall).toBeTruthy();
    const fallbackObj = fallbackCall![1] as Record<string, unknown>;
    expect(fallbackObj).toMatchObject({
      message: "Boom2",
      url: "/oops2",
      method: "get",
      status: 500,
    });
  });

  test("response interceptor includes correct details (serializable path)", async () => {
    const err: TestAxiosError = new Error("Boom-serializable");
    err.isAxiosError = true;
    err.config = { url: "/serial", method: "post" };
    err.response = { status: 404, data: { reason: "not found" } };

    const adapter = jest.fn(async () => Promise.reject(err));
    setAdapter(adapter);

    await expect(api.post("/serial", { x: 1 })).rejects.toThrow(
      "Boom-serializable",
    );

    const call = (console.error as jest.Mock).mock.calls.find(
      ([arg0]) => typeof arg0 === "string" && arg0.startsWith("{"),
    );
    expect(call).toBeTruthy();

    const details = JSON.parse(call![0] as string) as Record<string, unknown>;
    expect(details).toMatchObject({
      message: "Boom-serializable",
      url: "/serial",
      method: "post",
      status: 404,
      data: { reason: "not found" },
      axios: true,
    });
  });

  test("sets default Content-Type header at instance creation", () => {
    const hdrs = api.defaults.headers as unknown;
    const asObj = (v: unknown): v is Record<string, unknown> =>
      typeof v === "object" && v !== null;

    const val =
      (asObj(hdrs) && typeof hdrs["Content-Type"] === "string"
        ? (hdrs["Content-Type"] as string)
        : undefined) ??
      (asObj(hdrs) && typeof hdrs["content-type"] === "string"
        ? (hdrs["content-type"] as string)
        : undefined) ??
      (asObj(hdrs) &&
      asObj((hdrs as Record<string, unknown>).common) &&
      typeof (hdrs as Record<string, { [k: string]: unknown }>).common[
        "Content-Type"
      ] === "string"
        ? ((hdrs as Record<string, { [k: string]: unknown }>).common[
            "Content-Type"
          ] as string)
        : undefined) ??
      (asObj(hdrs) &&
      asObj((hdrs as Record<string, unknown>).common) &&
      typeof (hdrs as Record<string, { [k: string]: unknown }>).common[
        "content-type"
      ] === "string"
        ? ((hdrs as Record<string, { [k: string]: unknown }>).common[
            "content-type"
          ] as string)
        : undefined);

    expect(val).toBe("application/json");
  });

  test("response interceptor fills all fallback values via ?? when fields are missing", async () => {
    const err: TestAxiosError = new Error("Bare error with missing props");
    err.isAxiosError = undefined; // ensure falsey
    // no config, no response

    const adapter = jest.fn(async () => Promise.reject(err));
    setAdapter(adapter);

    await expect(api.get("/whatever")).rejects.toThrow(
      "Bare error with missing props",
    );

    const jsonCall = (console.error as jest.Mock).mock.calls.find(
      ([arg0]) => typeof arg0 === "string" && arg0.startsWith("{"),
    );
    expect(jsonCall).toBeTruthy();

    const details = JSON.parse(jsonCall![0] as string) as Record<
      string,
      unknown
    >;
    expect(details).toEqual({
      message: "Bare error with missing props",
      url: "(no URL)",
      method: "(no method)",
      status: "(no status)",
      data: "(no response data)",
      axios: false,
    });

    expect(console.groupCollapsed).toHaveBeenCalledWith(
      expect.stringMatching(/\[API ERROR] \(NO METHOD\) \(no URL\)$/),
      expect.any(String),
    );
    expect(console.groupEnd).toHaveBeenCalled();
  });
});
