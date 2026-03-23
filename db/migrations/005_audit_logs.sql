-- Sistema de auditoría para registrar todas las acciones en el sistema
-- Aplicar: npm run db:migrate

CREATE TABLE IF NOT EXISTS audit_logs (
  id text primary key default gen_random_uuid()::text,
  user_id text not null,
  username text not null,
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- View para la API
CREATE OR REPLACE VIEW audit_logs_v AS
SELECT
  id,
  user_id as "userId",
  username,
  action,
  entity_type as "entityType",
  entity_id as "entityId",
  details,
  ip_address as "ipAddress",
  user_agent as "userAgent",
  created_at as "createdAt"
FROM audit_logs;
