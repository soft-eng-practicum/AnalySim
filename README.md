# Analysim

Analysim is a free online web platform enabling researchers to analyze
and share data by providing interactive visualizations, and
collaborate with others.  The open platform is specialized for working
with high-dimensional data sets such as those constructed via
computational modeling.  Analysim also allows you to run custom
analysis on any type of data.

## Installation
Clone the [Analysim Repository](https://github.com/soft-eng-practicum/AnalySim) from [GitHub](http://www.github.com) so that you have the project locally.
```sh
git clone https://github.com/soft-eng-practicum/AnalySim.git
```

### Required software for development

- [Visual Studio](https://visualstudio.microsoft.com/downloads/) or [ASP.Net 6.0 command-line interface (CLI)](https://dotnet.microsoft.com/en-us/download) (Required)
- [Visual Studio Code](https://code.visualstudio.com/download) or other editor
- [Postman](https://www.postman.com/downloads/) for testing API calls
- [Python](https://www.python.org/downloads/) for building project
- [Docker](https://www.docker.com/products/docker-desktop) for testing deployment
- [Azure Data Studio](https://docs.microsoft.com/en-us/sql/azure-data-studio/download-azure-data-studio?view=sql-server-ver15) or use online [Azure Portal](https://portal.azure.com) for browsing Azure Blob Storage 

### Installing Angular package dependencies

After you have cloned the Analysim repository on your local machine,
use the terminal to navigate to the
`src/Analysim.Web/ClientApp` folder and run the following
commands.

```sh
npm install
npm run build:jupyterlite
```

`build:jupyterlite` script:

- installs and builds the AnalySim JupyterLite bridge extension
- creates `src/assets/jupyter/venv`
- installs `src/assets/jupyter/requirements.txt` into that venv
- runs `jupyter lite build` from the venv
- copies the built bridge extension into `src/assets/jupyter/dist/extensions/@analysim/jupyterlite-bridge`

The AnalySim bridge is a JupyterLite/JupyterLab frontend extension that enables communication between the Angular application and the embedded JupyterLite environment.

### Connecting to databases and other services

Analysim currently requires a SQL database (PostgreSQL) for both relational data and manual blob storage (Azure BlobStorage is no longer used / required). 

In addition, an Outlook account is needed for email functionality. 

All of these services are accessed via authentication information stored in the `appsettings.json` and `appsettings.Development.json` files which should be added under the `src/Analysim.Web` folder. 

The structure of the files are as follows (`XXX` means redacted):

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Warning",
      "Microsoft.Hosting.Lifetime": "Information"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DBConnectionString": "User ID=XXX;Password=XXX;Server=XXX;Port=5432;Database=XXX;Integrated Security=true;Pooling=true;SSL Mode=Require;Trust Server Certificate=true",
  },
  "EmailSettings": {
    "Server": "smtp-mail.outlook.com",
    "Port": 587,
    "SenderName": "no-reply-analysim",
    "SenderEmail": "XXX",
    "Username": "XXX",
    "Password": "XXX"
  },
  "ClientSettings": {
    "BaseUrl": "https://www.analysim.tech"
  },
  "JwtSettings": {
    "Issuer": "AnalySim",
    "Secret": "XXX",
    "ExpireTime": 60,
    "Audience": "https://www.analysim.tech"
  },
  "UserQuota":  100000000,
  "registrationCodes": [ "123" ],
  "AdminUsers": [
  "ADMIN",
  "XXX"
  ]
}

```

#### Adding admin users

Admin access in Analysim is controlled through the AdminUsers section of the `appsettings.json` and `appsettings.Development.json`. Each entry in the list corresponds to the username of a registered Analysim user. Admin users will see an Admin link in the navigation bar and can access the /admin section of the platform. To add or remove admin privileges, simply update this list and restart the server.

⚠️ Important: The usernames must exactly match the usernames stored in the database (full uppercase eg. "ADMIN").

#### Email account

Outlook no longer allows simple email authentication, so you must use another service that provides password authentication (e.g. Gmail). You can either use an existing account or create a new one and then fill in the `XXX` values under the section `EmailSettings` in the above file.

For email services, the correct BaseUrl is required within appsettings. For development, in `appsettings.Development.json` use: 'https://localhost:5001'. For deployment, in in `appsettings.json` the BaseUrl should match the necessary url.

#### SQL database (also see Docker Compose option below)

If you don't have a SQL database yet, download and install [PostgreSQL](https://www.postgresql.org/download/). See the example for [installing on Ubuntu 22.04](https://linuxhint.com/install-and-setup-postgresql-database-ubuntu-22-04/). Create a user account ([tutorial](https://medium.com/coding-blocks/creating-user-database-and-adding-access-on-postgresql-8bfcd2f4a91e)) and replace the `XXX` values in the `DBConnectionString` above with the correct ones. Once you entered the correct details, you must be able to initialize and populate the database by using the Entity Framework migration tool by running the following command in the `src/Analysim.Web` folder:

```
dotnet ef database update
```

#### Azure Blob Storage

Blob storage is now replaced with the PostgreSQL database and no longer necessary. If you want to set it up regardless, follow these instructions. If you don't have an existing blob storage account, log into [Microsoft Azure](https://portal.azure.com), and create a ["Storage Account"](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-overview) with "Blob service" enabled. Then, select "Access Keys" on the left sidebar menu and copy one of the keys and insert both to replace the `XXX` in the `AzureStorageConnectionString` entry above. You will also need to insert your storage account name. In the same section on Azure, you can see the formatting for the correct Connection String as a guide. Blob storage falls under the [free student services](https://azure.microsoft.com/en-us/free/students/).

### Running the project

In **Visual Studio**, open up the `AnalySim.sln` file.  Click on
the run to start the project.  Once you have completed both steps,
your project should be up and running! 

Alternatively, without Visual Studio, you use .Net CLI from command
line by first navigating into the `src\Analysim.Web` folder:

```sh
dotnet run --environment Development
```
(This will also automatically run Angular and a [Swagger](https://learn.microsoft.com/en-us/aspnet/core/tutorials/getting-started-with-swashbuckle?view=aspnetcore-8.0&tabs=visual-studio) UI on port 5001)

## Deploying

The production Docker deployment is defined by the root `docker-compose.yml`.
It runs PostgreSQL, a one-shot EF Core migration container, the ASP.NET Core
backend, an Nginx frontend/static server, scheduled PostgreSQL backups, and a
Certbot renewal container.

Production data and secrets must live outside the repository. On Jetstream, use
the shared mounted data volume:

```text
/media/volume/Analysim-Data/
```

Create the expected external folders:

```sh
mkdir -p /media/volume/Analysim-Data/{config,postgres/data,postgres/certs,backups,certbot/conf,certbot/www}
```

Use these repository templates to create real external config files:

```text
deploy/config/postgres.env.example -> /media/volume/Analysim-Data/config/postgres.env
deploy/config/backend.env.example -> /media/volume/Analysim-Data/config/backend.env
deploy/config/appsettings.Production.example.json -> /media/volume/Analysim-Data/config/appsettings.Production.json
.env.example -> .env
```

The real files must not be committed. The backend image is designed to be safe to
push to a registry: production `appsettings`, connection strings, JWT secrets,
email credentials, registration codes, and certificates are mounted or supplied
at runtime.

The main stack starts in this order:

```text
postgres -> migration -> backend -> nginx
```

Run the stack:

```sh
docker compose build
docker compose up -d
```

Nginx is the public entry point on ports 80 and 443. It serves the Angular and
JupyterLite static files directly, proxies `/api/` to the backend, and uses
Let's Encrypt certificates mounted from `/media/volume/Analysim-Data/certbot`.

For first-time certificate issuance, start with a valid DNS record for the
configured `ANALYSIM_DOMAIN`, ensure port 80 reaches the Nginx container, then
run Certbot with the same mounted webroot and config paths. Renewal is handled
by the `certbot` service.

Backups are written to:

```text
/media/volume/Analysim-Data/backups/postgres
```

Restore testing instructions are in `deploy/backup/restore-test.md`.

Legacy files such as `Dockerfile`, `Dockerfile.run`, `docker-compose-db.yml`,
and the old scripts under `deploy/` are retained temporarily for reference while
the new deployment is validated.

## Google Summer of Code application examples

Two successful application examples can be found under the [doc/ folder](doc/).
