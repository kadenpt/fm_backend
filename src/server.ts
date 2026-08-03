import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import health from "./routes/health";
import pool from "./db/connection";
import runMigrations from "./db/migrate";
import seed from "./db/seed";

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());

app.use("/health", health);

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
