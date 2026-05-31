-- Enable Row Level Security on every public table managed by Prisma.
-- Our server-side queries go through Prisma using the `postgres` role,
-- which bypasses RLS. RLS being enabled (without policies) blocks any
-- query coming through the anon/publishable key — exactly what we want
-- since the frontend never queries Postgres directly.

ALTER TABLE public."User"                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Client"               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."RecurringPlan"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Invoice"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Payment"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."PaymentMethodConfig"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."EmailLog"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ExchangeRate"         ENABLE ROW LEVEL SECURITY;
