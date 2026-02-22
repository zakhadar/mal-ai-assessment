import { Router } from "express";
import { AuthRequest, ApiError } from "./middleware";
import { db } from "./db";
import {
  LoginRequest,
  RefreshRequest,
  OnboardingSubmitRequest,
} from "@mal-assessment/shared";

const router = Router();

// ============ HEALTH CHECK ============
router.get("/health", (_req, res) => {
  res.json({ status: "OK" });
});

// ============ AUTH ROUTES ============
router.post("/v1/auth/login", (req: AuthRequest, res, next) => {
  try {
    const { email, password } = req.body as LoginRequest;

    // Validate input
    if (!email || !password) {
      throw new ApiError(
        "VALIDATION_ERROR",
        "Email and password are required",
        400,
        {
          fieldErrors: {
            ...((!email || typeof email !== "string") && {
              email: "Email is required",
            }),
            ...((!password || typeof password !== "string") && {
              password: "Password is required",
            }),
          },
        }
      );
    }

    // Find user
    const user = db.getUserByEmail(email);
    if (!user) {
      throw new ApiError("INVALID_CREDENTIALS", "Invalid email or password", 401);
    }

    // Validate password (in real app: use bcrypt)
    if (user.passwordHash !== password) {
      throw new ApiError("INVALID_CREDENTIALS", "Invalid email or password", 401);
    }

    // Create session
    const session = db.createSession(user.id);
    const safeUser = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
    };

    res.json({
      user: safeUser,
      session,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/v1/auth/refresh", (req: AuthRequest, res, next) => {
  try {
    const { refreshToken } = req.body as RefreshRequest;

    if (!refreshToken) {
      throw new ApiError("VALIDATION_ERROR", "Refresh token is required", 400, {
        fieldErrors: { refreshToken: "Required" },
      });
    }

    const session = db.refreshAccessToken(refreshToken);
    if (!session) {
      throw new ApiError(
        "INVALID_REFRESH_TOKEN",
        "Invalid or expired refresh token",
        401
      );
    }

    res.json(session);
  } catch (err) {
    next(err);
  }
});

// ============ USER ROUTES ============
router.get("/v1/me", (req: AuthRequest, res, next) => {
  try {
    if (!req.userId) {
      throw new ApiError("UNAUTHORIZED", "User ID not found", 401);
    }

    const user = db.getUserById(req.userId);
    if (!user) {
      throw new ApiError("USER_NOT_FOUND", "User not found", 404);
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
});

// ============ ONBOARDING ROUTES ============
router.post("/v1/onboarding/submit", (req: AuthRequest, res, next) => {
  try {
    if (!req.userId) {
      throw new ApiError("UNAUTHORIZED", "User ID not found", 401);
    }

    const { draft } = req.body as OnboardingSubmitRequest;

    if (!draft) {
      throw new ApiError("VALIDATION_ERROR", "Draft is required", 400, {
        fieldErrors: { draft: "Required" },
      });
    }

    // Basic server-side validation
    const fieldErrors: Record<string, string> = {};

    // Profile validation
    if (!draft.profile?.fullName) {
      fieldErrors["profile.fullName"] = "Full name is required";
    }
    if (!draft.profile?.dateOfBirth) {
      fieldErrors["profile.dateOfBirth"] = "Date of birth is required";
    }
    if (!draft.profile?.nationality) {
      fieldErrors["profile.nationality"] = "Nationality is required";
    }

    // Document validation
    if (!draft.document?.documentType) {
      fieldErrors["document.documentType"] = "Document type is required";
    }
    if (!draft.document?.documentNumber) {
      fieldErrors["document.documentNumber"] = "Document number is required";
    }

    // Address validation
    if (!draft.address?.addressLine1) {
      fieldErrors["address.addressLine1"] = "Address line 1 is required";
    }
    if (!draft.address?.city) {
      fieldErrors["address.city"] = "City is required";
    }
    if (!draft.address?.country) {
      fieldErrors["address.country"] = "Country is required";
    }

    // Consents validation
    if (!draft.consents?.termsAccepted) {
      fieldErrors["consents.termsAccepted"] = "Terms must be accepted";
    }

    if (Object.keys(fieldErrors).length > 0) {
      throw new ApiError("VALIDATION_ERROR", "Invalid submission", 400, {
        fieldErrors,
      });
    }

    // Submit
    const submissionId = db.submitOnboarding(req.userId, draft);

    res.json({
      submissionId,
      status: "RECEIVED",
    });
  } catch (err) {
    next(err);
  }
});

// ============ VERIFICATION ROUTES ============
router.get("/v1/verification/status", (req: AuthRequest, res, next) => {
  try {
    if (!req.userId) {
      throw new ApiError("UNAUTHORIZED", "User ID not found", 401);
    }

    const status = db.getVerificationStatus(req.userId);
    res.json(status);
  } catch (err) {
    next(err);
  }
});

export default router;
