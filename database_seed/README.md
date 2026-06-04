# Наполнение баз данных для защиты

## Демо-пользователи

| login | password | role |
|---|---|---|
| admin | admin123 | ADMIN |
| moderator | qwerty123 | MODERATOR |
| ivan | qwerty123 | USER |
| alina | user123 | USER |
| demo | demo123 | USER |

## Что изменено в seed

- `flightdb`: таблица `public.flight` очищается перед вставкой. Добавлены прошедшие рейсы за май — начало июня 2026 г. и будущие рейсы для покупки.
- `ticketdb`: таблица `public.ticket` очищается перед вставкой. Добавлены билеты на прошедшие рейсы, чтобы в разделе «Билеты» отображалась история старых поездок.
- `bonusdb`: история бонусов пересоздаётся под новые демо-билеты.
- `statisticsdb`: добавлен расширенный набор логов для диаграмм и списка запросов.

## Быстрый запуск всех seed-скриптов

Из корня проекта:

```bash
chmod +x database_seed/00_seed_all.sh
./database_seed/00_seed_all.sh
```

Если Kubernetes namespace не `default`:

```bash
NS=<namespace> ./database_seed/00_seed_all.sh
```

## Ручной запуск одного скрипта

```bash
kubectl get pods
AUTH_POD=$(kubectl get pod -l app=authdb -o jsonpath='{.items[0].metadata.name}')
kubectl exec -i "$AUTH_POD" -- psql -U postgres -d authdb < database_seed/01_authdb_seed.sql
```

Аналогично:

```bash
FLIGHT_POD=$(kubectl get pod -l app=flightdb -o jsonpath='{.items[0].metadata.name}')
kubectl exec -i "$FLIGHT_POD" -- psql -U postgres -d flightdb < database_seed/02_flightdb_seed.sql

TICKET_POD=$(kubectl get pod -l app=ticketdb -o jsonpath='{.items[0].metadata.name}')
kubectl exec -i "$TICKET_POD" -- psql -U postgres -d ticketdb < database_seed/03_ticketdb_seed.sql

BONUS_POD=$(kubectl get pod -l app=bonusdb -o jsonpath='{.items[0].metadata.name}')
kubectl exec -i "$BONUS_POD" -- psql -U postgres -d bonusdb < database_seed/04_bonusdb_seed.sql

STATS_POD=$(kubectl get pod -l app=statisticsdb -o jsonpath='{.items[0].metadata.name}')
kubectl exec -i "$STATS_POD" -- psql -U postgres -d statisticsdb < database_seed/05_statisticsdb_seed.sql
```

## Проверка после вставки

```bash
kubectl exec -it "$AUTH_POD" -- psql -U postgres -d authdb -c 'SELECT login, firstname, lastname, role FROM public."user" ORDER BY login;'
kubectl exec -it "$FLIGHT_POD" -- psql -U postgres -d flightdb -c 'SELECT flight_number, price, datetime FROM public.flight ORDER BY datetime LIMIT 12;'
kubectl exec -it "$TICKET_POD" -- psql -U postgres -d ticketdb -c 'SELECT username, flight_number, price, status FROM public.ticket ORDER BY username, flight_number;'
kubectl exec -it "$BONUS_POD" -- psql -U postgres -d bonusdb -c 'SELECT username, status, balance FROM public.privilege ORDER BY username;'
kubectl exec -it "$STATS_POD" -- psql -U postgres -d statisticsdb -c 'SELECT method, status_code, time FROM public.statistics ORDER BY time DESC LIMIT 10;'
```
