import { Request, Response, NextFunction } from "express";
import { ApiErrorResponse } from "@mal-assessment/shared";
import { db } from "./db";
import { randomUUID } from "crypto";

export interface AuthRequest extends Request {
  userId?: string;
  accessToken?: string;
  requestId?: string;
}

// ============ CORRELATION ID MIDDLEWARE ============
export const correlationIdMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  req.requestId = req.headers["x-request-id"] as string || randomUUID().substring(0, 8);
  res.setHeader("X-Request-ID", req.requestId);
  next();
};

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
  req: AuthRequest,
  res: Response,
  _next: NextFunction
) => {
  const requestId = req.requestId || "unknown";
  
  console.error(`[${requestId}] [Error]`, err.message, {
    code: err.code,
    statusCode: err.statusCode,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

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
  const requestId = req.requestId || "unknown";
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn(`[${requestId}] Missing or invalid authorization header`);
    return next(
      new ApiError("UNAUTHORIZED", "Missing or invalid authorization header", 401)
    );
  }

  const accessToken = authHeader.slice(7); // Remove "Bearer " prefix
  const validation = db.validateAccessToken(accessToken);

  if (!validation) {
    console.warn(`[${requestId}] Invalid access token`);
    return next(new ApiError("UNAUTHORIZED", "Invalid access token", 401));
  }

  if (validation.isExpired) {
    console.warn(`[${requestId}] Access token has expired for user ${validation.userId}`);
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
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();
  const requestId = randomUUID().substring(0, 8);
  req.requestId = requestId;

  res.on("finish", () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? "WARN" : "INFO";
    console.log(
      `[${logLevel}] [${requestId}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`
    );
  });

  next();
};
