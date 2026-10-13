# Mano knygų lentyna

React + Vite aplikacija knygoms atrasti ir būsimai asmeninei bibliotekai tvarkyti. Sąsaja lietuviška, su atskirais CSS failais ir responsyviu išdėstymu.

## Paleidimas

```sh
npm install
npm run dev
```

Atidarykite terminale nurodytą vietinį adresą.

## Pirmoji pagrindinio puslapio versija

- Pasisveikinimo skiltis ir knygų iliustracija, sukurta CSS.
- Knygų paieška pagal pavadinimą arba autorių per Open Library API (iki 12 rezultatų).
- Knygų viršeliai, autoriai, pirmojo leidimo metai ir nuorodos į Open Library.
- Įkėlimo, tuščios paieškos, nerastų rezultatų ir užklausos klaidų pranešimai.
- Pakaitinis vaizdas, kai viršelio nėra arba jis neįkeliamas.
- Būsimos asmeninės lentynos pristatymas.

Įgyvendinta Supabase Auth registracija, prisijungimas, atsijungimas ir sesijos atkūrimas perkrovus puslapį. Knygų išsaugojimas ir skaitymo būsenų keitimas dar neįgyvendinti; paieškos rezultatai išnyksta perkrovus puslapį.

API dokumentacija: [paieška](https://openlibrary.org/dev/docs/api/search), [viršeliai](https://openlibrary.org/dev/docs/api/covers).

## Patikrinimas

```sh
npm run build
npm run lint
```

Naršyklėje patikrinkite paiešką (pvz., „Tolkien“), tuščią užklausą, nieko nerandantį tekstą ir užklausą išjungus internetą. Patikrinkite navigaciją bei išdėstymą kompiuterio ir telefono pločiuose.

Projekto kryptis aprašyta `docs/idea.md` ir `docs/mvp.md`.

## Supabase Auth nustatymas ir patikrinimas

1. Nukopijuokite `.env.example` į `.env.local` ir įrašykite savo projekto `VITE_SUPABASE_URL` bei `VITE_SUPABASE_PUBLISHABLE_KEY`. Naudokite viešąjį publishable raktą, niekada `service_role` ar secret rakto. Esamo `.env.local` neperrašykite.
2. Supabase nustatymuose įjunkite el. pašto ir slaptažodžio autentifikaciją bei registraciją.
3. Authentication → URL Configuration nustatykite Site URL ir leistinus Redirect URLs pagal tikrą aplikacijos adresą (vietoje paprastai `http://localhost:5173`). Produkcijoje pridėkite publikuotos aplikacijos adresą.
4. Pakeitus aplinkos kintamuosius, iš naujo paleiskite `npm run dev`.
5. Paskyros skiltyje užregistruokite testinį vartotoją ir, jei reikalaujama, patvirtinkite el. paštą gauto laiško nuoroda. Prisijunkite ir patikrinkite rodomą el. paštą.
6. Perkraukite puslapį: prisijungimas turi išlikti. Atsijunkite ir perkraukite dar kartą: turi būti rodoma prisijungimo forma.
7. Patikrinkite neteisingą slaptažodį, nepatvirtintą el. paštą, veiksmus be interneto ir telefono pločio išdėstymą. Knygų paieška turi veikti ir prisijungus, ir atsijungus.

`.env.local` ignoruojamas Git. Atsijungimas nutraukia sesiją šioje naršyklėje. Duomenų bazės lentelės šiuo pakeitimu nekuriamos; būsimos asmeninės lentynos prieigą reikės saugoti RLS taisyklėmis.

Auth API: [registracija](https://supabase.com/docs/reference/javascript/auth-signup), [prisijungimas](https://supabase.com/docs/reference/javascript/auth-signinwithpassword), [sesijos įvykiai](https://supabase.com/docs/reference/javascript/auth-onauthstatechange).
