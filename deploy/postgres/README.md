# PostgreSQL External Files

Production PostgreSQL data and certificates should live outside the repository:

```text
$ANALYSIM_DATA_ROOT/postgres/data
$ANALYSIM_DATA_ROOT/postgres/certs/server.crt
$ANALYSIM_DATA_ROOT/postgres/certs/server.key
```

The private key must be readable by the `postgres` user inside the container and should not be world-readable.
