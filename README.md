# Mano knygų lentyna

Internetinė knygų paieškos ir asmeninės bibliotekos aplikacija. Tikslas – vienoje vietoje saugoti norimas perskaityti, skaitomas ir perskaitytas knygas. Lietuviška sąsaja prisitaiko prie kompiuterio ir telefono ekranų.

## Technologijos

React, Vite, JavaScript / JSX, CSS atskiruose failuose, Supabase PostgreSQL ir Auth, Open Library API, Git ir GitHub.

## Esamos funkcijos

- Registracija el. paštu ir slaptažodžiu, prisijungimas, atsijungimas ir sesijos atkūrimas. El. pašto patvirtinimas priklauso nuo Supabase nustatymų.
- Vieša paieška pagal pavadinimą arba autorių, iki 12 rezultatų; viršeliai, autoriai, prieinami leidimo metai ir nuorodos į Open Library.
- Prisijungus: pridėjimas į asmeninę lentyną, peržiūra, skaitymo būsenos keitimas ir ištrynimas su patvirtinimu.
- Būsenos: `Noriu perskaityti`, `Skaitoma`, `Perskaityta`.
- Išsaugojimas Supabase ir įkėlimas perkrovus puslapį; dublikatų tikrinimas sąsajoje ir unikalumo migracija duomenų bazei.
- Lietuviški klaidų pranešimai ir pakaitinis vaizdas, kai viršelio nėra.

Lentynoje saugomas pirmas prieinamas autorius ir pirmoji Open Library temos žyma kaip žanras. Trūkstami ryšiai lieka NULL. Leidimo metai lentynoje nesaugomi. Filtrai, vertinimai ir atsiliepimai dar neįgyvendinti.

## Paleidimas

Reikia Node.js ir npm, suderinamų su naudojama Vite versija, bei Supabase projekto su esama schema.

```sh
npm ci
```

Pagal [.env.example](.env.example) sukurkite `.env.local`:

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Įrašykite savo projekto URL ir viešąjį raktą. Nenaudokite `service_role` React kode. `.env` ir `.env.local` ignoruojami Git; tikrų raktų nekelkite į repozitoriją. Viešasis raktas nepakeičia RLS.

Supabase įjunkite registraciją el. paštu ir slaptažodžiu. Authentication → URL Configuration nustatykite Site URL ir Redirect URLs pagal aplikacijos adresą; vietoje paprastai `http://localhost:5173`.

```sh
npm run dev
```

Atidarykite terminale pateiktą adresą. Pakeitus aplinkos kintamuosius reikia paleisti Vite iš naujo. Be Supabase nustatymų veikia paieška, bet paskyra ir lentyna neprieinamos.

## Supabase

Lentelės `profiles`, `authors`, `genres` ir `books` aprašytos [duomenų modelyje](docs/data-model.md). Tikslūs nuotolinės schemos tipai ir apibrėžimai dar nepatvirtinti.

[Supabase instrukcija](supabase/README.md) aprašo tris suderintus SQL juodraščius: 000 kuria lenteles, UNIQUE, profilio trigerį ir RPC; 001 – RLS bei teises; 002 – būsenų CHECK. UNIQUE ir CHECK nebedubliuojami, books numatytos keturios RLS taisyklės. Visų failų vykdymas užblokuotas iki tikro DDL patvirtinimo. Tai dokumentacijos juodraščiai, dar netinkami naujam Supabase projektui automatiškai paruošti.

## Testavimas

```sh
npm run build
npm run lint
git diff --check
```

Produkcijos paketą peržiūrėkite su `npm run preview`. Atskiros automatinių funkcinių testų komandos nėra. Rankinės patikros, įskaitant Supabase išsaugojimą ir dviejų paskyrų izoliaciją, pateiktos [testavimo scenarijuose](docs/testing.md). Build ir lint nepatvirtina nuotolinės integracijos veikimo.

## Dokumentacija

- [Projekto idėja](docs/idea.md).
- [MVP specifikacija](docs/mvp.md).
- [Įgyvendinimo planas](docs/implementation-plan.md).
- [Duomenų modelis ir lentelių ryšiai](docs/data-model.md).
- [Architektūros aprašymas](docs/architecture.md).
- [Testavimo scenarijai](docs/testing.md).

Šaltiniai: [Open Library paieška](https://openlibrary.org/dev/docs/api/search), [viršeliai](https://openlibrary.org/dev/docs/api/covers), [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [PostgreSQL apribojimai](https://www.postgresql.org/docs/current/sql-altertable.html).
