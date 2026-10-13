# Duomenų modelis

## Patvirtinimo ribos

Aprašas remiasi React kodu ir vietine books RLS migracija. Pilno veikiančios Supabase schemos DDL projekte nėra. Vartotoja patvirtino books būsenas, FK į profiles, authors ir genres, UNIQUE(user_id, open_library_id) ir RLS taisyklių skaičius 4/2/1/1. Laukų tipai, numatytosios reikšmės ir tikslūs apribojimų bei policies apibrėžimai nuotoliniu būdu dar nepatikrinti. Žemiau nurodomas kodo kontraktas, ne išgalvota pilna schema.

Visų keturių lentelių laukų, PK, FK, indeksų, RLS, RPC ir trigerių peržiūrai skirtas [schema-inspection.sql](../supabase/schema-inspection.sql). Jis neskaito privačių lentelių įrašų.

## profiles

React tiesiogiai šios lentelės neskaito ir nekuria. Sesija gaunama iš Supabase Auth. Reikia patvirtinti visus laukus, PK, FK į auth.users, profilio kūrimo trigerį ir RLS. Books FK į profiles patvirtintas vartotojos. Tikslinis stulpelis, profiles PK ir ryšys su auth.users dar tikrintini.

## authors

- id – RPC grąžinamas identifikatorius, įrašomas į books.author_id.
- name – pavadinimas, skaitomas per authors(name).

Patikrinti PK, ID tipą bei generavimą, name tipą, privalomumą, unikalumą, kitus laukus ir RLS.

## genres

- id – RPC grąžinamas identifikatorius, įrašomas į books.genre_id.
- name – pavadinimas, skaitomas per genres(name).

Patikrinti PK, ID tipą bei generavimą, name tipą, privalomumą, unikalumą, kitus laukus ir RLS. Open Library subject yra temos žyma ir nebūtinai literatūrinis žanras.

## books

Vartotojos patvirtinta: veikiančioje Supabase duomenų bazėje yra keturios lentelės profiles, authors, genres ir books. Books turi tiksliai devynis toliau išvardytus laukus. Laukų sąrašas patvirtintas vartotojos; jų tipai ir tikslūs apribojimų bei ryšių apibrėžimai nuotoliniu būdu dar nepatikrinti. Vėliau vartotoja patvirtino tris būsenas, UNIQUE ir FK tikslines lenteles.

Patvirtinti laukų pavadinimai ir jų naudojimas kode:

- id – identifikatorius keitimui ir šalinimui; klientas jo nesiunčia, DB turi jį sugeneruoti.
- user_id – Auth vartotojo ID iš sesijos; nuosavybė ir RLS.
- author_id – ryšys į authors.id arba NULL, jei autoriaus nėra.
- genre_id – ryšys į genres.id arba NULL, jei temos nėra.
- open_library_id – visas kūrinio raktas, pvz. /works/OL45883W.
- title – pavadinimas.
- cover_url – viršelio URL arba NULL.
- status – tik Noriu perskaityti, Skaitoma, Perskaityta. INSERT aiškiai siunčia Noriu perskaityti.
- created_at – sukūrimo laikas rūšiavimui; klientas jo nesiunčia.

Reikia patvirtinti id PK, visų laukų tipus, NULL galimybes ir numatytąsias reikšmes. Įdėtiniam SELECT būtini atpažįstami FK books.author_id → authors.id ir books.genre_id → genres.id. Books FK tikslinės lentelės profiles, authors ir genres patvirtintos. Tiksliniai stulpeliai ir šalinimo taisyklės turi būti nustatyti iš tikro DDL.

Vartotoja patvirtino, kad jau yra UNIQUE(user_id, open_library_id). 000 juodraštyje ši pora apibrėžiama vieną kartą kaip UNIQUE. 001 nebekuria indekso. 002 vieną kartą apibrėžia trijų būsenų CHECK; 000 jo nebekuria. NULL draudimas 000 per NOT NULL tebėra nepatvirtinta prielaida, o vien CHECK savaime NULL neatmeta.

Saugomas pirmas prieinamas autorius ir pirmoji temos žyma. Leidimo metai lentynoje nesaugomi.

## Lentelių ryšiai ir jų kardinalumas

Toliau aprašyti kodo numatomi ryšiai. Tikrieji FK, PK ir jų tipai turi būti patvirtinti metaduomenyse.

