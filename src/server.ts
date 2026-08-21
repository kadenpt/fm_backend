import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { Router } from "express";

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

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());

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

async function start() {
  await pool.query("SELECT 1");
  await runMigrations();
  if (process.env.NODE_ENV !== "production") {
    await seed();
  }
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}
start();
