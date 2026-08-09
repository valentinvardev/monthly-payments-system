-- Enable Row Level Security on every public table.
--
-- Our server-side queries go through Prisma using the `postgres` role,
-- which bypasses RLS. RLS being enabled (without policies) blocks any
-- query coming through the anon/publishable key — exactly what we want
-- since the frontend never queries Postgres directly.
--
-- This file is idempotent: ENABLE ROW LEVEL SECURITY on a table that
-- already has it is a no-op, so it is safe to re-run after any migration.
--
-- Keep it in sync when adding a model. Audit the live database with:
--   SELECT relname, relrowsecurity FROM pg_class c
--   JOIN pg_namespace n ON n.oid = c.relnamespace
--   WHERE n.nspname = 'public' AND c.relkind = 'r' AND NOT c.relrowsecurity;

ALTER TABLE public."User"                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Invite"               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Client"               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."RecurringPlan"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Invoice"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Payment"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."PaymentMethodConfig"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."MercadoPagoConnection" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."EmailLog"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ExchangeRate"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ProjectLead"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Quote"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."QuoteItem"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."GeneratedIcon"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Prospect"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ProspectActivity"     ENABLE ROW LEVEL SECURITY;

-- Prisma's own bookkeeping table. It holds no business data, but with the
-- anon key it leaks every migration name and timestamp — which is what the
-- Supabase linter flags. Prisma keeps working because it connects as
-- `postgres` and bypasses RLS.
ALTER TABLE public."_prisma_migrations"   ENABLE ROW LEVEL SECURITY;
