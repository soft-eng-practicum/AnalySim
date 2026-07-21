# External Production Configuration

Production configuration should be stored on the Jetstream shared data volume, not in Docker images:

```text
/media/volume/Analysim-Data/config/postgres.env
/media/volume/Analysim-Data/config/backend.env
/media/volume/Analysim-Data/config/appsettings.Production.json
```

Use the `*.example` files in this folder as templates. The real files must not be committed.
