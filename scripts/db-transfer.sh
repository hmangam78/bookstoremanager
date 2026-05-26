#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_FILE_DEFAULT="$ROOT_DIR/postgres-backup.sql"
SERVICE_NAME="postgres"
POSTGRES_USER_DEFAULT="bookstore"
POSTGRES_PASSWORD_DEFAULT="bookstore"
POSTGRES_DB_DEFAULT="bookstore"

usage() {
  cat <<'EOF'
Usage:
  scripts/db-transfer.sh backup [output.sql]
  scripts/db-transfer.sh restore [input.sql]

Examples:
  scripts/db-transfer.sh backup
  scripts/db-transfer.sh restore
  scripts/db-transfer.sh restore /sgoinfre/students/hgamiz-g/bookstore/postgres-backup.sql
EOF
}

wait_for_postgres() {
  local retries=30
  local delay=2

  for ((i = 1; i <= retries; i++)); do
    if docker compose exec -T \
      -e PGPASSWORD="$POSTGRES_PASSWORD_DEFAULT" \
      "$SERVICE_NAME" \
      pg_isready -h localhost -U "$POSTGRES_USER_DEFAULT" -d "$POSTGRES_DB_DEFAULT" >/dev/null 2>&1; then
      return 0
    fi
    sleep "$delay"
  done

  echo "PostgreSQL is not ready after $((retries * delay)) seconds." >&2
  return 1
}

backup_db() {
  local output_file="${1:-$BACKUP_FILE_DEFAULT}"
  mkdir -p "$(dirname "$output_file")"

  if ! docker compose ps --status running --services | grep -qx "$SERVICE_NAME"; then
    echo "The $SERVICE_NAME service must be running before creating a backup." >&2
    exit 1
  fi

  docker compose exec -T \
    -e PGPASSWORD="$POSTGRES_PASSWORD_DEFAULT" \
    "$SERVICE_NAME" \
    pg_dumpall -h localhost -U "$POSTGRES_USER_DEFAULT" > "$output_file"
  echo "Backup written to $output_file"
}

restore_db() {
  local input_file="${1:-$BACKUP_FILE_DEFAULT}"

  if [[ ! -f "$input_file" ]]; then
    echo "Backup file not found: $input_file" >&2
    exit 1
  fi

  if ! docker compose ps --status running --services | grep -qx "$SERVICE_NAME"; then
    echo "Start the stack first with: docker compose up -d" >&2
    exit 1
  fi

  wait_for_postgres
  docker compose exec -T \
    -e PGPASSWORD="$POSTGRES_PASSWORD_DEFAULT" \
    "$SERVICE_NAME" \
    psql -h localhost -U "$POSTGRES_USER_DEFAULT" -d postgres < "$input_file"
  echo "Backup restored from $input_file"
}

case "${1:-}" in
  backup)
    backup_db "${2:-}"
    ;;
  restore)
    restore_db "${2:-}"
    ;;
  -h|--help|help|"")
    usage
    ;;
  *)
    echo "Unknown command: $1" >&2
    usage >&2
    exit 1
    ;;
esac