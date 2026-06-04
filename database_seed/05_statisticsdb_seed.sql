-- Seed data for statisticsdb
-- Demo statistics are recreated so dashboards have enough data for bars, pies and request list.

BEGIN;

CREATE TABLE IF NOT EXISTS public.statistics (
    id serial PRIMARY KEY,
    method varchar,
    url varchar,
    status_code varchar,
    time timestamp with time zone NOT NULL
);

DELETE FROM public.statistics
WHERE time BETWEEN '2026-06-04 09:00:00+03' AND '2026-06-04 11:00:00+03';

INSERT INTO public.statistics (method, url, status_code, time) VALUES
('GET',     'http://aerodesk.local/api/v1/flights?page=1&size=20',                              '200', '2026-06-04 09:01:11+03'),
('GET',     'http://aerodesk.local/api/v1/flights?fromAirport=Москва',                          '200', '2026-06-04 09:02:03+03'),
('GET',     'http://aerodesk.local/api/v1/flights?toAirport=Сочи',                              '200', '2026-06-04 09:03:14+03'),
('GET',     'http://aerodesk.local/api/v1/flights?minPrice=5000&maxPrice=10000',                '200', '2026-06-04 09:04:32+03'),
('POST',    'http://aerodesk.local/api/v1/user/login',                                          '200', '2026-06-04 09:05:15+03'),
('GET',     'http://aerodesk.local/api/v1/me',                                                  '200', '2026-06-04 09:06:19+03'),
('GET',     'http://aerodesk.local/api/v1/privilege',                                           '200', '2026-06-04 09:07:44+03'),
('POST',    'http://aerodesk.local/api/v1/tickets',                                             '200', '2026-06-04 09:09:27+03'),
('GET',     'http://aerodesk.local/api/v1/tickets',                                             '200', '2026-06-04 09:10:03+03'),
('DELETE',  'http://aerodesk.local/api/v1/tickets/33333333-3333-4333-8333-333333333333',        '204', '2026-06-04 09:11:02+03'),
('GET',     'http://aerodesk.local/api/v1/statistics?page=1&size=20',                           '200', '2026-06-04 09:12:58+03'),
('GET',     'http://aerodesk.local/api/v1/flights?page=2&size=20',                              '200', '2026-06-04 09:14:41+03'),
('PATCH',   'http://aerodesk.local/api/v1/profile',                                             '200', '2026-06-04 09:15:42+03'),
('PUT',     'http://aerodesk.local/api/v1/privilege',                                           '200', '2026-06-04 09:16:18+03'),
('OPTIONS', 'http://aerodesk.local/api/v1/flights',                                             '200', '2026-06-04 09:17:02+03'),
('GET',     'http://aerodesk.local/api/v1/flights?flightNumber=AD101',                          '200', '2026-06-04 09:18:21+03'),
('GET',     'http://aerodesk.local/api/v1/flights?flightNumber=UNKNOWN',                        '404', '2026-06-04 09:19:21+03'),
('GET',     'http://aerodesk.local/api/v1/tickets',                                             '401', '2026-06-04 09:20:03+03'),
('POST',    'http://aerodesk.local/api/v1/tickets',                                             '409', '2026-06-04 09:21:27+03'),
('GET',     'http://aerodesk.local/api/v1/statistics?page=2&size=20',                           '200', '2026-06-04 09:22:58+03'),
('GET',     'http://aerodesk.local/api/v1/flights?fromAirport=Санкт-Петербург',                 '200', '2026-06-04 09:23:03+03'),
('GET',     'http://aerodesk.local/api/v1/flights?toAirport=Калининград',                       '200', '2026-06-04 09:24:14+03'),
('POST',    'http://aerodesk.local/api/v1/user/register',                                       '201', '2026-06-04 09:25:15+03'),
('GET',     'http://aerodesk.local/api/v1/me',                                                  '200', '2026-06-04 09:26:19+03'),
('GET',     'http://aerodesk.local/api/v1/privilege/history',                                   '200', '2026-06-04 09:27:44+03'),
('POST',    'http://aerodesk.local/api/v1/tickets',                                             '200', '2026-06-04 09:29:27+03'),
('GET',     'http://aerodesk.local/api/v1/tickets',                                             '200', '2026-06-04 09:30:03+03'),
('GET',     'http://aerodesk.local/api/v1/flights?page=3&size=20',                              '200', '2026-06-04 09:31:41+03'),
('GET',     'http://aerodesk.local/api/v1/flights?minDatetime=2026-06-01T00:00:00',             '200', '2026-06-04 09:32:32+03'),
('GET',     'http://aerodesk.local/api/v1/flights?maxDatetime=2026-06-30T23:59:00',             '200', '2026-06-04 09:33:32+03'),
('DELETE',  'http://aerodesk.local/api/v1/tickets/10000000-0000-4000-8000-000000000003',        '204', '2026-06-04 09:34:02+03'),
('GET',     'http://aerodesk.local/api/v1/statistics?page=1&size=50',                           '200', '2026-06-04 09:35:58+03'),
('GET',     'http://aerodesk.local/api/v1/flights/AD950',                                       '404', '2026-06-04 09:36:21+03'),
('POST',    'http://aerodesk.local/api/v1/user/login',                                          '401', '2026-06-04 09:37:15+03'),
('GET',     'http://aerodesk.local/api/v1/bonus-service/health',                                '500', '2026-06-04 09:38:07+03'),
('GET',     'http://aerodesk.local/api/v1/statistics?page=3&size=20',                           '200', '2026-06-04 09:39:58+03');

SELECT setval('public.statistics_id_seq', GREATEST((SELECT COALESCE(MAX(id), 1) FROM public.statistics), 1), true);

COMMIT;
