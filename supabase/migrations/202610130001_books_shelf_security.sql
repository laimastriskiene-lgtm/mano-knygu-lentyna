-- Taikyti rankiniu būdu tik patikrinus esamą schemą ir policies.
-- Esamos lentelės bei RPC nekuriamos ir neperrašomos.
begin;

-- Jei jau yra dublikatų, migracija sustos. Duomenų automatiškai nešaliname.
create unique index books_user_open_library_unique
  on public.books (user_id, open_library_id);

-- Visas esamas RLS taisykles išsaugome.
alter table public.books enable row level security;

-- Restrictive taisyklė apsaugo ir tada, jei esama permissive taisyklė per plati.
create policy books_shelf_owner_guard
  on public.books as restrictive for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy books_shelf_select_own
  on public.books for select to authenticated
  using ((select auth.uid()) = user_id);

create policy books_shelf_insert_own
  on public.books for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy books_shelf_update_own
  on public.books for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy books_shelf_delete_own
  on public.books for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Neprisijungusiam vartotojui privati lentyna neprieinama.
revoke all on public.books from anon;
grant select, insert, update, delete on public.books to authenticated;

commit;
