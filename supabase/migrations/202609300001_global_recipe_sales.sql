create or replace function public.get_global_recipe_sales()
returns table (
  recipe_id text,
  sale_count bigint,
  units_sold bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    sale.recipe_id,
    count(*)::bigint as sale_count,
    coalesce(sum(sale.quantity), 0)::bigint as units_sold
  from public.sales as sale
  group by sale.recipe_id;
$$;

revoke all on function public.get_global_recipe_sales() from public;
grant execute on function public.get_global_recipe_sales() to authenticated;
