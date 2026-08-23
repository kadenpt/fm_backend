import dotenv from "dotenv";
dotenv.config();

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

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());
app.set("trust proxy", 1);

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
  console.error(err);
  return res.status(500).json({ message: "Internal server error" });
});

async function start() {
  if (process.env.JWT_SECRET == undefined) {
    throw new Error("JWT_SECRET is not set");
  }

  try {
    await pool.query("SELECT 1");
    await runMigrations();
    if (process.env.NODE_ENV !== "production") {
      await seed();
    }
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error(error);
    await pool.end().catch(() => {});
    process.exit(1);
  }
}
start();
