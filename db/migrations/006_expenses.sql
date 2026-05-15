-- Tabla para gastos y análisis financiero
-- Aplicar: npm run db:migrate

CREATE TABLE IF NOT EXISTS expenses (
  id text primary key default gen_random_uuid()::text,
  description text not null,
  category text not null check (category in ('administrativo', 'operativo', 'mantenimiento', 'insumos', 'servicios', 'otro')),
  amount double precision not null,
  date text not null,
  notes text,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

DROP TRIGGER IF EXISTS trg_expenses_updated_at ON expenses;
CREATE TRIGGER trg_expenses_updated_at
BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);

-- Vista para la API
CREATE OR REPLACE VIEW expenses_v AS
SELECT
  id,
  description,
  category,
  amount,
  date,
  notes,
  created_by as "createdBy",
  created_at as "createdAt",
  updated_at as "updatedAt"
FROM expenses;
