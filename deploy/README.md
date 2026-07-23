# AnalySim Docker Deployment

The root `docker-compose.yml` is the main deployment entry point.

## Services

- `postgres`: PostgreSQL with externally mounted persistent data.
- `migration`: one-shot EF Core migration bundle.
- `backend`: ASP.NET Core API running Kestrel on the internal Docker network.
- `nginx`: public HTTP/HTTPS entry point, static Angular/JupyterLite server, and `/api/` reverse proxy.
- `backup`: scheduled PostgreSQL dumps with retention pruning.
- `certbot`: Let's Encrypt renewal loop using the Nginx webroot.

## External State

Copy `.env.example` to `.env`, then change the values for your deployment.
The `.env` file is ignored by git and must not be committed.

Persistent state is controlled by:

```text
ANALYSIM_DATA_ROOT=/path/to/persistent/analysim-data
```

If you run shell commands that use this value, export it too:

```sh
export ANALYSIM_DATA_ROOT=/path/to/persistent/analysim-data
export ANALYSIM_DOMAIN=your-domain.example
```

Expected layout:

```text
$ANALYSIM_DATA_ROOT/
  backups/
  certbot/
    conf/
    www/
  postgres/
    certs/
      server.crt
      server.key
    data/
```

Change these before production:

- `ANALYSIM_DATA_ROOT`
- `ANALYSIM_DOMAIN`
- `TLS_CERT_PATH` and `TLS_KEY_PATH`
- `POSTGRES_PASSWORD` and `DB_CONNECTION_STRING`
- `JWT_SECRET`, `CLIENT_BASE_URL`, `ADMIN_USER`, `REGISTRATION_CODE`, and email settings

## First Run

1. Point DNS for `ANALYSIM_DOMAIN` at the server.
2. Copy `.env.example` to `.env` and update the values.
3. Add PostgreSQL TLS files under `postgres/certs`.
4. Issue the first Let's Encrypt certificate using the same Certbot paths:

   ```sh
   docker run --rm \
     -v "$ANALYSIM_DATA_ROOT/certbot/conf:/etc/letsencrypt" \
     -v "$ANALYSIM_DATA_ROOT/certbot/www:/var/www/certbot" \
     certbot/certbot certonly \
     --webroot \
     --webroot-path /var/www/certbot \
     -d "$ANALYSIM_DOMAIN"
   ```

5. Start the stack:

   ```sh
   docker compose up --build -d
   ```

## Validation

```sh
docker compose ps
docker compose logs migration
curl -I "https://$ANALYSIM_DOMAIN/"
curl "https://$ANALYSIM_DOMAIN/api/health"
```

Open a project notebook and confirm the JupyterLite iframe loads from
`/assets/jupyter/dist/lab/index.html`.
