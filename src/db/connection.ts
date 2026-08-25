import { Pool } from "pg";
import { env } from "../config/env";
import { logger } from "../lib/logger";

const databaseUrl = env.databaseUrl;

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: env.nodeEnv === "production" ? { rejectUnauthorized: false } : undefined,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on("error", (err) => {
  logger.error({ err }, "Unexpected idle client");
});

export default pool;
