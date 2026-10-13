-- STATUSO CHECK JUODRAŠTIS. NEVYKDYTI: tikras status DDL nepatvirtintas.
-- Skirtas tik suderintai naujos aplinkos grandinei po 000 ir 001.
-- CHECK apibrėžtas tik šiame faile. Lentelės, UNIQUE ir policies nekuriami.
-- Būsenos patvirtintos, bet CHECK vardas, status tipas, NULL ir default
-- turi būti palyginti su tikra schema. 000 NOT NULL kol kas yra prielaida.
begin;

do $$
begin
  raise exception 'NEPATVIRTINTAS STATUSO JUODRAŠTIS: vykdymas užblokuotas iki tikros schemos patvirtinimo.';
end;
$$;

alter table public.books
  add constraint books_shelf_status_allowed
  check (status in ('Noriu perskaityti', 'Skaitoma', 'Perskaityta'));

commit;
