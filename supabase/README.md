# Supabase SQL juodraščiai

## Patvirtinta vartotojos

Yra profiles, authors, genres ir books. Books turi devynis laukus: id, user_id, author_id, genre_id, open_library_id, title, cover_url, status, created_at. Patvirtinti FK į profiles, authors ir genres, UNIQUE(user_id, open_library_id) ir trys būsenos: Noriu perskaityti, Skaitoma, Perskaityta. Esamos RLS skaičiai: books 4, profiles 2, authors 1, genres 1.

## Failų atsakomybės

Visi trys failai yra JUODRAŠČIAI, NETINKAMI VYKDYTI. Kiekvienas turi besąlyginį RAISE EXCEPTION prieš schemos keitimus; apsaugų šiame darbe nešaliname.

1. migrations/202610130000_initial_schema_draft.sql – keturių lentelių sukūrimas, PK/FK, vienintelis books UNIQUE(user_id, open_library_id), profilio trigeris ir abi RPC.
2. migrations/202610130001_books_shelf_security.sql – RLS įjungimas ir teisės. Tik keturios books taisyklės: SELECT, INSERT, UPDATE ir DELETE. Profiles – dvi, authors ir genres – po vieną. UNIQUE ir CHECK nekuriami.
3. migrations/202610130002_books_status_constraint.sql – vienintelis books.status CHECK su trimis lietuviškomis būsenomis. Lentelės, policies ir UNIQUE nekuriami.

Pašalintas ankstesnis UNIQUE bei CHECK dubliavimas ir penktoji books restrictive taisyklė. Atsakomybės dabar suderintos vienai naujos aplinkos grandinei 000 → 001 → 002, tačiau tai nėra patvirtinimas, kad SQL galima paleisti. Vykdymas užblokuotas ir integracijos testas neatliktas.

Failai nėra papildymo scenarijus veikiančiai DB. Jei ankstesnė jų versija jau taikyta kurioje nors aplinkoje, prieš naudojant reikia patikrinti migracijų istoriją ir rengti naują atskirą pakeitimą, ne perrašyti taikytą istoriją.

## Nepatvirtintos detalės

- Visų ID tipai; minimalus profiles(id, created_at), authors/genres(id, name) laukų rinkinys.
- Profiles PK ir ryšys su auth.users; tiksliniai FK stulpeliai bei ON DELETE / ON UPDATE.
- NULL galimybės, numatytosios reikšmės ir jų funkcijos. NOT NULL statusui ir naujos būsenos default kol kas yra prielaidos.
- Status tipo TEXT pasirinkimas, faktinis CHECK arba ENUM apibrėžimas, apribojimų ir indeksų pavadinimai.
- Katalogo name unikalumas, tuščio pavadinimo CHECK, tarpų ir raidžių dydžio normalizavimas.
- Tikros RLS komandos, vaidmenys, USING ir WITH CHECK sąlygos bei lentelių ir stulpelių teisės. Patvirtintas skaičius nepatvirtina turinio.
- Profilių trigerio vardas, funkcija ir privalomų profilio laukų užpildymas.
- RPC argumentų tipai, grąžinami ID tipai, kūnai, lygiagretumas, savininkai, SECURITY DEFINER, search_path ir EXECUTE teisės.

RPC vardai ir argumentų vardai atitinka React kodą. Juodraščio RPC apkarpo tarpus, skiria raidžių dydį ir naudoja ON CONFLICT DO UPDATE, kuris gali aktyvuoti UPDATE trigerius. Šis elgesys nėra patvirtintas kaip esamas DB elgesys.

## Tik skaitymo patikra

schema-inspection.sql pateikia konkrečias SELECT užklausas visų keturių lentelių laukams, PK/FK, UNIQUE/CHECK, indeksams, RLS, teisėms, trigeriams ir RPC. Papildomos užklausos išskleidžia FK stulpelius, suskaičiuoja policies ir tikrina efektyvias RPC vykdymo teises. Jos nekeičia schemos ar duomenų ir šiame darbe nevykdytos Supabase.

Gauti tikrą DDL, palyginti jį su juodraščiais ir tik po suderinimo atskiroje bandomojoje aplinkoje atlikti docs/testing.md scenarijus. Veikiančioje DB šių failų nevykdyti. GitHub galima saugoti kaip dokumentuotus juodraščius, ne kaip paruoštą diegimą.

SQL vykdymo ir PostgreSQL integracijos patikros neatliktos. React kodas nekeistas.

Šaltiniai: [Supabase profilio trigeris](https://supabase.com/docs/guides/auth/managing-user-data), [PostgreSQL ON CONFLICT](https://www.postgresql.org/docs/current/sql-insert.html).
