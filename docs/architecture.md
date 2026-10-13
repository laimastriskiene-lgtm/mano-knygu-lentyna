# Architektūros aprašymas

## Bendras veikimas

Projektas yra naršyklėje veikianti React aplikacija, kurią paleidžia ir surenka Vite. Atskiro projekto serverio kode nėra: naršyklė tiesiogiai kreipiasi į Open Library paiešką ir į Supabase per supabase-js klientą.

Open Library teikia viešus knygų duomenis. Supabase Auth valdo vartotojo sesiją, o Supabase duomenų API vykdo lentynos užklausas ir PostgreSQL RPC. Duomenų bazėje saugomi lentynos įrašai; jų prieiga turi būti apribota RLS. Tikslūs nuotoliniai schemos, RPC ir trigerių apibrėžimai dar nepatvirtinti.

## Failų atsakomybės

- `src/main.jsx` prijungia React prie HTML elemento root, įjungia StrictMode ir globalų CSS.
- `src/App.jsx` valdo paiešką, bendrą puslapį ir perduoda vartotojo sesiją komponentams. Čia apibrėžtas BookCard rodo knygą, viršelį arba pakaitinį vaizdą.
- `src/AuthPanel.jsx` pateikia registracijos, prisijungimo bei atsijungimo formas ir lietuviškus pranešimus.
- `src/lib/useAuth.js` atkuria sesiją per getSession, stebi onAuthStateChange ir baigdamas darbą panaikina prenumeratą.
- `src/PersonalLibrary.jsx` įkelia lentyną, kviečia katalogo RPC, prideda knygas, keičia būseną ir šalina įrašus.
- `src/lib/supabase.js` pagal Vite aplinkos kintamuosius sukuria bendrą Supabase klientą; trūkstant konfigūracijos pateikia klaidą.
- Atskiri CSS failai apibrėžia komponentų ir skirtingų ekranų išdėstymą.
- `supabase/migrations/` saugo paruoštus SQL pakeitimus; React jų nevykdo.
- `supabase/schema-inspection.sql` skirtas rankinei esamos schemos metaduomenų patikrai.

## Paieškos duomenų eiga

1. App patikrina, ar užklausa netuščia, ir pateikia fetch užklausą į Open Library search.json.
2. Siunčiami q, limit=12, fields ir lang=lt. Tikrinamas HTTP rezultatas, docs masyvas, pavadinimas ir kūrinio rakto formatas; dublikatai pašalinami.
3. AbortController nutraukia ankstesnę užklausą ir riboja laukimą iki 15 sekundžių. Pasenusios užklausos rezultatas neperrašo naujos.
4. Rezultatai saugomi React būsenoje ir rodomi kortelėmis. Viršeliai įkeliami iš covers.openlibrary.org; jų klaidos apdorojamos pakaitiniu vaizdu.

Paieškai nereikia Supabase sesijos. lang=lt nėra garantija, kad visi rezultatai lietuviški.

## Sesija ir lentyna

AuthPanel registracijai naudoja signUp, prisijungimui – signInWithPassword, atsijungimui – signOut su scope=local. El. pašto patvirtinimo grįžimo adresas sudaromas iš dabartinio puslapio adreso.

App perduoda sesijos vartotojo ID į PersonalLibrary ir naudoja jį kaip komponento key. Pasikeitus paskyrai, ankstesnio komponento vietinė lentynos būsena panaikinama. Asinchroninių užklausų rezultatai po komponento uždarymo ignoruojami.

Lentyna įkeliama iš books, filtruojama pagal user_id, rūšiuojama pagal created_at mažėjančiai ir id. Užklausos vykdomos po 500 įrašų. Įdėtinis SELECT gauna authors(name) ir genres(name), todėl reikalingi atpažįstami FK.

## Pridėjimo, keitimo ir šalinimo eiga

Pridėjimas pirmiausia tikrina vietinės lentynos dublikatus, parenka pirmą autorių bei temos žymą ir nuosekliai kviečia get_or_create_author bei get_or_create_genre. Jei pavadinimo nėra, atitinkamas ID lieka NULL. Tada siunčiamas books INSERT su vartotojo ID ir būsena Noriu perskaityti.

RPC ir INSERT yra atskiros užklausos, ne viena bendra transakcija. Nesėkmingas knygos įrašymas gali palikti anksčiau sukurtą katalogo įrašą. Duomenų bazės unikalus indeksas turi apsaugoti nuo vienalaikių dublikatų skirtinguose skirtukuose.

Keičiant būseną tikrinamas trijų reikšmių sąrašas ir vykdomas UPDATE pagal knygos id bei user_id. Pašalinimas vykdomas po window.confirm, taip pat pagal abu identifikatorius. Vietinė lentyna keičiama tik gavus sėkmingą DB atsakymą.

Vienas komponentas neleidžia kelių lentynos pakeitimų vienu metu. Tai nepakeičia DB apribojimų tarp skirtingų naršyklių. Klaidos paverčiamos lietuviškais pranešimais; nepavykus pradiniam įkėlimui galima bandyti dar kartą. Automatinės kitų skirtukų knygų sinchronizacijos per Realtime kode nėra.

## Duomenys ir saugumo riba

Duomenų modelis ir ryšiai aprašyti [data-model.md](data-model.md). Books įrašas yra konkretaus vartotojo lentynos knyga; authors ir genres naudojami kaip bendri katalogai. Profiles klientas tiesiogiai nenaudoja.

React filtras ir išjungti mygtukai padeda sąsajai, tačiau prieigos saugumą turi užtikrinti DB RLS, teisės ir RPC. Klientas naudoja viešąjį raktą bei vartotojo sesiją. service_role React kode nenaudojamas. VITE aplinkos kintamieji skirti kliento konfigūracijai, todėl juose negalima laikyti paslapčių.

Profilių trigerio, katalogo RLS, RPC teisių, FK ir kitų nuotolinių nustatymų atitiktis dar tikrintina. Schema-inspection.sql jų nekeičia, o migracijos šiame darbe netaikomos.

## Paleidimas ir tikrinimas

Vite dev režimas skirtas vietiniam darbui; build sukuria dist paketą, preview leidžia jį peržiūrėti. Produkcijos priegloba šiame projekte neaprašyta kaip jau įdiegta.

Konfigūracija – [README](../README.md), patikros – [testing.md](testing.md), SQL paruošimas – [Supabase instrukcija](../supabase/README.md). Build ir lint patvirtina vietines kodo patikras, tačiau nepakeičia nuotolinės integracijos ir vartotojų izoliacijos testų.
