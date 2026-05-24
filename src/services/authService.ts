import axios from "axios";
import { apiClient } from "@/services/apiClient";
import type { ApiResponse, LoginInput, LoginResponse, UserRole } from "@/types/domain";

const accessTokenKey = "hammer_access_token";

type ApiEnvelope<T> = ApiResponse<T> | T;
export type LoginErrorCode =
  | "USER_NOT_FOUND"
  | "WRONG_PASSWORD"
  | "PLAYER_NOT_APPROVED"
  | "ROLE_NOT_ALLOWED"
  | "VALIDATION_ERROR"
  | "SERVER_ERROR";

type BackendErrorResponse = {
  success: false;
  code?: LoginErrorCode;
  message?: string;
  data: null;
};

export class LoginError extends Error {
  code: LoginErrorCode;

  constructor(code: LoginErrorCode, message: string) {
    super(message);
    this.name = "LoginError";
    this.code = code;
  }
}

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
    try {
      const response = await apiClient.post<ApiEnvelope<LoginResponse>>(`/auth/login/${role}`, input);
      const login = unwrap(response.data);
      storeAccessToken(getAccessToken(login));
      return login;
    } catch (error) {
      if (axios.isAxiosError<BackendErrorResponse>(error)) {
        const backendError = error.response?.data;
        throw new LoginError(
          backendError?.code ?? "SERVER_ERROR",
          backendError?.message ?? "Unable to log in."
        );
      }

      throw error;
    }
  },

  async logout(): Promise<void> {
    await apiClient.post("/auth/logout");
  }
};
