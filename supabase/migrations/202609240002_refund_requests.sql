create table if not exists public.refund_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entitlement_id uuid not null references public.entitlements(id) on delete restrict,
  cakto_order_id text not null,
  reason text not null check (char_length(trim(reason)) >= 3 and char_length(reason) <= 1000),
  status text not null default 'requested'
    check (status in ('requested', 'processing', 'refunded', 'rejected')),
  requested_at timestamptz not null default now(),
  resolved_at timestamptz,
  unique (entitlement_id)
);

alter table public.refund_requests enable row level security;

drop policy if exists "Customers can read their own refund requests" on public.refund_requests;
create policy "Customers can read their own refund requests"
on public.refund_requests for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Customers can request a refund during guarantee" on public.refund_requests;
create policy "Customers can request a refund during guarantee"
on public.refund_requests for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.entitlements entitlement
    where entitlement.id = entitlement_id
      and entitlement.cakto_order_id = refund_requests.cakto_order_id
      and lower(entitlement.customer_email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and entitlement.status = 'active'
      and now() <= entitlement.granted_at + interval '7 days'
  )
);

create index if not exists refund_requests_user_requested_idx
on public.refund_requests (user_id, requested_at desc);
