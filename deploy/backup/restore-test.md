# PostgreSQL Restore Test

Use a disposable database for restore verification. Do not restore over production.

```sh
createdb --host postgres --username "$POSTGRES_USER" analysim_restore_test
pg_restore \
  --host postgres \
  --username "$POSTGRES_USER" \
  --dbname analysim_restore_test \
  --clean \
  --if-exists \
  --no-owner \
  /backups/postgres/analysim-YYYYMMDDTHHMMSSZ.dump
```

After restore, run smoke queries against Identity tables, projects, notebooks, and blob content tables. Drop the disposable database after verification.
