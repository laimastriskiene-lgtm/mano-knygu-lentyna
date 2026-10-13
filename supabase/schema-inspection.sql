-- Tik skaitoma metaduomenų patikra; nevykdo migracijų ir nekeičia duomenų.
-- Rezultatuose prieš dalijantis patikrinti, ar esamų funkcijų kode nėra paslapčių.

-- Visų lentelių laukai ir numatytosios reikšmės.
select table_name, column_name, data_type, udt_schema, udt_name,
       is_nullable, column_default, is_identity, identity_generation
from information_schema.columns
where table_schema = 'public'
  and table_name in ('profiles', 'authors', 'genres', 'books')
order by table_name, ordinal_position;

-- PK, FK, unikalumo ir CHECK apibrėžimai, įskaitant šalinimo taisykles.
select n.nspname as schema_name, c.relname as table_name,
       con.conname, con.contype, con.convalidated,
       pg_get_constraintdef(con.oid, true) as definition
from pg_constraint con
join pg_class c on c.oid = con.conrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('profiles', 'authors', 'genres', 'books')
order by c.relname, con.conname;

select tablename, indexname, indexdef
from pg_indexes
where schemaname = 'public'
  and tablename in ('profiles', 'authors', 'genres', 'books')
order by tablename, indexname;

-- RLS įjungimas ir taisyklės.
select c.relname as table_name, c.relrowsecurity, c.relforcerowsecurity
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('profiles', 'authors', 'genres', 'books')
  and c.relkind in ('r', 'p');

select tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('profiles', 'authors', 'genres', 'books')
order by tablename, policyname;

-- Lentelių ir stulpelių suteiktos teisės.
select table_name, grantee, privilege_type
from information_schema.table_privileges
where table_schema = 'public'
  and table_name in ('profiles', 'authors', 'genres', 'books')
order by table_name, grantee, privilege_type;

select table_name, column_name, grantee, privilege_type
from information_schema.column_privileges
where table_schema = 'public'
  and table_name in ('profiles', 'authors', 'genres', 'books')
order by table_name, column_name, grantee, privilege_type;

-- RPC parašai, grąžinami tipai, savininkas, teisės ir visas apibrėžimas.
select p.oid::regprocedure as function_name,
       pg_get_function_arguments(p.oid) as arguments,
       pg_get_function_result(p.oid) as result_type,
       p.prosecdef as security_definer, p.proconfig,
       pg_get_userbyid(p.proowner) as owner_name, p.proacl,
       pg_get_functiondef(p.oid) as definition
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('get_or_create_author', 'get_or_create_genre')
  and p.prokind = 'f'
order by function_name;

-- Auth ir profilių trigeriai bei jų funkcijos; pavadinimų nespėjame.
select n.nspname as schema_name, c.relname as table_name, t.tgname,
       t.tgenabled, pg_get_triggerdef(t.oid, true) as trigger_definition,
       p.oid::regprocedure as function_name, p.prosecdef, p.proconfig,
       pg_get_userbyid(p.proowner) as owner_name, p.proacl,
       pg_get_functiondef(p.oid) as function_definition
from pg_trigger t
join pg_class c on c.oid = t.tgrelid
join pg_namespace n on n.oid = c.relnamespace
join pg_proc p on p.oid = t.tgfoid
where not t.tgisinternal
  and ((n.nspname = 'auth' and c.relname = 'users')
    or (n.nspname = 'public' and c.relname = 'profiles'))
order by n.nspname, c.relname, t.tgname;

-- ENUM reikšmės, jei books.status tipas yra ENUM.
select en.enumlabel, en.enumsortorder
from pg_attribute a
join pg_enum en on en.enumtypid = a.atttypid
where a.attrelid = to_regclass('public.books')
  and a.attname = 'status' and not a.attisdropped
order by en.enumsortorder;

-- FK stulpelių poros ir ON DELETE / ON UPDATE apibrėžimai.
select src.relname as source_table, src_col.attname as source_column,
       dst_ns.nspname as target_schema, dst.relname as target_table,
       dst_col.attname as target_column,
       pg_get_constraintdef(con.oid, true) as definition
from pg_constraint con
join pg_class src on src.oid = con.conrelid
join pg_namespace src_ns on src_ns.oid = src.relnamespace
join pg_class dst on dst.oid = con.confrelid
join pg_namespace dst_ns on dst_ns.oid = dst.relnamespace
cross join lateral unnest(con.conkey, con.confkey)
  with ordinality as keys(source_number, target_number, position)
join pg_attribute src_col
  on src_col.attrelid = src.oid and src_col.attnum = keys.source_number
join pg_attribute dst_col
  on dst_col.attrelid = dst.oid and dst_col.attnum = keys.target_number
where con.contype = 'f' and src_ns.nspname = 'public'
  and src.relname in ('profiles', 'authors', 'genres', 'books')
order by source_table, con.conname, keys.position;

-- Visų keturių lentelių policy skaičiai; grąžina ir nulį.
select c.relname as table_name, count(pol.oid) as policy_count
from pg_class c
join pg_namespace ns on ns.oid = c.relnamespace
left join pg_policy pol on pol.polrelid = c.oid
where ns.nspname = 'public'
  and c.relname in ('profiles', 'authors', 'genres', 'books')
  and c.relkind in ('r', 'p')
group by c.relname order by c.relname;

-- Efektyvios RPC teisės, įskaitant iš PUBLIC paveldėtą EXECUTE.
select p.oid::regprocedure as function_name,
       has_function_privilege('anon', p.oid, 'EXECUTE') as anon_execute,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_execute
from pg_proc p join pg_namespace ns on ns.oid = p.pronamespace
where ns.nspname = 'public' and p.prokind = 'f'
  and p.proname in ('get_or_create_author', 'get_or_create_genre');