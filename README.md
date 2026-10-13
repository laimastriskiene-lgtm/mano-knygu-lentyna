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

Supabase, registracija, prisijungimas, knygų išsaugojimas ir skaitymo būsenų keitimas dar neįgyvendinti. Puslapis nesaugo asmeninių duomenų; paieškos rezultatai išnyksta perkrovus puslapį.

API dokumentacija: [paieška](https://openlibrary.org/dev/docs/api/search), [viršeliai](https://openlibrary.org/dev/docs/api/covers).

## Patikrinimas

```sh
npm run build
npm run lint
```

Naršyklėje patikrinkite paiešką (pvz., „Tolkien“), tuščią užklausą, nieko nerandantį tekstą ir užklausą išjungus internetą. Patikrinkite navigaciją bei išdėstymą kompiuterio ir telefono pločiuose.

Projekto kryptis aprašyta `docs/idea.md` ir `docs/mvp.md`.
