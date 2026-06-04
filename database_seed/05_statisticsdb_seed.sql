-- Seed data for statisticsdb
-- Does not delete real logs, only removes/recreates rows in the demo interval below.

BEGIN;

CREATE TABLE IF NOT EXISTS public.statistics (
    id serial PRIMARY KEY,
    method varchar,
    url varchar,
    status_code varchar,
    time timestamp with time zone NOT NULL
);

DELETE FROM public.statistics
WHERE time BETWEEN '2026-06-04 10:00:00+03' AND '2026-06-04 10:30:00+03';

INSERT INTO public.statistics (method, url, status_code, time) VALUES
('GET',    'http://aerodesk.local/api/v1/flights?page=1&size=10',               '200', '2026-06-04 10:01:11+03'),
('GET',    'http://aerodesk.local/api/v1/flights?fromAirport=Москва',           '200', '2026-06-04 10:02:03+03'),
('POST',   'http://aerodesk.local/api/v1/tickets',                              '200', '2026-06-04 10:04:27+03'),
('GET',    'http://aerodesk.local/api/v1/me',                                   '200', '2026-06-04 10:05:19+03'),
('GET',    'http://aerodesk.local/api/v1/privilege',                            '200', '2026-06-04 10:06:44+03'),
('DELETE', 'http://aerodesk.local/api/v1/tickets/33333333-3333-4333-8333-333333333333', '204', '2026-06-04 10:08:02+03'),
('GET',    'http://aerodesk.local/api/v1/statistics?page=1&size=20',            '200', '2026-06-04 10:09:58+03'),
('GET',    'http://aerodesk.local/api/v1/flights?minPrice=5000&maxPrice=10000', '200', '2026-06-04 10:11:32+03'),
('POST',   'http://aerodesk.local/api/v1/user/login',                           '200', '2026-06-04 10:13:15+03'),
('GET',    'http://aerodesk.local/api/v1/flights/AD950',                        '404', '2026-06-04 10:14:21+03'),
('GET',    'http://aerodesk.local/api/v1/tickets',                              '401', '2026-06-04 10:16:03+03'),
('GET',    'http://aerodesk.local/api/v1/flights?page=2&size=10',               '200', '2026-06-04 10:18:41+03');

SELECT setval('public.statistics_id_seq', GREATEST((SELECT COALESCE(MAX(id), 1) FROM public.statistics), 1), true);

COMMIT;
