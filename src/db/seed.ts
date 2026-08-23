import pool from "./connection";
import fs from "fs";
import path from "path";
import { logger } from "../lib/logger";

const seedsDir = path.join(process.cwd(), "seeds");

export default async function seed() {
  logger.info("Seeding database...");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS seeds (
      id TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const appliedResult = await pool.query<{ id: string }>(
    "SELECT id FROM seeds ORDER BY id ASC"
  );
  const applied = new Set(appliedResult.rows.map((row) => row.id));

  const files = fs
    .readdirSync(seedsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    if (applied.has(file)) {
      logger.info(`Skipping seed ${file}`);
      continue;
    }

    const sql = fs.readFileSync(path.join(seedsDir, file), "utf8").trim();
    if (!sql) {
      logger.info(`Skipping empty seed ${file}`);
      continue;
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO seeds (id) VALUES ($1)", [file]);
      await client.query("COMMIT");
      logger.info(`Seed ${file} completed`);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  logger.info("Seeding completed");
}
