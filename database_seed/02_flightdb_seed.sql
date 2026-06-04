-- Seed data for flightdb

BEGIN;

CREATE TABLE IF NOT EXISTS public.airport (
    id serial PRIMARY KEY,
    name varchar(255),
    city varchar(255),
    country varchar(255)
);

CREATE TABLE IF NOT EXISTS public.flight (
    id serial PRIMARY KEY,
    flight_number varchar(20) NOT NULL UNIQUE,
    price integer NOT NULL,
    datetime timestamp with time zone NOT NULL,
    from_airport_id integer REFERENCES public.airport(id),
    to_airport_id integer REFERENCES public.airport(id)
);

INSERT INTO public.airport (id, name, city, country) VALUES
(1,  'Шереметьево',                    'Москва',           'Россия'),
(2,  'Пулково',                        'Санкт-Петербург',  'Россия'),
(3,  'Адлер',                          'Сочи',             'Россия'),
(4,  'им. В. П. Чкалова',              'Нижний Новгород',  'Россия'),
(5,  'Домодедово',                     'Москва',           'Россия'),
(6,  'Казань',                         'Казань',           'Россия'),
(7,  'Кольцово',                       'Екатеринбург',     'Россия'),
(8,  'Толмачёво',                      'Новосибирск',      'Россия'),
(9,  'Платов',                         'Ростов-на-Дону',   'Россия'),
(10, 'Храброво',                       'Калининград',      'Россия'),
(11, 'Минск Национальный',             'Минск',            'Беларусь'),
(12, 'Анталья',                        'Анталья',          'Турция')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    city = EXCLUDED.city,
    country = EXCLUDED.country;

INSERT INTO public.flight (flight_number, price, datetime, from_airport_id, to_airport_id) VALUES
('AD101',   4200,  '2026-06-12 09:15:00+03', 1,  2),
('AD102',   4300,  '2026-06-12 19:30:00+03', 2,  1),
('AD210',   7600,  '2026-06-14 07:45:00+03', 1,  3),
('AD211',   7900,  '2026-06-18 21:20:00+03', 3,  1),
('AD305',   5200,  '2026-06-15 13:10:00+03', 5,  6),
('AD306',   5400,  '2026-06-15 17:40:00+03', 6,  5),
('AD410',   8900,  '2026-06-20 10:25:00+03', 1,  7),
('AD411',   9200,  '2026-06-22 16:05:00+03', 7,  1),
('AD512',  11400,  '2026-06-24 23:30:00+03', 5,  8),
('AD513',  11800,  '2026-06-28 06:50:00+03', 8,  5),
('AD620',   6800,  '2026-07-01 12:00:00+03', 4,  9),
('AD621',   7000,  '2026-07-03 18:15:00+03', 9,  4),
('AD730',   9600,  '2026-07-05 08:40:00+03', 1, 10),
('AD731',   9900,  '2026-07-09 20:10:00+03',10,  1),
('AD840',  12500,  '2026-07-12 11:45:00+03', 2, 11),
('AD841',  12900,  '2026-07-16 15:35:00+03',11,  2),
('AD950',  24600,  '2026-07-20 04:25:00+03', 1, 12),
('AD951',  25100,  '2026-07-27 22:15:00+03',12,  1)
ON CONFLICT (flight_number) DO UPDATE SET
    price = EXCLUDED.price,
    datetime = EXCLUDED.datetime,
    from_airport_id = EXCLUDED.from_airport_id,
    to_airport_id = EXCLUDED.to_airport_id;

SELECT setval('public.airport_id_seq', GREATEST((SELECT COALESCE(MAX(id), 1) FROM public.airport), 1), true);
SELECT setval('public.flight_id_seq', GREATEST((SELECT COALESCE(MAX(id), 1) FROM public.flight), 1), true);

COMMIT;
