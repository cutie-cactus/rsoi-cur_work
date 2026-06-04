# Автоматическое наполнение БД через GitHub Actions

В проекте добавлен шаг в `.github/workflows/build.yml`:

```yaml
- name: Seed demo database data
  run: |
    chmod +x database_seed/00_seed_all.sh
    ./database_seed/00_seed_all.sh
```

Как это работает:

1. GitHub Actions делает `checkout` репозитория во временную папку runner'а.
2. Runner собирает Docker-образы и деплоит PostgreSQL и сервисы в Yandex Kubernetes.
3. После `kubectl wait --for=condition=ready pod --all` runner запускает `database_seed/00_seed_all.sh`.
4. Скрипт находит pod'ы БД по label'ам `app=authdb`, `app=flightdb`, `app=ticketdb`, `app=bonusdb`, `app=statisticsdb`.
5. SQL-файлы передаются в pod'ы через `kubectl exec -i ... -- psql ... < file.sql`.
6. После завершения workflow файлы на runner'е исчезают, а данные остаются в PostgreSQL-таблицах внутри кластера.

Важно: сами SQL-файлы не копируются в Kubernetes как постоянные файлы. Kubernetes получает только результат выполнения SQL — строки в таблицах.

## Как запустить

Достаточно запушить изменения в ветку, на которую настроен workflow:

```bash
git add .github/workflows/build.yml database_seed
git commit -m "Add automated database seed"
git push origin yandex-cloud3
```

Или запустить вручную из GitHub UI: **Actions → Build & Deploy to Yandex Cloud → Run workflow**.

## Как проверить после выполнения

```bash
kubectl exec -it $(kubectl get pod -l app=authdb -o jsonpath='{.items[0].metadata.name}') -- \
  psql -U postgres -d authdb -c 'SELECT login, firstname, lastname, role FROM public."user";'
```

```bash
kubectl exec -it $(kubectl get pod -l app=flightdb -o jsonpath='{.items[0].metadata.name}') -- \
  psql -U postgres -d flightdb -c 'SELECT flight_number, price, datetime FROM public.flight ORDER BY datetime LIMIT 10;'
```
