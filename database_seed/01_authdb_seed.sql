-- Seed data for authdb
-- Demo credentials:
--   admin / admin123
--   moderator / qwerty123
--   ivan / qwerty123
--   alina / user123
--   demo / demo123

BEGIN;

CREATE TABLE IF NOT EXISTS public."user" (
    id serial PRIMARY KEY,
    uuid uuid NOT NULL UNIQUE,
    login varchar(255) NOT NULL UNIQUE,
    password bytea NOT NULL,
    lastname varchar(255) NOT NULL,
    firstname varchar(255) NOT NULL,
    email varchar(255) NOT NULL UNIQUE,
    phone varchar(255) NOT NULL UNIQUE,
    role varchar(50) NOT NULL CHECK (role IN ('USER', 'MODERATOR', 'ADMIN'))
);

INSERT INTO public."user" (uuid, login, password, lastname, firstname, email, phone, role) VALUES
('2d4d6d4e-8cc9-4d7b-91df-2b3c5c71aa01', 'admin',     decode('24326224313224434b3231463551424a4c2e382f3758494777306c382e4e43367756544d617a6a45504972525162714a516d364b66504f4c42623161', 'hex'), 'Орлова',     'Мария',      'admin@aerodesk.local',     '+79990000001', 'ADMIN'),
('972f3314-5e03-4205-8f3b-c3a9a38c2b02', 'moderator', decode('24326224313224765979584d723470696e326576486162776553412e754c57455a654b424c385a746c4e76434f6253495674776e333643523751384b', 'hex'), 'Смирнов',    'Дмитрий',    'moderator@aerodesk.local', '+79990000002', 'MODERATOR'),
('7a6aa331-322a-44ef-bd18-4481adf9b003', 'ivan',      decode('24326224313224765979584d723470696e326576486162776553412e754c57455a654b424c385a746c4e76434f6253495674776e333643523751384b', 'hex'), 'Петров',     'Иван',       'ivan@aerodesk.local',      '+79990000003', 'USER'),
('43529c24-1781-4ac8-a989-650c93cbe204', 'alina',     decode('24326224313224394f2e733030766b747676623835423042784a686d75427a4c34314a544b4c646f756b626558466e4e3359306f70416a6977723632', 'hex'), 'Кузнецова',  'Алина',      'alina@aerodesk.local',     '+79990000004', 'USER'),
('4f942c24-bd2f-455c-b08e-c9c4cdf2b405', 'demo',      decode('243262243132242e576171313639506936666232385032556f4674562e776b59453532793832372e62632f46752e4a76754d30556e51305653596265', 'hex'), 'Демонстрац.', 'Пользователь','demo@aerodesk.local',      '+79990000005', 'USER')
ON CONFLICT (login) DO UPDATE SET
    uuid = EXCLUDED.uuid,
    password = EXCLUDED.password,
    lastname = EXCLUDED.lastname,
    firstname = EXCLUDED.firstname,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role;

SELECT setval('public.user_id_seq', GREATEST((SELECT COALESCE(MAX(id), 1) FROM public."user"), 1), true);

COMMIT;
