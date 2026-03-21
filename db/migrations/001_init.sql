-- Schema para la API Next.js + pg.
-- Requiere PostgreSQL 13+ (gen_random_uuid() sin extensión pgcrypto).
-- Aplicar: npm run db:migrate   o   psql "$DATABASE_URL" -f db/migrations/001_init.sql

-- ─── Auth users ─────────────────────────────────────────────────────────────
create table if not exists auth_users (
  id text primary key default gen_random_uuid()::text,
  username text not null unique,
  password text not null,
  name text not null,
  role text not null check (role in ('admin', 'user')) default 'user',
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Keep updated_at fresh.
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_auth_users_updated_at on auth_users;
create trigger trg_auth_users_updated_at
before update on auth_users
for each row execute procedure set_updated_at();

-- ─── Settings ───────────────────────────────────────────────────────────────
create table if not exists settings (
  key text primary key,
  value text not null
);

-- ─── Members ────────────────────────────────────────────────────────────────
create table if not exists members (
  id text primary key default gen_random_uuid()::text,
  cedula text not null unique,
  name text not null,
  email text not null,
  phone text not null,
  hectares double precision not null,
  location text not null,
  description text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_members_updated_at on members;
create trigger trg_members_updated_at
before update on members
for each row execute procedure set_updated_at();

-- ─── Events ─────────────────────────────────────────────────────────────────
create table if not exists events (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  type text not null check (type in ('meeting', 'work')),
  date text not null,
  amount double precision not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_events_updated_at on events;
create trigger trg_events_updated_at
before update on events
for each row execute procedure set_updated_at();

-- ─── Payments ───────────────────────────────────────────────────────────────
create table if not exists payments (
  id text primary key default gen_random_uuid()::text,
  member_id text not null references members(id) on delete cascade,
  member_name text not null,
  concept text not null check (concept in ('monthly', 'event_fine', 'other')),
  description text not null,
  amount double precision not null,
  date text not null,
  receipt_number text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_payments_updated_at on payments;
create trigger trg_payments_updated_at
before update on payments
for each row execute procedure set_updated_at();

-- ─── Monthly charges ────────────────────────────────────────────────────────
create table if not exists monthly_charges (
  id text primary key default gen_random_uuid()::text,
  member_id text not null references members(id) on delete cascade,
  month text not null,
  amount double precision not null,
  paid boolean not null default false,
  payment_id text null references payments(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (member_id, month)
);

drop trigger if exists trg_monthly_charges_updated_at on monthly_charges;
create trigger trg_monthly_charges_updated_at
before update on monthly_charges
for each row execute procedure set_updated_at();

-- ─── Event attendances ──────────────────────────────────────────────────────
create table if not exists event_attendances (
  id text primary key default gen_random_uuid()::text,
  event_id text not null references events(id) on delete cascade,
  member_id text not null references members(id) on delete cascade,
  attended boolean not null default false,
  fine_generated boolean not null default false,
  fine_amount double precision not null default 0,
  fine_paid boolean not null default false,
  fine_payment_id text null references payments(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_event_attendances_updated_at on event_attendances;
create trigger trg_event_attendances_updated_at
before update on event_attendances
for each row execute procedure set_updated_at();

-- ─── PostgREST-friendly views (camelCase columns) ───────────────────────────
-- Your API routes query camelCase fields like createdAt/memberId/etc.
create or replace view auth_users_v as
select
  id,
  username,
  password,
  name,
  role,
  enabled,
  created_at as "createdAt",
  updated_at as "updatedAt"
from auth_users;

create or replace view settings_v as
select key, value from settings;

create or replace view members_v as
select
  id,
  cedula,
  name,
  email,
  phone,
  hectares,
  location,
  description,
  created_at as "createdAt",
  updated_at as "updatedAt"
from members;

create or replace view events_v as
select
  id,
  name,
  type,
  date,
  amount,
  created_at as "createdAt",
  updated_at as "updatedAt"
from events;

create or replace view payments_v as
select
  id,
  member_id as "memberId",
  member_name as "memberName",
  concept,
  description,
  amount,
  date,
  receipt_number as "receiptNumber",
  created_at as "createdAt",
  updated_at as "updatedAt"
from payments;

create or replace view monthly_charges_v as
select
  id,
  member_id as "memberId",
  month,
  amount,
  paid,
  payment_id as "paymentId",
  created_at as "createdAt",
  updated_at as "updatedAt"
from monthly_charges;

create or replace view event_attendances_v as
select
  id,
  event_id as "eventId",
  member_id as "memberId",
  attended,
  fine_generated as "fineGenerated",
  fine_amount as "fineAmount",
  fine_paid as "finePaid",
  fine_payment_id as "finePaymentId",
  created_at as "createdAt",
  updated_at as "updatedAt"
from event_attendances;

