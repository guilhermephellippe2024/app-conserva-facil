create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  customer_email text not null,
  customer_name text,
  cakto_order_id text not null unique,
  cakto_ref_id text,
  cakto_product_id text not null,
  cakto_offer_id text,
  product_key text not null default 'conserva-facil',
  status text not null default 'active'
    check (status in ('active', 'refunded', 'chargeback', 'canceled')),
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cakto_webhook_events (
  event_key text primary key,
  event_name text not null,
  cakto_order_id text not null,
  status text not null default 'received'
    check (status in ('received', 'processed', 'failed')),
  metadata jsonb not null default '{}'::jsonb,
  error_message text,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

alter table public.entitlements enable row level security;
alter table public.cakto_webhook_events enable row level security;

drop policy if exists "Customers can read their own access" on public.entitlements;
create policy "Customers can read their own access"
on public.entitlements for select
to authenticated
using (
  lower(customer_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

create index if not exists entitlements_customer_status_idx
on public.entitlements (lower(customer_email), status);

create index if not exists cakto_events_order_idx
on public.cakto_webhook_events (cakto_order_id, received_at desc);
