-- Agregar tabla para recuperación de contraseñas
-- Aplicar: npm run db:migrate

CREATE TABLE IF NOT EXISTS password_resets (
  id text primary key default gen_random_uuid()::text,
  email text not null,
  token text not null,
  expires_at timestamptz not null,
  used boolean not null default false,
  created_at timestamptz not null default now()
);

CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email);
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);

-- View para la API
CREATE OR REPLACE VIEW password_resets_v AS
SELECT
  id,
  email,
  token,
  expires_at as "expiresAt",
  used as "used",
  created_at as "createdAt"
FROM password_resets;
