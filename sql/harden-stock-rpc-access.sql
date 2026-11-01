-- Apply ONLY to the preserved Kittisap Supabase project:
-- zbedxvzrbotwngxaktgj
-- This is a manual, permission-only migration. No rows are modified.
-- Before applying: confirm the target project and back up the schema.
-- Deploy the matching server-side stock RPC code after applying.
begin;

alter function public.reserve_product_stock(uuid, integer) set search_path = '';
alter function public.release_product_stock(uuid, integer) set search_path = '';

-- PostgreSQL grants EXECUTE to PUBLIC by default; revoke both inherited
-- and any role-specific grants before adding the server-only grant.
revoke execute on function public.reserve_product_stock(uuid, integer) from public, anon, authenticated;
revoke execute on function public.release_product_stock(uuid, integer) from public, anon, authenticated;
grant execute on function public.reserve_product_stock(uuid, integer) to service_role;
grant execute on function public.release_product_stock(uuid, integer) to service_role;

commit;

-- Read-only verification after migration:
select
  'reserve_product_stock' as routine,
  has_function_privilege('anon', 'public.reserve_product_stock(uuid, integer)', 'EXECUTE') as anon_can_execute,
  has_function_privilege('authenticated', 'public.reserve_product_stock(uuid, integer)', 'EXECUTE') as customer_can_execute,
  has_function_privilege('service_role', 'public.reserve_product_stock(uuid, integer)', 'EXECUTE') as service_can_execute
union all
select
  'release_product_stock',
  has_function_privilege('anon', 'public.release_product_stock(uuid, integer)', 'EXECUTE'),
  has_function_privilege('authenticated', 'public.release_product_stock(uuid, integer)', 'EXECUTE'),
  has_function_privilege('service_role', 'public.release_product_stock(uuid, integer)', 'EXECUTE');
