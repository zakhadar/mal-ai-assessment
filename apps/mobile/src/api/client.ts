import { API_URL } from "../config";
import { useAuthStore } from "../stores/authStore";
import {
  LoginRequest,
  AuthResponse,
  RefreshRequest,
  User,
  OnboardingSubmitRequest,
  OnboardingSubmitResponse,
  VerificationStatusResponse,
  ApiErrorResponse,
  Session,
} from "@mal-assessment/shared";

export class ApiClient {
  private static instance: ApiClient;

  private constructor() {}

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: any,
    options?: { skipAuth?: boolean; skipRefresh?: boolean }
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const authState = useAuthStore.getState();
    if (authState.session?.accessToken && !options?.skipAuth) {
      headers["Authorization"] = `Bearer ${authState.session.accessToken}`;
    }

    const response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    // Handle 401 Unauthorized - try refresh-then-retry
    if (response.status === 401 && !options?.skipRefresh) {
      const errorCode = (data as ApiErrorResponse)?.error?.code;

      if (errorCode === "TOKEN_EXPIRED" || errorCode === "UNAUTHORIZED") {
        // Attempt refresh once
        const refreshSuccess = await this.attemptRefresh();
        if (refreshSuccess) {
          // Retry original request once
          return this.request(method, path, body, {
            ...options,
            skipRefresh: true,
          });
        } else {
          // Refresh failed - logout
          useAuthStore.getState().setExpired();
          throw new Error("Session expired. Please log in again.");
        }
      }
    }

    if (!response.ok) {
      throw data;
    }

    return data;
  }

  private async attemptRefresh(): Promise<boolean> {
    try {
      const authState = useAuthStore.getState();
      if (!authState.session?.refreshToken) {
        return false;
      }

      useAuthStore.getState().setRefreshing();

      const refreshRequest: RefreshRequest = {
        refreshToken: authState.session.refreshToken,
      };

      const session = await this.request(
        "POST",
        "/v1/auth/refresh",
        refreshRequest,
        { skipAuth: true, skipRefresh: true }
      );

      useAuthStore.getState().setSession(session as Session);
      return true;
    } catch {
      useAuthStore.getState().setExpired();
      return false;
    }
  }

  // Auth methods
  async login(email: string, password: string): Promise<AuthResponse> {
    const request: LoginRequest = { email, password };
    return this.request("POST", "/v1/auth/login", request, { skipAuth: true });
  }

  async getMe(): Promise<User> {
    return this.request("GET", "/v1/me");
  }

  // Onboarding methods
  async submitOnboarding(request: OnboardingSubmitRequest): Promise<OnboardingSubmitResponse> {
    return this.request("POST", "/v1/onboarding/submit", request);
  }

  // Verification methods
  async getVerificationStatus(): Promise<VerificationStatusResponse> {
    return this.request("GET", "/v1/verification/status");
  }
}

export const apiClient = ApiClient.getInstance();
