import pool from "./connection";
import fs from "fs";
import path from "path";
import { logger } from "../lib/logger";

const migrationsDir = path.join(process.cwd(), "migrations");

export default async function runMigrations() {
  logger.info("Running migrations...");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const appliedResult = await pool.query<{ id: string }>(
    "SELECT id FROM migrations ORDER BY id ASC"
  );
  const applied = new Set(appliedResult.rows.map((row) => row.id));

  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    if (applied.has(file)) {
      logger.info(`Skipping migration ${file}`);
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8").trim();
    if (!sql) {
      logger.info(`Skipping empty migration ${file}`);
      continue;
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO migrations (id) VALUES ($1)", [file]);
      await client.query("COMMIT");
      logger.info(`Migration ${file} completed`);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  logger.info("Migrations completed");
}
