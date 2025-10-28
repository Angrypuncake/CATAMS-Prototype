import axios from "axios";

const api = axios.create({
  baseURL: "/api", // all requests start form .api
  timeout: 15000, // 15 s timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// attach jwt tokens automatically
api.interceptors.response.use(
  (response) => response,
  (error) => {
    //  Ignore canceled requests to avoid noisy logs
    if (axios.isCancel?.(error) || error.code === "ERR_CANCELED") {
      if (process.env.NODE_ENV === "development") {
        console.debug(`[Axios] Request canceled: ${error.message}`);
      }
      return Promise.reject(error);
    }

    const isAxiosError = !!error.isAxiosError;

    const details = {
      message: error.message,
      url: error.config?.url ?? "(no URL)",
      method: error.config?.method ?? "(no method)",
      status: error.response?.status ?? "(no status)",
      data: error.response?.data ?? "(no response data)",
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      axios: isAxiosError,
    };

    console.groupCollapsed(
      `%c[API ERROR] ${details.method?.toUpperCase()} ${details.url}`,
      "color: #ff4d4d; font-weight: bold;",
    );
    try {
      console.error(JSON.stringify(details, null, 2));
    } catch {
      console.error("Non-serializable error details:", {
        message: error.message,
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
      });
    }
    console.groupEnd();

    return Promise.reject(error);
  },
);

export default api;
