-- Agregar columna email a auth_users
-- Aplicar: npm run db:migrate

ALTER TABLE auth_users ADD COLUMN IF NOT EXISTS email VARCHAR(100);