- Vienas Auth vartotojas gali turėti nuo nulio iki daugelio books įrašų. Kiekvienas lentynos įrašas priklauso vienam vartotojui pagal books.user_id. Vartotoja patvirtino FK į profiles; tikslinį stulpelį ir profilio ryšį su Auth reikia patikrinti.
- Vienas authors įrašas gali būti naudojamas daugelyje books įrašų. Viena knyga turi nulį arba vieną autorių pagal books.author_id → authors.id. Autoriaus nebuvimas kode reiškiamas NULL.
- Vienas genres įrašas gali būti naudojamas daugelyje books įrašų. Viena knyga turi nulį arba vieną žanrą pagal books.genre_id → genres.id. Temos nebuvimas kode reiškiamas NULL.
- Auth vartotojo ir profiles santykis turi būti nustatytas iš esamos schemos. Vienas profilis vienam vartotojui yra profilio kūrimo patikros tikslas; faktinis 1:1 ryšys priklauso nuo PK, FK ir unikalumo apribojimų.

Books čia yra vartotojo lentynos įrašas, todėl tas pats Open Library kūrinys gali būti atskirai išsaugotas skirtingoms paskyroms. Unikalumas taikomas porai (user_id, open_library_id), ne vien kūrinio raktui. Open Library raktas yra išorinio šaltinio identifikatorius, ne FK į vietinę lentelę.

Kodas nenaudoja tarpinių daugelio autorių ar žanrų ryšių lentelių. Katalogo RPC grąžina vieną ID kiekvienam ryšiui. Prieš keičiant schemą būtina patikrinti ir ON DELETE / ON UPDATE veiksmus: negalima teigti, kad profilio, autoriaus ar žanro pašalinimas automatiškai šalina knygas arba nustato NULL.

Duomenų judėjimas tarp komponentų ir paslaugų aprašytas [architektūroje](architecture.md).

## RPC

Klientas kviečia get_or_create_author su argumentu author_name ir get_or_create_genre su genre_name. Kai pavadinimo nėra, RPC nekviečiama. Priimamas skaliarinis ID arba vienas objektas su id, taip pat vieno objekto masyvas.

Reikia eksportuoti tikrus apibrėžimus ir patvirtinti argumentų bei rezultato tipus, pavadinimų normalizavimą, unikalumą, lygiagrečių užklausų elgesį ir EXECUTE teises. Funkcija turi grąžinti esamą arba naują katalogo ID be dublikatų. SECURITY DEFINER atveju patikrinti savininką, saugų search_path ir schemomis kvalifikuotus objektus. Anoniminio vykdymo poreikio aplikacijoje nėra. Kol schema nepatvirtinta, funkcijų neperrašyti.

## Naujo vartotojo profilio kūrimo trigeris

Registracija kode kviečia Supabase Auth signUp. Siūlomas trigerio SQL pateiktas užblokuotame pradinės schemos juodraštyje; faktinis esamo trigerio apibrėžimas dar nepateiktas. Metaduomenų patikroje reikia rasti auth.users INSERT trigerį ir jo funkciją, patikrinti jos teises, search_path bei tikrų privalomų profiles laukų užpildymą.

Bandomojoje aplinkoje registracija turi sukurti vieną profilį su tinkamu vartotojo ryšiu. Trigerio klaida gali sutrukdyti registracijai. Jei trigerio nėra, jo migracija rengiama tik gavus profiles DDL. Juodraštyje naudojamas minimalus profiles(id, created_at) yra aiškiai pažymėta nepatvirtinta prielaida, kurią būtina suderinti.

## RLS

001 juodraštis įjungia visų keturių lentelių RLS. Books numatytos tik SELECT, INSERT, UPDATE ir DELETE taisyklės; penktos restrictive taisyklės nebėra. Tikrinama auth.uid() = user_id; UPDATE tikrina seną ir naują savininką. Profiles turi dvi, authors ir genres – po vieną taisyklę. Teisės taip pat apibrėžiamos tik 001. Tikros policies sąlygos ir teisės dar nepatvirtintos.

Patikrinti ir PUBLIC bei stulpelių teises, funkcijas, galinčias apeiti RLS. Profiles privatumo ir authors / genres skaitymo policies dabar pateiktos pradinės schemos juodraštyje, bet tai siūlomi, ne faktiniai esamų taisyklių apibrėžimai. Juos reikia palyginti su tikra schema kartu su RPC. Vieša paieška naudoja Open Library, todėl jai Supabase katalogo prieigos nereikia.

Šaltiniai: [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [PostgreSQL apribojimai](https://www.postgresql.org/docs/current/sql-altertable.html).

## Pradinės schemos juodraštis

000 apima keturias lenteles, PK/FK, vienintelį books UNIQUE, profilio trigerį ir RPC. 001 apima RLS bei teises; 002 – vienintelį books.status CHECK. Dubliavimas pašalintas. Visi trys failai yra nevykdytini juodraščiai su besąlyginiu vykdymo stabdžiu. Tipai, defaults, tikslūs FK ir funkcijų kūnai turi būti suderinti su tikru DDL. Failų atsakomybės nuoseklios, tačiau naujos aplinkos paleidimas dar nepatvirtintas. Išsamios ribos: [Supabase instrukcija](../supabase/README.md).
