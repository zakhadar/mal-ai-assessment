// ============ COMMON TYPES ============
export interface HealthResponse {
  status: string;
}

// ============ ERROR TYPES ============
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: {
      fieldErrors?: Record<string, string>;
      [key: string]: any;
    };
  };
}

// ============ AUTH TYPES ============
export interface User {
  id: string;
  email: string;
  fullName: string;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  expiresAt: string; // ISO 8601 timestamp
}

export interface AuthResponse {
  user: User;
  session: Session;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

// ============ ONBOARDING TYPES ============
export interface OnboardingProfile {
  fullName: string;
  dateOfBirth: string; // ISO 8601 date
  nationality: string;
}

export interface OnboardingDocument {
  documentType: "PASSPORT" | "ID_CARD" | "DRIVER_LICENSE";
  documentNumber: string;
}

export interface OnboardingAddress {
  addressLine1: string;
  city: string;
  country: string;
}

export interface OnboardingConsents {
  termsAccepted: boolean;
}

export interface OnboardingDraft {
  profile: Partial<OnboardingProfile>;
  document: Partial<OnboardingDocument>;
  address: Partial<OnboardingAddress>;
  consents: Partial<OnboardingConsents>;
}

export interface OnboardingSubmitRequest {
  draft: OnboardingDraft;
}

export interface OnboardingSubmitResponse {
  submissionId: string;
  status: string; // "RECEIVED"
}

// ============ VERIFICATION TYPES ============
export type VerificationStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "APPROVED"
  | "REJECTED"
  | "MANUAL_REVIEW";

export interface VerificationStatusResponse {
  status: VerificationStatus;
  updatedAt: string; // ISO 8601 timestamp
  details: {
    reasons: string[];
  };
}

// ============ MOBILE STATE TYPES ============
export type AuthStatus = "logged_out" | "logging_in" | "logged_in" | "refreshing" | "expired";

export type Theme = "light" | "dark";

export type OnboardingStep = 1 | 2 | 3 | 4 | 5;

export type SubmissionState = "idle" | "submitting" | "success" | "error";

export interface AuthState {
  status: AuthStatus;
  user: User | null;
  session: Session | null;
  error: string | null;
}

export interface OnboardingState {
  draft: OnboardingDraft;
  currentStep: OnboardingStep;
  submissionState: SubmissionState;
  submissionError: string | null;
  submissionId: string | null;
}

export interface VerificationState {
  status: VerificationStatus;
  updatedAt: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface ThemeState {
  theme: Theme;
}
