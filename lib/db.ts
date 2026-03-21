import { Pool } from "pg";

const globalForPool = global as any;

const pool =
  globalForPool.pool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPool.pool = pool;
}

export default pool;