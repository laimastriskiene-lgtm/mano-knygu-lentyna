# AGENTS.md – Mano knygų lentyna

Šios instrukcijos taikomos dirbant su projektu `mano-knygu-lentyna`.

## 1. Projekto kontekstas

Projektas – internetinė knygų paieškos ir asmeninės bibliotekos aplikacija.

Vartotojas gali:
- Registruotis ir prisijungti.
- Ieškoti tikrų knygų.
- Pridėti knygas į savo lentyną.
- Keisti skaitymo būseną.
- Pašalinti knygas.

Kiekvienas vartotojas mato tik savo knygų lentyną.

Prieš keičiant kodą peržiūrėti aktualius projekto failus ir dokumentaciją `docs/`.

Naujausias veikiantis kodas svarbesnis už pasenusią dokumentaciją.

## 2. Technologijos

- React + Vite.
- JavaScript ir JSX, be TypeScript.
- CSS atskiruose failuose.
- Supabase PostgreSQL – duomenų bazė.
- Supabase Auth – registracija ir prisijungimas.
- Open Library API – tikrų knygų paieška.
- Git ir GitHub – versijų valdymas.

Nenaudoti Tailwind CSS ar CSS Modules, nebent to aiškiai paprašyta.

Naudoti funkcinius React komponentus ir React hooks.

## 3. Duomenų bazė

Planuojamos lentelės:
- `profiles`
- `authors`
- `genres`
- `books`

Duomenų modelis aprašomas `docs/data-model.md`.

Prieš kuriant ar keičiant lenteles:
- Patikrinti jų struktūrą.
- Apibrėžti pirminius ir užsienio raktus.
- Numatyti duomenų apribojimus.
- Užtikrinti duomenų vientisumą.
- Duomenų bazės struktūros pakeitimus saugoti SQL migracijose.

## 4. API

Naudoti Open Library API knygų paieškai.

- Neišgalvoti neegzistuojančių API endpointų.
- Tikrinti API atsakymo struktūrą.
- Apdoroti užklausų klaidas.
- Numatyti situacijas, kai knyga neturi viršelio ar žanro.
- Neleisti vienam vartotojui du kartus išsaugoti tos pačios knygos.

## 5. Saugumas

- Naudoti Supabase Auth.
- Įjungti ir tinkamai sukonfigūruoti RLS.
- Vartotojas gali skaityti ir keisti tik savo knygas.
- Neatskleisti kitų vartotojų privačių duomenų.
- Slaptų raktų ir slaptažodžių nekelti į GitHub.
- `.env` failą įtraukti į `.gitignore`.
- Nenaudoti `service_role` rakto React kliento kode.
- Viešas Supabase raktas nepakeičia RLS saugumo taisyklių.

## 6. Kodo pakeitimai

- Prieš redaguojant failą, jį perskaityti.
- Prieš pakeitimus trumpai paaiškinti, ką planuojama keisti.
- Neišgalvoti neegzistuojančios projekto logikos.
- Išlaikyti esamą funkcionalumą.
- Vengti nereikalingų priklausomybių.
- Rinktis paprastus, pradedančiajam suprantamus sprendimus.
- Nedaryti nesusijusių pakeitimų.

## 7. Dizainas

Naudoti minimalistinį knygų bibliotekos dizainą:

- Šviesus fonas.
- Švelnūs žalsvi akcentai.
- Aiškiai matomi knygų viršeliai.
- Apvalinti kortelių kampai.
- Patogi paieškos juosta.
- Responsyvus išdėstymas kompiuteriui ir telefonui.

Nekeisti patvirtintos dizaino krypties be prašymo.

## 8. Sąsajos kalba

Visus vartotojui skirtus tekstus rašyti lietuviškai.

Klaidų pranešimai turi būti aiškūs ir suprantami.

## 9. GitHub darbo taisyklės

- Naujiems darbams naudoti GitHub Issues.
- Didesnius pakeitimus atlikti atskirose Git šakose.
- Rašyti aiškius commit pranešimus.
- Pakeitimus į pagrindinę šaką jungti per Pull Request.
- Reguliariai atnaujinti README ir dokumentaciją.
- Niekada neįkelti slaptažodžių ar slaptųjų raktų.

Projektas kuriamas individualiai.

## 10. Testavimas

Prieš baigiant darbą patikrinti:

1. Ar veikia esamos funkcijos.
2. Ar duomenys išsaugomi Supabase.
3. Ar duomenys išlieka perkrovus puslapį.
4. Ar vartotojas nemato kitų vartotojų knygų.
5. Ar tinkamai apdorojamos klaidos.
6. Ar nėra neteisingų importų.
7. Ar puslapis prisitaiko prie skirtingų ekranų.
8. Ar sėkmingai veikia `npm run build` ir, jei sukonfigūruota, `npm run lint`.

Jeigu patikrinimas neatliktas, tai aiškiai nurodyti.

## 11. Pateikiant pakeitimus

- Trumpai paaiškinti, kas pakeista.
- Nurodyti kiekvieno pakeisto failo kelią.
- Paaiškinti, ar failas naujas, ar atnaujintas.
- Jei kodą reikia įklijuoti rankiniu būdu, pateikti visą failą.
- Pateikti instrukciją, kaip patikrinti rezultatą.
- Be vartotojo prašymo nedaryti Git commit ar push.