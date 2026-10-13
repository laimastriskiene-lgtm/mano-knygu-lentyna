# Mano knygų lentyna

React + Vite aplikacija knygoms atrasti ir asmeninei bibliotekai tvarkyti.
Sąsaja lietuviška, su atskirais CSS failais ir responsyviu išdėstymu.

## Paleidimas

```sh
npm install
npm run dev
```

Atidarykite terminale nurodytą vietinį adresą.

## Funkcijos

- Knygų paieška pagal pavadinimą arba autorių per Open Library API (iki 12 rezultatų).
- Viršeliai ir jų pakaitinis vaizdas, autoriai, leidimo metai bei nuorodos į Open Library.
- Supabase Auth registracija, prisijungimas, atsijungimas ir sesijos atkūrimas.
- „Pridėti į lentyną“ prie paieškos rezultatų, prieinamas tik prisijungus.
- Asmeninė lentyna iš esamos Supabase `books` lentelės.
- Skaitymo būsenos „Noriu perskaityti“, „Skaitoma“, „Perskaityta“.
- Pašalinimas su naršyklės patvirtinimo langu.
- Lietuviški veiksmų sėkmės ir klaidų pranešimai.
- Išsaugotos knygos iš naujo įkeliamos perkrovus puslapį.
- Dublikatai blokuojami sąsajoje ir, pritaikius migraciją, duomenų bazėje.

API dokumentacija: [paieška](https://openlibrary.org/dev/docs/api/search),
[viršeliai](https://openlibrary.org/dev/docs/api/covers),
[Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).

## Supabase nustatymas

1. Nukopijuokite `.env.example` į `.env.local` ir įrašykite projekto
   `VITE_SUPABASE_URL` bei `VITE_SUPABASE_PUBLISHABLE_KEY`.
   Esamo failo neperrašykite. Naudokite tik viešąjį raktą.
2. Įjunkite el. pašto ir slaptažodžio autentifikaciją bei registraciją.
3. Authentication → URL Configuration nustatykite Site URL ir Redirect URLs
   pagal tikrą aplikacijos adresą (vietoje paprastai `http://localhost:5173`).
4. Patikrinkite esamą schemą pagal `docs/data-model.md`: books laukus, ryšius,
   authors ir genres pavadinimų laukus bei RPC grąžinamą tipą.
   Kode naudojami `authors.name` ir `genres.name`; jei esama schema skiriasi,
   atitinkamai pakeiskite `src/PersonalLibrary.jsx` laukus.
   `books.status` reikšmės tiek duomenų bazėje, tiek React kode yra
   `Noriu perskaityti`, `Skaitoma`, `Perskaityta`.
5. Peržiūrėkite ir, jei reikia, rankiniu būdu pritaikykite
   `supabase/migrations/202610130001_books_shelf_security.sql` per SQL Editor.
   Migracija nevykdoma automatiškai. Ji išsaugo esamas policies, įjungia RLS,
   apriboja authenticated prieigą savo knygomis, atšaukia anon prieigą
   ir prideda unikalų indeksą `(user_id, open_library_id)`.
   Jei jau yra dublikatų, migracija sustos ir nieko netrins.
6. Patikrinkite, ar prisijungusiam vartotojui leidžiama skaityti susijusius
   authors ir genres įrašus ir vykdyti esamas RPC:
   `get_or_create_author(author_name)`, `get_or_create_genre(genre_name)`.
7. Pakeitę aplinkos kintamuosius, iš naujo paleiskite aplikaciją.

`profiles`, `authors`, `genres` ir `books` nekuriamos iš naujo.
Esamas Supabase klientas ir registracijos logika išsaugoti.
Jei autoriaus arba žanro nėra, atitinkamas ID lieka NULL.
Esama books schema leidžia saugoti vieną autorių ir vieną žanrą,
todėl naudojamas pirmas prieinamas autorius ir pirmas subject.
`open_library_id` saugomas kaip visas kūrinio raktas, pvz. `/works/OL45883W`.
`.env.local` ignoruojamas Git, raktų į repozitoriją nekelkite.

## Patikrinimas

```sh
npm run build
npm run lint
git diff --check
```

Naršyklėje patikrinkite:

1. Atsijungę ieškokite „Tolkien“. Paieška veikia, knygų pridėjimas išjungtas
   ir rodoma prisijungimo nuoroda.
2. Užregistruokite testinę paskyrą, patvirtinkite el. paštą, jei to prašoma,
   ir prisijunkite. Patikrinkite ir neteisingo slaptažodžio pranešimą.
3. Prie knygos paspauskite „Pridėti į lentyną“. Knyga turi atsirasti lentynoje,
   turi būti parodytas sėkmės pranešimas ir mygtukas „Jau lentynoje“.
   Supabase Table Editor patikrinkite books įrašą, user_id ir susijusius ID.
   Naujos knygos status turi būti tiksliai `Noriu perskaityti`.
4. Perkraukite puslapį: sesija ir knyga turi išlikti.
5. Pasirinkite „Skaitoma“, tada „Perskaityta“. Perkraukite ir patikrinkite,
   kad paskutinė būsena išliko. Supabase Table Editor patikrinkite, kad status
   yra tiksliai `Skaitoma` arba `Perskaityta`, pagal pasirinktą būseną.
6. Bandykite pridėti tą patį kūrinį dar kartą, taip pat dviejuose skirtukuose.
   Duomenų bazėje turi likti vienas vartotojo ir kūrinio įrašas.
7. Paspauskite „Pašalinti iš lentynos“ ir atšaukite: knyga lieka.
   Pakartokite ir patvirtinkite: knyga pašalinama; perkrovus jos nebėra.
8. Atsijunkite: ankstesnės paskyros lentyna turi iškart išnykti.
   Prisijunkite antra paskyra: pirmos paskyros knygų neturi matytis.
   Su antro vartotojo JWT tiesiogiai per REST taip pat patikrinkite,
   kad pirmojo knygų SELECT, UPDATE ir DELETE neprieinami, o INSERT
   su svetimu user_id atmetamas.
9. Patikrinkite knygą be viršelio ir, jei paieška pateikia, be autoriaus ar temos.
   Trūkstami ryšiai turi likti NULL.
10. Išjunkite internetą ir bandykite paiešką bei lentynos veiksmus:
    turi būti aiški klaida, nesėkmingas veiksmas neturi pakeisti vietinės lentynos.
11. Patikrinkite kompiuterio ir telefono pločius, klaviatūros navigaciją.

Build, lint ir git diff --check patikros sėkmingos.
Skaitymo būsenos suderintos su vartotojos patvirtintomis books.status reikšmėmis;
šiam pataisymui duomenų bazės ir RLS pakeitimų nereikia.
Tikras išsaugojimas, RPC, RLS ir dviejų paskyrų scenarijai nebuvo patikrinti:
nuotolinės schemos metaduomenų užklausa grąžino HTTP 401, testinės paskyros nepateiktos.
Naršyklės ir ekranų pločių patikra neatlikta: šioje sesijoje naršyklė neprieinama.
SQL migracija nevykdyta. Prieš naudojimą būtina suderinti esamą schemą
ir atlikti aukščiau pateiktą naršyklės patikrinimą.

Projekto kryptis aprašyta `docs/idea.md`, `docs/mvp.md`,
duomenų modelis – `docs/data-model.md`.
