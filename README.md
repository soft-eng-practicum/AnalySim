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
- [Docker](https://www.docker.com/products/docker-desktop) for testing deployment
- [Azure Data Studio](https://docs.microsoft.com/en-us/sql/azure-data-studio/download-azure-data-studio?view=sql-server-ver15) or use online [Azure Portal](https://portal.azure.com) for browsing Azure Blob Storage 

### Installing Angular package dependencies

After you have cloned the Analysim repository on your local machine,
use the terminal to navigate to the
`AnalySim\src\Analysim.Web\ClientApp` folder and run the following
command.

```sh
npm install
```

### Connecting to databases and other services

Analysim requires two databases to operate: one SQL database (PostgreSQL) for relational data and one Azure BlobStorage database for keeping uploaded user files. In addition, an Outlook account is needed for the email functionality. All of these services are accessed via authentication information stored in the `appsettings.json` and `appsettings.Development.json` files under the `src/Analysim.Web` folder. The structure of the files are as follows (`XXX` means redacted):

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
    "AzureStorageConnectionString": "DefaultEndpointsProtocol=https;AccountName=XXX;AccountKey=XXX;EndpointSuffix=core.windows.net"
  },
  "EmailSettings": {
    "Server": "smtp-mail.outlook.com",
    "Port": 587,
    "SenderName": "no-reply-analysim",
    "SenderEmail": "XXX",
    "Username": "XXX",
    "Password": "XXX"
  },
  "JwtSettings": {
    "Issuer": "AnalySim",
    "Secret": "XXX",
    "ExpireTime": 60,
    "Audience": "https://www.analysim.tech/"
  },
  "UserQuota":  100000000
}

```

#### SQL database

If you don't have a SQL database yet, download and install [PostgreSQL](https://www.postgresql.org/download/). See the example for [installing on Ubuntu 22.04](https://linuxhint.com/install-and-setup-postgresql-database-ubuntu-22-04/). Create a user account ([tutorial](https://medium.com/coding-blocks/creating-user-database-and-adding-access-on-postgresql-8bfcd2f4a91e)) and replace the `XXX` values in the `DBConnectionString` above with the correct ones. Once you entered the correct details, you must be able to initialize and populate the database by using the Entity Framework migration tool by rinning the following command in the `src/Analysim.Web` folder:

```
dotnet ef database update
```

#### Azure Blob Storage

If you don't have an existing blob storage account, log into [Microsoft Azure](https://portal.azure.com), and create a ["Storage Account"](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-overview) with "Blob service" enabled. Then, select "Access Keys" on the left sidebar menu and copy one of the keys and insert both to replace the `XXX` in the `AzureStorageConnectionString` entry above. You will also need to insert your storage account name. In the same section on Azure, you can see the formatting for the correct Connection String as a guide. Blob storage falls under the [free student services](https://azure.microsoft.com/en-us/free/students/).

#### Outlook.com account

You can either use an existing Outlook account or create a new one and then fill in the `XXX` values under the section `EmailSettings` in the above file.

### Running the project

**Step 1:**

In **Visual Studio Code** (or other editor), open up the Analysim
project folder.  Using a terminal, navigate to
`src\Analysim.Web\ClientApp` and run the following command (also works
from Command Line):

```
ng serve -o
```

**Step 2:**

Next, in **Visual Studio**, open up the `AnalySim.sln` file.  Click on
the run to start the project.  Once you have completed both steps,
your project should be up and running! 

Alternatively, without Visual Studio, you use .Net CLI from command
line by first navigating into the `src\Analysim.Web` folder:

```sh
dotnet run
```

## Deploying

The overall process of deployment is explained in the tutorial video on
[deploying ASP.Net on Heroku using Docker](https://www.youtube.com/watch?v=gQMT4al2Grg:).

### Prerequisites
1. Download [Docker Desktop](https://www.docker.com/products/docker-desktop)
2. Download [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
3. Enable Docker Support
   
### Publish .Net project and create Docker image

*Note:* Prepend `sudo` before each `docker` and `heroku` (except `dotnet`) command on Mac/Linux.

4. Publish *Analysim.Web* to the local folder (keep default location for folder), which can also be done on the command line: 
    ```bash
    dotnet publish --configuration Release
    ```
1. Create the Docker image by running the following in the base project folder (e.g. `Analysim/`) :
    ```bash
    docker build -t analysim-dev -f deploy/Dockerfile .
    ```
1. Test image locally, by running it:
   ```bash
   docker run -it -p 127.0.0.1:80:80/tcp analysim-dev
   ```
   You can test by opening a browser to http://localhost:80 (not https).

### Register and upload Docker image to Heroku

*Note:* Prepend `sudo` before each `docker` and `heroku` (except `dotnet`) command on Mac/Linux.

Run the following commands in terminal to update Heroku deployment ([more info](https://devcenter.heroku.com/articles/container-registry-and-runtime)):

1. Login to Heroku and container service (if using `sudo`, you may need to copy-paste into browser):
   ```bash
   heroku login
   heroku container:login
   ```
1. Tag the image name on Heroku's container registry:
   ```bash
   docker tag analysim-dev registry.heroku.com/analysim-dev
   docker push registry.heroku.com/analysim-dev
   ```
1. Change to the `deploy/` folder and re-build image using Heroku CLI:
   ```bash
   cd deploy
   heroku container:push web -a analysim-dev --context-path=..
   heroku container:release web -a analysim-dev
   ```

## Google Summer of Code application examples

Two successful application examples can be found under the [doc/ folder](doc/).
