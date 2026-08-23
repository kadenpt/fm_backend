import { Pool } from "pg";
import { env } from "../config/env";

const databaseUrl = env.databaseUrl;

const pool = new Pool({
  connectionString: databaseUrl,
});

export default pool;
