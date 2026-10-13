# Projekto idėja

„Mano knygų lentyna“ skirta skaitytojams, norintiems atrasti tikras knygas ir vienoje vietoje tvarkyti asmeninį skaitymo sąrašą.

## Problema ir sprendimas

Knygų pavadinimai bei skaitymo planai dažnai išsibarsto užrašuose. Aplikacija sujungia Open Library paiešką su privačia Supabase saugoma lentyna.

## Naudojimo scenarijus

1. Lankytojas ieško pagal pavadinimą arba autorių; paskyra paieškai nereikalinga.
2. Užsiregistruoja, patvirtina el. paštą, jei reikalaujama, ir prisijungia.
3. Prideda knygą su būsena „Noriu perskaityti“.
4. Keičia būseną į „Skaitoma“, vėliau – „Perskaityta“.
5. Sugrįžęs mato išsaugotą lentyną arba pašalina knygą.

## Kryptis

Lietuviška minimalistinė sąsaja: šviesus fonas, žalsvi akcentai, aiškūs viršeliai ir apvalintos kortelės. Išdėstymas pritaikytas kompiuteriui ir telefonui. Kiekvienas vartotojas gali skaityti ir keisti tik savo knygas.

Technologijos: React, Vite, JavaScript / JSX, CSS, Supabase PostgreSQL bei Auth, Open Library API. Funkcijų ribos aprašytos [MVP](mvp.md).
