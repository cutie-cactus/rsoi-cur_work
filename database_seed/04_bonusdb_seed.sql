-- Seed data for bonusdb

BEGIN;

CREATE TABLE IF NOT EXISTS public.privilege (
    id serial PRIMARY KEY,
    username varchar(80) NOT NULL UNIQUE,
    status varchar(80) NOT NULL DEFAULT 'BRONZE' CHECK (status IN ('BRONZE', 'SILVER', 'GOLD')),
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

INSERT INTO public.privilege (username, status, balance) VALUES
('ivan',      'GOLD',   1840),
('alina',     'SILVER',  960),
('demo',      'BRONZE',  240),
('admin',     'GOLD',   3000),
('moderator', 'SILVER', 1500)
ON CONFLICT (username) DO UPDATE SET
    status = EXCLUDED.status,
    balance = EXCLUDED.balance;

DELETE FROM public.privilege_history
WHERE ticket_uid IN (
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222222',
    '33333333-3333-4333-8333-333333333333',
    '44444444-4444-4444-8444-444444444444',
    '55555555-5555-4555-8555-555555555555',
    '66666666-6666-4666-8666-666666666666',
    '77777777-7777-4777-8777-777777777777',
    '88888888-8888-4888-8888-888888888888',
    '99999999-9999-4999-8999-999999999999'
);

INSERT INTO public.privilege_history (privilege_id, ticket_uid, datetime, balance_diff, operation_type) VALUES
((SELECT id FROM public.privilege WHERE username = 'ivan'),      '11111111-1111-4111-8111-111111111111', '2026-06-01 10:15:00',  420, 'FILL_IN_BALANCE'),
((SELECT id FROM public.privilege WHERE username = 'ivan'),      '22222222-2222-4222-8222-222222222222', '2026-06-02 12:20:00',  760, 'FILL_IN_BALANCE'),
((SELECT id FROM public.privilege WHERE username = 'ivan'),      '33333333-3333-4333-8333-333333333333', '2026-06-03 09:05:00',  960, 'FILL_IN_BALANCE'),
((SELECT id FROM public.privilege WHERE username = 'ivan'),      '33333333-3333-4333-8333-333333333333', '2026-06-03 11:40:00', -960, 'DEBIT_THE_ACCOUNT'),
((SELECT id FROM public.privilege WHERE username = 'alina'),     '44444444-4444-4444-8444-444444444444', '2026-06-01 14:30:00',  260, 'FILL_IN_BALANCE'),
((SELECT id FROM public.privilege WHERE username = 'alina'),     '55555555-5555-4555-8555-555555555555', '2026-06-02 18:10:00',  625, 'FILL_IN_BALANCE'),
((SELECT id FROM public.privilege WHERE username = 'demo'),      '66666666-6666-4666-8666-666666666666', '2026-06-01 20:00:00',  114, 'FILL_IN_BALANCE'),
((SELECT id FROM public.privilege WHERE username = 'demo'),      '77777777-7777-4777-8777-777777777777', '2026-06-04 08:45:00',  246, 'FILL_IN_BALANCE'),
((SELECT id FROM public.privilege WHERE username = 'admin'),     '88888888-8888-4888-8888-888888888888', '2026-06-02 07:50:00',  890, 'FILL_IN_BALANCE'),
((SELECT id FROM public.privilege WHERE username = 'moderator'), '99999999-9999-4999-8999-999999999999', '2026-06-02 13:35:00',  350, 'FILL_IN_BALANCE');

SELECT setval('public.privilege_id_seq', GREATEST((SELECT COALESCE(MAX(id), 1) FROM public.privilege), 1), true);
SELECT setval('public.privilege_history_id_seq', GREATEST((SELECT COALESCE(MAX(id), 1) FROM public.privilege_history), 1), true);

COMMIT;
