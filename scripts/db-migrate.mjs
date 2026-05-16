/**
 * Aplica db/migrations/*.sql en orden contra DATABASE_URL (.env en la raíz).
 * Uso: npm run db:migrate
 */
import { config } from "dotenv";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

config({ path: join(root, ".env") });

const url = process.env.DATABASE_URL?.trim();
if (!url) {
  console.error("Falta DATABASE_URL en .env");
  process.exit(1);
}

const files = [
  "001_init.sql",
  "002_seed.sql",
  "003_password_resets.sql",
  "004_add_email_to_auth_users.sql",
  "005_audit_logs.sql",
  "006_expenses.sql",
  "007_update_role_check.sql",
];
const client = new pg.Client({ connectionString: url });

try {
  await client.connect();
  for (const name of files) {
    const full = join(root, "db", "migrations", name);
    const sql = readFileSync(full, "utf8");
    await client.query(sql);
    console.log("OK:", name);
  }
  console.log("\nBase lista. Usuario: admin / Contraseña: admin123 (cámbiala).");
} catch (e) {
  console.error("Error aplicando migraciones:", e.message);
  if (e.code === "42P01") {
    console.error(
      "\nPista: si falla a medias, revisa que la base exista: createdb chuichun_db",
    );
  }
  process.exit(1);
} finally {
  await client.end().catch(() => {});
}
