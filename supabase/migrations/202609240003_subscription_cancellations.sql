create table if not exists public.subscription_cancellation_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entitlement_id uuid not null references public.entitlements(id) on delete restrict,
  cakto_order_id text not null,
  status text not null default 'requested'
    check (status in ('requested', 'processing', 'canceled')),
  requested_at timestamptz not null default now(),
  resolved_at timestamptz,
  unique (entitlement_id)
);

alter table public.subscription_cancellation_requests enable row level security;

drop policy if exists "Customers can read their own cancellation requests"
on public.subscription_cancellation_requests;
create policy "Customers can read their own cancellation requests"
on public.subscription_cancellation_requests for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Customers can request subscription cancellation"
on public.subscription_cancellation_requests;
create policy "Customers can request subscription cancellation"
on public.subscription_cancellation_requests for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.entitlements entitlement
    where entitlement.id = entitlement_id
      and entitlement.cakto_order_id = subscription_cancellation_requests.cakto_order_id
      and lower(entitlement.customer_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and entitlement.status = 'active'
  )
);

create index if not exists cancellation_requests_user_requested_idx
on public.subscription_cancellation_requests (user_id, requested_at desc);
