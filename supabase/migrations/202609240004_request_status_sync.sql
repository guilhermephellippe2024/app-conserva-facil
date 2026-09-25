create or replace function public.sync_customer_request_statuses()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'refunded' and old.status is distinct from new.status then
    update public.refund_requests
    set status = 'refunded', resolved_at = now()
    where entitlement_id = new.id and status <> 'refunded';
  end if;

  if new.status = 'canceled' and old.status is distinct from new.status then
    update public.subscription_cancellation_requests
    set status = 'canceled', resolved_at = now()
    where entitlement_id = new.id and status <> 'canceled';
  end if;

  return new;
end;
$$;

drop trigger if exists entitlement_request_status_sync on public.entitlements;
create trigger entitlement_request_status_sync
after update of status on public.entitlements
for each row
execute function public.sync_customer_request_statuses();
