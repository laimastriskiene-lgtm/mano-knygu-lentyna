-- RLS IR TEISIŲ JUODRAŠTIS. NEVYKDYTI: tikras policies DDL nepatvirtintas.
-- Skirtas tik suderintai naujos aplinkos grandinei po 000.
-- Patvirtinti tik RLS skaičiai: books 4, profiles 2, authors 1, genres 1.
-- NEPATVIRTINTA: sąlygos, vardai, vaidmenys, komandos ir suteiktos teisės.
-- UNIQUE šiame faile nekuriamas; jis apibrėžtas tik 000.
begin;

do $$
begin
  raise exception 'NEPATVIRTINTAS RLS JUODRAŠTIS: vykdymas užblokuotas iki tikros schemos patvirtinimo.';
end;
$$;

alter table public.profiles enable row level security;
alter table public.authors enable row level security;
alter table public.genres enable row level security;
alter table public.books enable row level security;

-- RLS skaičiai patvirtinti, bet pavadinimai, komandos, vaidmenys ir
-- sąlygos NEPATVIRTINTI. Žemiau siūlomas variantas pagal aplikacijos poreikius.
create policy profiles_select_own on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy profiles_update_own on public.profiles
  for update to authenticated using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy authors_select_authenticated on public.authors
  for select to authenticated using (true);
create policy genres_select_authenticated on public.genres
  for select to authenticated using (true);

create policy books_select_own on public.books
  for select to authenticated using ((select auth.uid()) = user_id);
create policy books_insert_own on public.books
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy books_update_own on public.books
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy books_delete_own on public.books
  for delete to authenticated using ((select auth.uid()) = user_id);

-- NEPATVIRTINTA: tikros suteiktos teisės. Katalogo rašymas tik per RPC.
revoke all on public.profiles, public.authors, public.genres, public.books
  from public, anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select on public.authors, public.genres to authenticated;
grant select, insert, update, delete on public.books to authenticated;

commit;
