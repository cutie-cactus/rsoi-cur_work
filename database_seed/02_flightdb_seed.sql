-- Seed data for flightdb
-- Таблицы аэропортов и рейсов очищаются перед вставкой, чтобы после каждого деплоя демонстрационный набор был одинаковым. Прошедшие рейсы нужны только для архивных билетов.

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
    to_airport_id integer REFERENCES public.airport(id),
    capacity integer NOT NULL DEFAULT 50,
    available_seats integer NOT NULL DEFAULT 50
);


ALTER TABLE public.flight ADD COLUMN IF NOT EXISTS capacity integer NOT NULL DEFAULT 50;
ALTER TABLE public.flight ADD COLUMN IF NOT EXISTS available_seats integer NOT NULL DEFAULT 50;
ALTER TABLE public.flight DROP CONSTRAINT IF EXISTS flight_capacity_check;
ALTER TABLE public.flight DROP CONSTRAINT IF EXISTS flight_available_seats_check;
ALTER TABLE public.flight ADD CONSTRAINT flight_capacity_check CHECK (capacity >= 0);
ALTER TABLE public.flight ADD CONSTRAINT flight_available_seats_check CHECK (available_seats >= 0 AND available_seats <= capacity);

TRUNCATE TABLE public.flight, public.airport RESTART IDENTITY CASCADE;

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
(12, 'Анталья',                        'Анталья',          'Турция'),
(13, 'Гейдар Алиев',                   'Баку',             'Азербайджан'),
(14, 'Звартноц',                       'Ереван',           'Армения')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    city = EXCLUDED.city,
    country = EXCLUDED.country;

INSERT INTO public.flight (flight_number, price, datetime, from_airport_id, to_airport_id, capacity, available_seats) VALUES
-- Прошедшие рейсы, чтобы в разделе билетов были видны старые поездки
('AD001',   3900,  '2026-05-12 08:30:00+03', 1,  2, 12, 10),
('AD002',   4100,  '2026-05-13 18:10:00+03', 2,  1, 12, 11),
('AD014',   7200,  '2026-05-18 06:45:00+03', 5,  6, 10, 9),
('AD025',   8400,  '2026-05-22 12:25:00+03', 6,  5, 8, 7),
('AD033',   9800,  '2026-05-28 21:35:00+03', 1, 10, 10, 10),
('AD044',  13400,  '2026-06-01 09:05:00+03', 2, 11, 9, 8),
('AD055',  21900,  '2026-06-03 04:40:00+03', 1, 12, 6, 5),
-- Ближайшие и будущие рейсы для покупки
('AD101',   4200,  '2026-06-12 09:15:00+03', 1,  2, 4, 3),
('AD102',   4300,  '2026-06-12 19:30:00+03', 2,  1, 6, 6),
('AD210',   7600,  '2026-06-14 07:45:00+03', 1,  3, 3, 2),
('AD211',   7900,  '2026-06-18 21:20:00+03', 3,  1, 6, 6),
('AD305',   5200,  '2026-06-15 13:10:00+03', 5,  6, 5, 4),
('AD306',   5400,  '2026-06-15 17:40:00+03', 6,  5, 5, 5),
('AD410',   8900,  '2026-06-20 10:25:00+03', 1,  7, 4, 3),
('AD411',   9200,  '2026-06-22 16:05:00+03', 7,  1, 5, 5),
('AD512',  11400,  '2026-06-24 23:30:00+03', 5,  8, 4, 3),
('AD513',  11800,  '2026-06-28 06:50:00+03', 8,  5, 4, 4),
('AD620',   6800,  '2026-07-01 12:00:00+03', 4,  9, 2, 2),
('AD621',   7000,  '2026-07-03 18:15:00+03', 9,  4, 2, 1),
('AD730',   9600,  '2026-07-05 08:40:00+03', 1, 10, 2, 1),
('AD731',   9900,  '2026-07-09 20:10:00+03',10,  1, 2, 2),
('AD840',  12500,  '2026-07-12 11:45:00+03', 2, 11, 3, 2),
('AD841',  12900,  '2026-07-16 15:35:00+03',11,  2, 3, 3),
('AD950',  24600,  '2026-07-20 04:25:00+03', 1, 12, 2, 1),
('AD951',  25100,  '2026-07-27 22:15:00+03',12,  1, 2, 2),
('AD960',  27800,  '2026-08-02 02:55:00+03', 1, 13, 1, 1),
('AD970',  23100,  '2026-08-09 05:35:00+03', 1, 14, 1, 0);

SELECT setval('public.airport_id_seq', GREATEST((SELECT COALESCE(MAX(id), 1) FROM public.airport), 1), true);
SELECT setval('public.flight_id_seq', GREATEST((SELECT COALESCE(MAX(id), 1) FROM public.flight), 1), true);

COMMIT;
