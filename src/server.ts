import dotenv from "dotenv";
dotenv.config();

import { env } from "./config/env";

import express from "express";
import cors from "cors";
import { NextFunction, Request, Response, Router } from "express";

import pool from "./db/connection";
import runMigrations from "./db/migrate";
import seed from "./db/seed";
import { requireAuth } from "./middleware/requireAuth";
import { apiLimiter, authLimiter } from "./middleware/rateLimit";

import health from "./routes/health";
import auth from "./routes/auth";
import users from "./routes/users";
import exercises from "./routes/exercises";
import userExercises from "./routes/userExercises";
import journals from "./routes/journals";
import messages from "./routes/messages";
import habitGoals from "./routes/habitGoals";
import habits from "./routes/habits";
import { AppError } from "./error";
import { logger } from "./lib/logger";
import { requestLog } from "./middleware/requestLog";

const app = express();

app.set("trust proxy", 1);
app.use(cors());
app.use(express.json());
app.use(requestLog);

const api = Router();

api.use("/auth", authLimiter, auth);
api.use("/users", requireAuth, users);
api.use("/exercises", requireAuth, exercises);
api.use("/userExercises", requireAuth, userExercises);
api.use("/journals", requireAuth, journals);
api.use("/messages", requireAuth, messages);
api.use("/habitGoals", requireAuth, habitGoals);
api.use("/habits", requireAuth, habits);

app.use("/health", health);
app.use("/api", apiLimiter, api);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  logger.error({ err }, "Unhandled error");
  return res.status(500).json({ message: "Internal server error" });
});

async function start() {
  try {
    await pool.query("SELECT 1");
    logger.info("Database connection established");
    await runMigrations();
    if (env.nodeEnv !== "production") {
      await seed();
    }
    app.listen(env.port, () => logger.info({ port: env.port }, "Server listening"));
  } catch (error) {
    logger.error({ err: error }, "Failed to start server");
    await pool.end().catch(() => {});
    process.exit(1);
  }
}
start();
