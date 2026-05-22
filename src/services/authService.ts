import { apiClient } from "@/services/apiClient";
import type { ApiResponse, LoginInput, LoginResponse, UserRole } from "@/types/domain";

const accessTokenKey = "hammer_access_token";

type ApiEnvelope<T> = ApiResponse<T> | T;

function unwrap<T>(payload: ApiEnvelope<T>): T {
  if (payload && typeof payload === "object" && "success" in payload && "data" in payload) {
    return (payload as ApiResponse<T>).data;
  }

  return payload as T;
}

function getAccessToken(response: LoginResponse): string {
  const token = response.accessToken ?? response.token ?? response.jwt;

  if (!token) {
    throw new Error("Login succeeded, but no access token was returned.");
  }

  return token;
}

export function readStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(accessTokenKey);
}

export function storeAccessToken(token: string) {
  window.localStorage.setItem(accessTokenKey, token);
}

export function clearStoredAccessToken() {
  window.localStorage.removeItem(accessTokenKey);
}

export const authService = {
  async loginByRole(input: LoginInput, role: UserRole): Promise<LoginResponse> {
    const response = await apiClient.post<ApiEnvelope<LoginResponse>>(`/auth/login/${role}`, input);
    const login = unwrap(response.data);
    storeAccessToken(getAccessToken(login));
    return login;
  }
};
