-- Seed data for bonusdb
-- Таблицы бонусов очищаются перед вставкой, чтобы история операций соответствовала демо-билетам.

BEGIN;

CREATE TABLE IF NOT EXISTS public.privilege (
    id serial PRIMARY KEY,
    username varchar(80) NOT NULL UNIQUE,
    status varchar(80) NOT NULL DEFAULT 'STANDARD' CHECK (status IN ('STANDARD', 'BRONZE', 'SILVER', 'GOLD')),
    balance integer
);

CREATE TABLE IF NOT EXISTS public.privilege_history (
    id serial PRIMARY KEY,
    privilege_id integer REFERENCES public.privilege(id),
    ticket_uid uuid NOT NULL,
    datetime timestamp without time zone NOT NULL,
    balance_diff integer NOT NULL,
    operation_type varchar(20) NOT NULL CHECK (operation_type IN ('FILL_IN_BALANCE', 'DEBIT_THE_ACCOUNT'))
);

TRUNCATE TABLE public.privilege_history, public.privilege RESTART IDENTITY CASCADE;

-- Возвращаем типы бонусного счёта для демонстрации программы лояльности.
-- Критерии расчёта здесь не вводятся: это заранее подготовленные демо-статусы.
ALTER TABLE public.privilege DROP CONSTRAINT IF EXISTS privilege_status_check;
ALTER TABLE public.privilege ALTER COLUMN status SET DEFAULT 'STANDARD';
ALTER TABLE public.privilege ADD CONSTRAINT privilege_status_check CHECK (status IN ('STANDARD', 'BRONZE', 'SILVER', 'GOLD'));

INSERT INTO public.privilege (username, status, balance) VALUES
('ivan',      'GOLD',   2460),
('alina',     'SILVER', 1760),
('demo',      'BRONZE',  543),
('admin',     'GOLD',   3000),
('moderator', 'SILVER', 1500)
ON CONFLICT (username) DO UPDATE SET
    status = EXCLUDED.status,
    balance = EXCLUDED.balance;

INSERT INTO public.privilege_history (privilege_id, ticket_uid, datetime, balance_diff, operation_type) VALUES
((SELECT id FROM public.privilege WHERE username = 'ivan'),      '10000000-0000-4000-8000-000000000001', '2026-05-10 10:15:00',  390, 'FILL_IN_BALANCE'),
((SELECT id FROM public.privilege WHERE username = 'ivan'),      '10000000-0000-4000-8000-000000000002', '2026-05-16 12:20:00',  720, 'FILL_IN_BALANCE'),
((SELECT id FROM public.privilege WHERE username = 'ivan'),      '10000000-0000-4000-8000-000000000003', '2026-05-25 09:05:00',  980, 'FILL_IN_BALANCE'),
((SELECT id FROM public.privilege WHERE username = 'ivan'),      '10000000-0000-4000-8000-000000000003', '2026-05-26 11:40:00', -980, 'DEBIT_THE_ACCOUNT'),
((SELECT id FROM public.privilege WHERE username = 'ivan'),      '11111111-1111-4111-8111-111111111111', '2026-06-01 10:15:00',  420, 'FILL_IN_BALANCE'),
((SELECT id FROM public.privilege WHERE username = 'ivan'),      '22222222-2222-4222-8222-222222222222', '2026-06-02 12:20:00',  760, 'FILL_IN_BALANCE'),
((SELECT id FROM public.privilege WHERE username = 'ivan'),      '33333333-3333-4333-8333-333333333333', '2026-06-03 09:05:00',  960, 'FILL_IN_BALANCE'),
((SELECT id FROM public.privilege WHERE username = 'ivan'),      '33333333-3333-4333-8333-333333333333', '2026-06-03 11:40:00', -960, 'DEBIT_THE_ACCOUNT'),

((SELECT id FROM public.privilege WHERE username = 'alina'),     '10000000-0000-4000-8000-000000000004', '2026-05-11 14:30:00',  205, 'FILL_IN_BALANCE'),
((SELECT id FROM public.privilege WHERE username = 'alina'),     '10000000-0000-4000-8000-000000000005', '2026-06-01 18:10:00',  670, 'FILL_IN_BALANCE'),
((SELECT id FROM public.privilege WHERE username = 'alina'),     '44444444-4444-4444-8444-444444444444', '2026-06-01 14:30:00',  260, 'FILL_IN_BALANCE'),
((SELECT id FROM public.privilege WHERE username = 'alina'),     '55555555-5555-4555-8555-555555555555', '2026-06-02 18:10:00',  625, 'FILL_IN_BALANCE'),

((SELECT id FROM public.privilege WHERE username = 'demo'),      '10000000-0000-4000-8000-000000000006', '2026-05-20 20:00:00',   84, 'FILL_IN_BALANCE'),
((SELECT id FROM public.privilege WHERE username = 'demo'),      '10000000-0000-4000-8000-000000000007', '2026-06-03 08:45:00',  219, 'FILL_IN_BALANCE'),
((SELECT id FROM public.privilege WHERE username = 'demo'),      '66666666-6666-4666-8666-666666666666', '2026-06-01 20:00:00',  114, 'FILL_IN_BALANCE'),
((SELECT id FROM public.privilege WHERE username = 'demo'),      '77777777-7777-4777-8777-777777777777', '2026-06-04 08:45:00',  246, 'FILL_IN_BALANCE'),

((SELECT id FROM public.privilege WHERE username = 'admin'),     '88888888-8888-4888-8888-888888888888', '2026-06-02 07:50:00',  890, 'FILL_IN_BALANCE'),
((SELECT id FROM public.privilege WHERE username = 'moderator'), '99999999-9999-4999-8999-999999999999', '2026-06-02 13:35:00',  350, 'FILL_IN_BALANCE');

SELECT setval('public.privilege_id_seq', GREATEST((SELECT COALESCE(MAX(id), 1) FROM public.privilege), 1), true);
SELECT setval('public.privilege_history_id_seq', GREATEST((SELECT COALESCE(MAX(id), 1) FROM public.privilege_history), 1), true);

COMMIT;
