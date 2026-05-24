import axios from "axios";

const accessTokenKey = "hammer_access_token";
let isRedirectingToLogin = false;

export const apiClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"}/api`,
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json"
  }
});

apiClient.interceptors.request.use((config) => {
  if (typeof window === "undefined") {
    return config;
  }

  const token = window.localStorage.getItem("hammer_access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      typeof window !== "undefined" &&
      !window.location.pathname.startsWith("/login") &&
      !isRedirectingToLogin
    ) {
      isRedirectingToLogin = true;
      window.localStorage.removeItem(accessTokenKey);

      const currentPath = `${window.location.pathname}${window.location.search}`;
      const nextPath = currentPath.startsWith("/login") ? "/dashboard" : currentPath;
      window.location.replace(`/login?next=${encodeURIComponent(nextPath)}`);
    }

    return Promise.reject(error);
  }
);
