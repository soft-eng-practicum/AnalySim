#!/bin/sh
set -eu

: "${POSTGRES_HOST:=postgres}"
: "${POSTGRES_PORT:=5432}"
: "${POSTGRES_DB:?POSTGRES_DB is required}"
: "${POSTGRES_USER:?POSTGRES_USER is required}"
: "${BACKUP_DIR:=/backups/postgres}"
: "${BACKUP_INTERVAL_SECONDS:=86400}"
: "${BACKUP_RETENTION_DAYS:=30}"
: "${RUN_ONCE:=false}"

if [ -n "${POSTGRES_PASSWORD_FILE:-}" ]; then
  PGPASSWORD="$(cat "$POSTGRES_PASSWORD_FILE")"
  export PGPASSWORD
fi

if [ -z "${PGPASSWORD:-}" ] && [ -n "${POSTGRES_PASSWORD:-}" ]; then
  PGPASSWORD="$POSTGRES_PASSWORD"
  export PGPASSWORD
fi

mkdir -p "$BACKUP_DIR"

run_backup() {
  timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
  tmp_file="$BACKUP_DIR/analysim-$timestamp.dump.tmp"
  final_file="$BACKUP_DIR/analysim-$timestamp.dump"

  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Starting PostgreSQL backup to $final_file"
  pg_dump \
    --host "$POSTGRES_HOST" \
    --port "$POSTGRES_PORT" \
    --username "$POSTGRES_USER" \
    --dbname "$POSTGRES_DB" \
    --format custom \
    --file "$tmp_file"

  mv "$tmp_file" "$final_file"
  size="$(du -h "$final_file" | awk '{print $1}')"
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] Backup complete: $final_file ($size)"

  find "$BACKUP_DIR" -type f -name 'analysim-*.dump' -mtime +"$BACKUP_RETENTION_DAYS" -print -delete
}

while true; do
  run_backup

  if [ "$RUN_ONCE" = "true" ]; then
    exit 0
  fi

  sleep "$BACKUP_INTERVAL_SECONDS"
done
