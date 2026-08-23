import { Pool } from "pg";
import dotenv from "dotenv";
import { logger } from "../lib/logger";

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  logger.error("DATABASE_URL environment variable is not set");
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
});

export default pool;
