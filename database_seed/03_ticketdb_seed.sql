-- Seed data for ticketdb

BEGIN;

CREATE TABLE IF NOT EXISTS public.ticket (
    id serial PRIMARY KEY,
    ticket_uid uuid NOT NULL UNIQUE,
    username varchar(80) NOT NULL,
    flight_number varchar(20) NOT NULL,
    price integer NOT NULL,
    status varchar(20) NOT NULL CHECK (status IN ('PAID', 'CANCELED'))
);

INSERT INTO public.ticket (ticket_uid, username, flight_number, price, status) VALUES
('11111111-1111-4111-8111-111111111111', 'ivan',  'AD101',  4200,  'PAID'),
('22222222-2222-4222-8222-222222222222', 'ivan',  'AD210',  7600,  'PAID'),
('33333333-3333-4333-8333-333333333333', 'ivan',  'AD730',  9600,  'CANCELED'),
('44444444-4444-4444-8444-444444444444', 'alina', 'AD305',  5200,  'PAID'),
('55555555-5555-4555-8555-555555555555', 'alina', 'AD840', 12500,  'PAID'),
('66666666-6666-4666-8666-666666666666', 'demo',  'AD512', 11400,  'PAID'),
('77777777-7777-4777-8777-777777777777', 'demo',  'AD950', 24600,  'PAID'),
('88888888-8888-4888-8888-888888888888', 'admin', 'AD410',  8900,  'PAID'),
('99999999-9999-4999-8999-999999999999', 'moderator', 'AD621', 7000, 'PAID')
ON CONFLICT (ticket_uid) DO UPDATE SET
    username = EXCLUDED.username,
    flight_number = EXCLUDED.flight_number,
    price = EXCLUDED.price,
    status = EXCLUDED.status;

SELECT setval('public.ticket_id_seq', GREATEST((SELECT COALESCE(MAX(id), 1) FROM public.ticket), 1), true);

COMMIT;
