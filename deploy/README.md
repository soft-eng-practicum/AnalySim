# AnalySim Docker Deployment

The root `docker-compose.yml` is the main deployment entry point.

## Services

- `postgres`: PostgreSQL with data on Jetstream shared storage.
- `migration`: one-shot EF Core migration bundle.
- `backend`: ASP.NET Core API running Kestrel on the internal Docker network.
- `nginx`: public HTTP/HTTPS entry point, static Angular/JupyterLite server, and `/api/` reverse proxy.
- `backup`: scheduled PostgreSQL dumps with retention pruning.
- `certbot`: Let's Encrypt renewal loop using the Nginx webroot.

## External State

Production state should be stored under:

```text
/media/volume/Analysim-Data/
```

Expected layout:

```text
/media/volume/Analysim-Data/
  backups/
  certbot/
    conf/
    www/
  config/
    appsettings.Production.json
    backend.env
    postgres.env
  postgres/
    certs/
      server.crt
      server.key
    data/
```

Use `deploy/config/*.example` and `.env.example` as templates.

## First Run

1. Point DNS for `ANALYSIM_DOMAIN` at the server.
2. Create the external folders and config files.
3. Add PostgreSQL TLS files under `postgres/certs`.
4. Issue the first Let's Encrypt certificate using the same Certbot paths:

   ```sh
   docker run --rm \
     -v /media/volume/Analysim-Data/certbot/conf:/etc/letsencrypt \
     -v /media/volume/Analysim-Data/certbot/www:/var/www/certbot \
     certbot/certbot certonly \
     --webroot \
     --webroot-path /var/www/certbot \
     -d dev.analysim.tech
   ```

5. Start the stack:

   ```sh
   docker compose up --build -d
   ```

## Validation

```sh
docker compose ps
docker compose logs migration
curl -I https://dev.analysim.tech/
curl https://dev.analysim.tech/api/health
```

Open a project notebook and confirm the JupyterLite iframe loads from
`/assets/jupyter/dist/lab/index.html`.

## Legacy Files

The old root `Dockerfile`, `Dockerfile.run`, `docker-compose-db.yml`, and legacy
scripts in this folder are retained temporarily for reference. They should be
removed after the new Compose stack has been deployed, backup restore has been
tested, and no external automation references them.
