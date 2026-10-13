# Asmeninės lentynos duomenų modelis

Naudojamos esamos Supabase lentelės, naujos nekuriamos.

## books

- `id`: esamas pirminis raktas; sugeneruojamas duomenų bazėje.
- `user_id`: prisijungusio vartotojo ID. Esamas ryšys su vartotojo profiliu turi būti patikrintas Supabase.
- `author_id`: užsienio raktas į `authors.id`, gali būti NULL.
- `genre_id`: užsienio raktas į `genres.id`, gali būti NULL.
- `open_library_id`: visas Open Library kūrinio raktas, pvz. `/works/OL45883W`.
- `title`: knygos pavadinimas.
- `cover_url`: Open Library viršelio URL arba NULL.
- `status`: leidžiamos ir aplikacijoje naudojamos tik reikšmės `Noriu perskaityti`, `Skaitoma`, `Perskaityta`. Nauja knyga išsaugoma su būsena `Noriu perskaityti`; keičiant būseną tikrinama, ar ji yra šiame sąraše.
- `created_at`: sugeneruojama duomenų bazėje.

Vieno vartotojo ir vieno Open Library kūrinio pora turi būti unikali.
SQL migracija prideda unikalų indeksą ir RLS taisykles, esamų duomenų netrina.
Jei dublikatų jau yra, migracija sustoja; juos pirmiausia reikia peržiūrėti rankiniu būdu.

## Susijusios lentelės ir RPC

`profiles` paliekama esama; jos struktūra ir esama registracijos logika nekeičiamos.
`authors` ir `genres` naudojamos per esamus `books.author_id` ir `books.genre_id` užsienio raktus.
Aplikacijos SELECT naudoja `authors(name)` ir `genres(name)`.
Jei esamoje schemoje pavadinimų laukai vadinasi kitaip, pakeiskite SELECT ir laukų naudojimą `src/PersonalLibrary.jsx`.

- `get_or_create_author({ author_name })`: gauna pirmą prieinamą autorių.
- `get_or_create_genre({ genre_name })`: gauna pirmą prieinamą Open Library subject.
- Jei atitinkamo pavadinimo nėra, RPC nekviečiama ir ID lieka NULL.
- RPC atsakymui palaikomas skaliarinis ID arba vienas įrašas su `id` (taip pat vieno įrašo masyvas).

Kadangi esama books schema saugo vieną author_id ir genre_id, keli autoriai ar žanrai nesaugomi.
Open Library subject yra temos žyma, todėl jos tikslumas kaip žanro priklauso nuo šaltinio duomenų.

## Saugumas ir patikrinimas prieš migraciją

Prieš rankiniu būdu vykdant migraciją Supabase SQL Editor patikrinkite:

```sql
select column_name, data_type, udt_name, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name in ('profiles', 'authors', 'genres', 'books')
order by table_name, ordinal_position;

select conname, pg_get_constraintdef(oid)
from pg_constraint
where conrelid = 'public.books'::regclass;

select policyname, permissive, roles, cmd, qual, with_check
from pg_policies where schemaname = 'public' and tablename = 'books';

select user_id, open_library_id, count(*)
from public.books
group by user_id, open_library_id having count(*) > 1;

select p.proname, pg_get_function_arguments(p.oid),
       pg_get_function_result(p.oid), p.prosecdef
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('get_or_create_author', 'get_or_create_genre');
```

Šios užklausos nevykdomos automatiškai. Nuotolinė schema šiame darbe nebuvo patikrinta.
Esami authors ir genres RLS nustatymai turi leisti prisijungusiam vartotojui
skaityti reikalingus bendro katalogo įrašus. RPC EXECUTE teises ir, jei naudojamas
SECURITY DEFINER, funkcijų search_path bei jų logiką reikia patikrinti duomenų bazėje.

books RLS įjungiama, esamos policies paliekamos, papildoma restrictive taisyklė
apriboja authenticated prieigą savo user_id. anon teisės į books atšaukiamos.
React klientas naudoja tik viešąjį Supabase raktą ir vartotojo sesiją.
