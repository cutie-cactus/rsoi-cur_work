#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./database_seed/00_seed_all.sh
# or, if you use a non-default namespace:
#   NS=my-namespace ./database_seed/00_seed_all.sh

NS="${NS:-default}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

run_sql() {
  local pod_label="$1"
  local db_name="$2"
  local sql_file="$3"

  echo "==> ${db_name}: applying ${sql_file}"
  local pod_name
  pod_name="$(kubectl get pod -n "$NS" -l "app=${pod_label}" -o jsonpath='{.items[0].metadata.name}')"

  if [[ -z "$pod_name" ]]; then
    echo "Pod with label app=${pod_label} was not found in namespace ${NS}" >&2
    exit 1
  fi

  kubectl exec -i -n "$NS" "$pod_name" -- psql -U postgres -d "$db_name" < "${SCRIPT_DIR}/${sql_file}"
}

# run_sql authdb       authdb       01_authdb_seed.sql
run_sql flightdb     flightdb     02_flightdb_seed.sql
run_sql ticketdb     ticketdb     03_ticketdb_seed.sql
run_sql bonusdb      bonusdb      04_bonusdb_seed.sql
# run_sql statisticsdb statisticsdb 05_statisticsdb_seed.sql

echo "All seed scripts were applied successfully."
