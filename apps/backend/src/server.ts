import express from "express";
import cors from "cors";
import helmet from "helmet";
import { requestLogger, errorHandler, authMiddleware, correlationIdMiddleware } from "./middleware";
import routes from "./routes";

const app = express();

// ============ MIDDLEWARE SETUP ============
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(correlationIdMiddleware);
app.use(requestLogger);

// ============ PROTECTED ROUTES (REQUIRE AUTH) ============
app.use("/v1/me", authMiddleware);
app.use("/v1/onboarding", authMiddleware);
app.use("/v1/verification", authMiddleware);

// ============ ALL ROUTES ============
app.use(routes);

// ============ ERROR HANDLING ============
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`\n✅ Server running on http://localhost:${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`\n🔐 Test credentials: jane.doe@example.com / password123\n`);
});
