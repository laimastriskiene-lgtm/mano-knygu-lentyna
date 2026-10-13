# MVP specifikacija

## Tikslas ir būklė

Lietuviška aplikacija knygų paieškai ir privačiai lentynai. Pagrindinės funkcijos įgyvendintos React kode; nuotolinę integraciją dar reikia patvirtinti pagal [testavimo scenarijus](testing.md).

## Būtinos funkcijos

- Registracija ir prisijungimas el. paštu bei slaptažodžiu, atsijungimas ir sesijos atkūrimas.
- Vieša Open Library paieška, iki 12 rezultatų, prieinami viršeliai ir autoriai.
- Prisijungus: knygos pridėjimas, lentynos peržiūra, būsenos keitimas ir pašalinimas.
- Tik būsenos „Noriu perskaityti“, „Skaitoma“, „Perskaityta“.
- Supabase išsaugojimas, dublikatų prevencija, vartotojų izoliacija per RLS.
- Aiškios lietuviškos klaidos ir responsyvi sąsaja.

## Priėmimo kriterijai

1. Atsijungęs lankytojas gali ieškoti, bet negali naudoti privačios lentynos.
2. Registracija veikia pagal el. pašto patvirtinimo nustatymus; neteisingi prisijungimo duomenys pateikia klaidą.
3. Pridėta knyga matoma Supabase ir lentynoje su savo user_id bei pradine būsena „Noriu perskaityti“.
4. Knyga ir pakeista būsena išlieka perkrovus puslapį.
5. Pašalinimą atšaukus knyga lieka, patvirtinus – pašalinama ir nebegrįžta.
6. Viena paskyra negali išsaugoti to paties kūrinio du kartus, net dviejuose skirtukuose. Skirtingos paskyros gali saugoti tą patį kūrinį.
7. Svetimų knygų SELECT, UPDATE ir DELETE neprieinami, INSERT ar savininko keitimas į svetimą user_id atmetami net tiesiogine API užklausa.
8. Knygos be viršelio, autoriaus ar temos apdorojamos; trūkstami ryšiai lieka NULL.
9. Tinklo ir DB klaidos parodomos; nesėkmingi veiksmai neatrodo išsaugoti.
10. Veikia klaviatūros navigacija ir išdėstymas 360 px bei 1280 px pločiuose; build ir lint sėkmingi.

## Ribos ir vėlesni darbai

Saugomas vienas autorius ir viena temos žyma kaip žanras; leidimo metai rodomi tik paieškoje. Nėra laisvo pavadinimo redagavimo, slaptažodžio atkūrimo ar paskyros pašalinimo sąsajos.

P1: būsenos ir žanro filtrai. P2: vertinimai, atsiliepimai ir statistika. Šios funkcijos dar neįgyvendintos. Darbų eiga – [įgyvendinimo plane](implementation-plan.md).
