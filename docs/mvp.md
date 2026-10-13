# Mano knygų lentyna – MVP

## 1. Projekto tikslas

Sukurti internetinę aplikaciją, kurioje vartotojas galėtų ieškoti tikrų knygų ir tvarkyti savo asmeninį skaitymo sąrašą.

## 2. Būtinos funkcijos (P0)

1. Ieškoti knygų pagal pavadinimą arba autorių naudojant Open Library API.
2. Rodyti knygų pavadinimus, autorius ir viršelius, jei jie prieinami.
3. Pridėti pasirinktą knygą į savo lentyną.
4. Peržiūrėti išsaugotas knygas.
5. Keisti skaitymo būseną: „Noriu perskaityti“, „Skaitoma“, „Perskaityta“.
6. Pašalinti knygą iš lentynos.
7. Išsaugoti duomenis Supabase duomenų bazėje.

## 3. Papildomos funkcijos (P1)

- Filtruoti knygas pagal skaitymo būseną.
- Filtruoti knygas pagal žanrą.

## 4. Ateities funkcijos (P2)

- Vertinti perskaitytas knygas.
- Rašyti atsiliepimus.
- Matyti skaitymo statistiką.

## 5. Priėmimo kriterijai (Acceptance Criteria)

- Įvedus knygos pavadinimą, pateikiami atitinkami paieškos rezultatai.
- Jei paieška nesėkminga, vartotojas mato aiškų pranešimą.
- Pasirinkus „Pridėti į lentyną“, knyga išsaugoma Supabase.
- Pridėta knyga matoma asmeninėje lentynoje.
- Vartotojas gali pakeisti knygos skaitymo būseną.
- Vartotojas gali pašalinti knygą.
- Perkrovus puslapį, išsaugotos knygos išlieka.
- Negalima pridėti tos pačios knygos du kartus.
- Duomenų bazės klaidos atveju rodomas pranešimas.

## 6. Technologijos

JavaScript, React, Vite, CSS, Open Library API, Supabase, GitHub.
