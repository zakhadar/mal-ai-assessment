import { Request, Response, NextFunction } from "express";
import { ApiErrorResponse } from "@mal-assessment/shared";
import { db } from "./db";

export interface AuthRequest extends Request {
  userId?: string;
  accessToken?: string;
}

// ============ ERROR HANDLER ============
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400,
    public details?: { fieldErrors?: Record<string, string>; [key: string]: any }
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error("[Error]", err);

  if (err instanceof ApiError) {
    const response: ApiErrorResponse = {
      error: {
        code: err.code,
        message: err.message,
      },
    };
    if (err.details) {
      response.error.details = err.details;
    }
    return res.status(err.statusCode).json(response);
  }

  // Fallback for unexpected errors
  res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
    },
  });
};

// ============ AUTH MIDDLEWARE ============
export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(
      new ApiError("UNAUTHORIZED", "Missing or invalid authorization header", 401)
    );
  }

  const accessToken = authHeader.slice(7); // Remove "Bearer " prefix
  const validation = db.validateAccessToken(accessToken);

  if (!validation) {
    return next(new ApiError("UNAUTHORIZED", "Invalid access token", 401));
  }

  if (validation.isExpired) {
    return next(
      new ApiError("TOKEN_EXPIRED", "Access token has expired", 401)
    );
  }

  req.userId = validation.userId;
  req.accessToken = accessToken;
  next();
};

// ============ REQUEST LOGGER ============
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `[${req.method}] ${req.path} - ${res.statusCode} (${duration}ms)`
    );
  });
  next();
};
