# PostgreSQL External Files

Production PostgreSQL data and certificates should live outside the repository:

```text
/media/volume/Analysim-Data/postgres/data
/media/volume/Analysim-Data/postgres/certs/server.crt
/media/volume/Analysim-Data/postgres/certs/server.key
```

The private key must be readable by the `postgres` user inside the container and should not be world-readable.
