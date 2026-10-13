-- PRADINĖS SCHEMOS JUODRAŠTIS. NEPATVIRTINTA VEIKIANČIOS DB KOPIJA.
-- SQL šiame darbe nevykdytas. Skirtas peržiūrai ir tik naujai bandomajai aplinkai.
-- Patvirtinta: keturios lentelės, 9 books laukai, FK į profiles/authors/genres,
-- UNIQUE(user_id, open_library_id), trys būsenos, RLS skaičius 4/2/1/1.
-- PRIELAIDOS: visi id UUID; profiles.id = auth.users.id; minimalūs katalogo
-- ir profilio laukai; status TEXT; defaults, NULL, FK veiksmai, policies,
-- trigerio ir RPC kūnai bei pavadinimai. Visa tai palyginti su tikru DDL.
-- SECURITY DEFINER savininkas ir numatytosios funkcijų teisės dar tikrintinos.
-- Atsakomybės: 000 kuria lenteles ir UNIQUE; 001 RLS/teises; 002 status CHECK.
-- Visų failų vykdymas užblokuotas iki tikro DDL patvirtinimo.
begin;

-- Sąmoningas stabdis: nieko nesukuriama net netyčia paleidus visą failą.
do $$
begin
  raise exception 'NEPATVIRTINTAS JUODRAŠTIS: pirmiausia palyginkite su esama schema. Vykdymas užblokuotas.';
end;
$$;

-- Papildoma apsauga naujai aplinkai: esamų lentelių neliečiame.
do $$
begin
  if to_regclass('public.profiles') is not null
     or to_regclass('public.authors') is not null
     or to_regclass('public.genres') is not null
     or to_regclass('public.books') is not null then
    raise exception 'Lentelės jau egzistuoja. Pradinės schemos failas netaikomas esamai DB.';
  end if;
end;
$$;

-- NEPATVIRTINTA: profiles laukų rinkinys, PK ir Auth ryšys.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- NEPATVIRTINTA: UUID, tikslus laukų rinkinys ir name unikalumas.
create table public.authors (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (btrim(name) <> '')
);
create table public.genres (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (btrim(name) <> '')
);

-- Laukų pavadinimai ir FK tikslinės lentelės patvirtinti vartotojos.
-- NEPATVIRTINTA: tipai, tiksliniai FK stulpeliai, NULL/defaults ir ON DELETE.
create table public.books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  author_id uuid references public.authors(id) on delete set null,
  genre_id uuid references public.genres(id) on delete set null,
  open_library_id text not null,
  title text not null,
  cover_url text,
  status text not null default 'Noriu perskaityti',
  created_at timestamptz not null default now(),
  constraint books_user_open_library_unique unique (user_id, open_library_id)
);

-- NEPATVIRTINTA: esamo trigerio vardas ir profiles privalomi laukai.
-- Šis minimalus variantas neįrašo el. pašto ar user_metadata.
create function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;
revoke all on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RPC vardai ir argumentų vardai atitinka klientą.
-- NEPATVIRTINTA: TEXT argumentai, UUID rezultatas, normalizavimas,
-- savininkas, SECURITY DEFINER ir esami funkcijų kūnai.
-- UNIQUE(name) + ON CONFLICT užtikrina vieną ID vienodam normalizuotam vardui.
-- Raidžių dydis išsaugomas; "Autorius" ir "autorius" laikomi skirtingais.
create function public.get_or_create_author(author_name text)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  normalized_name text := pg_catalog.btrim(author_name);
  result_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Būtina prisijungti.' using errcode = '42501';
  end if;
  if normalized_name is null or normalized_name = '' then
    raise exception 'Autoriaus pavadinimas negali būti tuščias.' using errcode = '22023';
  end if;

  insert into public.authors (name) values (normalized_name)
  on conflict (name) do update set name = excluded.name
  returning id into result_id;
  return result_id;
end;
$$;

create function public.get_or_create_genre(genre_name text)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  normalized_name text := pg_catalog.btrim(genre_name);
  result_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Būtina prisijungti.' using errcode = '42501';
  end if;
  if normalized_name is null or normalized_name = '' then
    raise exception 'Žanro pavadinimas negali būti tuščias.' using errcode = '22023';
  end if;

  insert into public.genres (name) values (normalized_name)
  on conflict (name) do update set name = excluded.name
  returning id into result_id;
  return result_id;
end;
$$;

revoke all on function public.get_or_create_author(text) from public, anon, authenticated;
revoke all on function public.get_or_create_genre(text) from public, anon, authenticated;
grant execute on function public.get_or_create_author(text) to authenticated;
grant execute on function public.get_or_create_genre(text) to authenticated;

-- SECURITY DEFINER funkcijų savininko teisės turi būti patikrintos.
-- Auth schema, jos lentelės ir esami vartotojai šiame faile nekuriami.
-- Esamų vartotojų profilių pildymas čia nenumatytas: tik nauja aplinka.
commit;
