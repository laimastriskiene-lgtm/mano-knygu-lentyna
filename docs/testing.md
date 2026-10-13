# Testavimo scenarijai

## Pasiruošimas

Naudoti bandomąją Supabase aplinką ir dvi testines paskyras A bei B, atskirus naršyklės profilius. Patikrinti .env.local ir schemą pagal supabase/README.md. Migracijų veikiančioje duomenų bazėje šiame darbe nevykdyti.

Kiekvienam scenarijui užrašyti datą, rezultatą (pavyko / nepavyko / neatlikta) ir klaidos aplinkybes be raktų ar slaptažodžių.

## 1. Projekto patikros

Paleisti npm run build, npm run lint ir git diff --check. Tikėtina: visos komandos baigiasi kodu 0. Build patikrina paketo surinkimą bei importus, lint – statines taisykles; tai nepatvirtina Auth, DB ir RLS.

## 2. Vieša paieška

Atsijungus ieškoti „Tolkien“, tada neegzistuojančio pavadinimo ir tuščios užklausos. Tikėtina: iki 12 knygų, aiškūs tuščios užklausos bei nerastų knygų pranešimai. Pridėjimas išjungtas ir siūloma prisijungti.

## 3. Registracija ir profilis

Registruoti naują testinę paskyrą. Jei įjungtas patvirtinimas, patikrinti laiško nuorodą ir prisijungti po patvirtinimo. Tikėtina: Auth vartotojas sukurtas; jei patvirtintas profilio trigeris, profiles turi vieną su juo susietą įrašą ir visus privalomus laukus. Tikrinti pagal faktinį FK, nespėjant profilio laukų.

## 4. Prisijungimas ir atsijungimas

Įvesti neteisingą slaptažodį, tada teisingą. Perkrauti puslapį ir atsijungti. Tikėtina: aiški klaida pirmuoju atveju, sesija atkuriama po perkrovimo, atsijungus asmeninė lentyna išnyksta.

## 5. Pridėjimas ir RPC

Su paskyra A pridėti rastą knygą. Tikėtina: ji matoma lentynoje ir Supabase books; user_id priklauso A, status yra Noriu perskaityti, open_library_id yra visas /works/… raktas. Autoriaus ir temos ID nurodo tinkamus katalogo įrašus. Pakartotinai naudojant tą patį pavadinimą RPC turi grąžinti esamą ID. Perkrauti puslapį – knyga išlieka.

## 6. Skaitymo būsena

Keisti į Skaitoma, tada Perskaityta, po kiekvieno keitimo perkrauti. Tikėtina: būsena išlieka UI ir DB. Bandomojoje aplinkoje su savo vartotojo sesija bandyti įrašyti kitą būseną arba NULL: statuso CHECK turi atmesti užklausą ir nepakeisti įrašo.

## 7. Dublikatai ir lygiagretumas

Bandyti pridėti tą patį kūrinį du kartus, taip pat vienu metu dviejuose skirtukuose. Tikėtina: vienas A ir kūrinio įrašas, aiškus dublikato pranešimas arba „Jau lentynoje“. Paskyra B gali pridėti tą patį kūrinį. Atskirai patikrinti vienalaikes RPC užklausas tuo pačiu nauju pavadinimu: kataloge neturi atsirasti dublikatų.

## 8. Pašalinimas

Pašalinimo patvirtinimą atšaukti – knyga lieka. Pakartoti ir patvirtinti – knyga dingsta iš lentynos bei DB ir nebegrįžta po perkrovimo.

## 9. RLS ir vartotojų izoliacija

A išsaugo knygą, B prisijungia kitame naršyklės profilyje. B neturi matyti A knygų. Vien UI filtro nepakanka: bandomojoje aplinkoje per Supabase REST arba klientą, naudojant viešąjį raktą ir B sesijos JWT, patikrinti:

- SELECT pagal A knygos id negrąžina jos duomenų.
- UPDATE ir DELETE pagal A knygos id nepakeičia ir nepašalina įrašo. RLS gali grąžinti nulį paveiktų eilučių be klaidos; patikrinti ir A sesijoje.
- INSERT su A user_id atmetamas.
- B knygos user_id pakeitimas į A ID atmetamas.
- Be vartotojo JWT privati books lentyna neprieinama.
- Pagal patikrintą profiles schemą B negali skaityti ar keisti A privačių profilio duomenų.

Nenaudoti service_role ar SQL Editor administratoriaus sesijos kaip RLS testo – tokia prieiga neatitinka kliento teisių.

## 10. Trūkstami duomenys

Rasti knygą be viršelio; jei API pateikia, ir be autoriaus ar temos. Tikėtina: pakaitinis viršelis, autoriaus tekstas, sėkmingas išsaugojimas su NULL ryšiais. Jei tinkamų API pavyzdžių nėra, scenarijų pažymėti neatliktu arba naudoti kontroliuojamą atsakymą bandomojoje aplinkoje.

## 11. Klaidos

Išjungti tinklą ir pakartoti paiešką bei lentynos veiksmus. Tikėtina: lietuviška klaida, nesėkmingas veiksmas nekeičia lentynos. Bandomojoje aplinkoje patikrinti nepasiekiamą RPC, netinkamą būseną ir trūkstamas teises; nevykdyti tokių pakeitimų veikiančioje DB. Be Supabase aplinkos kintamųjų turi būti aiškus konfigūracijos pranešimas.

## 12. Sąsaja

Patikrinti 360 px, 720 px ir 1280 px ekranus, ilgus pavadinimus, Tab navigaciją, formų pateikimą Enter, matomą fokusą ir būsenos pasirinkimą. Tikėtina: nėra horizontalaus slinkimo ar persidengimų, valdikliai prieinami klaviatūra.

## Patikrų ribos

Šis dokumentas aprašo scenarijus, o ne patvirtina jų atlikimą. Nuotoliniai Auth, profilių trigeris, RPC, RLS, išsaugojimas ir naršyklės patikros šiame dokumentacijos darbe neatlikti. Migracijos netaikytos. Build, lint ir diff patikrų rezultatai pateikiami darbo ataskaitoje.
