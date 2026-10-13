# Įgyvendinimo planas

## 1. Esama būklė

React kode įgyvendinta paieška, Auth ir asmeninės lentynos CRUD. Nuotolinės schemos atitiktis ir funkcijų veikimas dar turi būti patikrinti. Dokumentacija remiasi aktualiu kodu.

## 2. Schema ir saugumas

1. SQL Editor paleisti supabase/schema-inspection.sql ir išsaugoti schemos aprašą be privačių duomenų.
2. Patvirtinti keturių lentelių laukus, tipus, PK, FK, NULL ir numatytąsias reikšmes.
3. Patikrinti profilio kūrimo trigerį, RPC ir visų lentelių RLS bei teises.
4. Pagal tikrą DDL patvirtinti visus tris SQL juodraščius: 000 lenteles, UNIQUE, trigerį ir RPC; 001 RLS bei teises; 002 statuso CHECK. Visų failų vykdymas užblokuotas. Esamų objektų neperrašyti nepatvirtinus jų kontrakto.

Etapas baigtas, kai duomenų modelis atitinka tikrą schemą ir nepatvirtintos dalys išspręstos.

## 3. Migracijų patikra

Dubliavimas pašalintas: UNIQUE tik 000, RLS tik 001, statuso CHECK tik 002. Books numatytos keturios RLS taisyklės. Pirmiausia patvirtinti tikrą DDL; tai tebėra užblokuoti juodraščiai. Atskiroje bandomojoje aplinkoje tikrinti tik pagal tikrą schemą patvirtintus ir tarpusavyje suderintus failus. Pirmiau peržiūrėti dublikatus, NULL ir netinkamas būsenas. Duomenys automatiškai netrinami ir nekeičiami. Šiame darbe SQL veikiančioje aplinkoje nevykdomas.

## 4. Integracija ir priėmimas

Nustatyti .env.local pagal .env.example bei Supabase registracijos adresus. Su dviem testinėmis paskyromis atlikti [testavimo scenarijus](testing.md): išsaugojimas, išlikimas, dublikatai, tiesioginės RLS užklausos, klaidos ir skirtingi ekranai.

## 5. Pateikimas

Paleisti npm run build, npm run lint ir git diff --check. Užfiksuoti atliktas ir neatliktas patikras. Naujiems darbams naudoti GitHub Issues, didesniems pakeitimams – atskirą šaką ir Pull Request. Commit ir push atliekami tik vartotojui paprašius.

## 6. Plėtra

Po MVP priėmimo atskirai planuoti būsenos ir žanro filtrus, vėliau – vertinimus, atsiliepimus ir statistiką su jų migracijomis.
