create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sale_date date not null default current_date,
  recipe_id text not null check (recipe_id in ('morango', 'goiaba', 'abacaxi')),
  customer_name text check (char_length(customer_name) <= 80),
  quantity integer not null check (quantity > 0),
  unit_price numeric(10,2) not null check (unit_price > 0),
  unit_cost numeric(10,2) not null check (unit_cost >= 0),
  created_at timestamptz not null default now()
);

alter table public.sales enable row level security;

create policy "Users can read their own sales"
on public.sales for select
using (auth.uid() = user_id);

create policy "Users can insert their own sales"
on public.sales for insert
with check (auth.uid() = user_id);

create policy "Users can delete their own sales"
on public.sales for delete
using (auth.uid() = user_id);

create index if not exists sales_user_created_idx
on public.sales (user_id, created_at desc);
