# Analysim

Analysim is a free online web platform enabling researchers to analyze and share data by providing interactive visualizations, and collaborate with others.  The open platform is specialized for working with high-dimensional data sets such as those constructed via computational modeling.  Analysim also allows you to run custom analysis on any type of data.

## Installation
Clone the [Analysim Repository](https://github.com/soft-eng-practicum/AnalySim) from [GitHub](http://www.github.com) so that you have the project locally.
```sh
git clone https://github.com/soft-eng-practicum/AnalySim.git
```

### Download the following Software
- [Visual Studio Code](https://code.visualstudio.com/download) (Required)
- [Visual Studio](https://visualstudio.microsoft.com/downloads/) (Required)
- [Postman](https://www.postman.com/downloads/)
- [Docker](https://www.docker.com/products/docker-desktop)
- [Azure Data Studio](https://docs.microsoft.com/en-us/sql/azure-data-studio/download-azure-data-studio?view=sql-server-ver15)

### Package installation
After you have cloned the Analysim repository on your local machine, use the terminal to navigate to the `AnalySim\src\Analysim.Web\ClientApp` folder and run the following command.
```sh
npm install
```

#### Running the project
You will need to get the `appsettings.json` file(s) from the project admins in order to connect to the database.  Put these files under the `src/Analysim.Web` folder.

**Step 1:**
In **Visual Studio Code**, open up the Analysim project folder.  Using a terminal, navigate to `src\Analysim.Web\ClientApp` and run the following command (also works from Command Line):
```
ng serve -o
```

**Step 2:**
Next, in **Visual Studio**, open up the `AnalySim.sln` file.  Click on the run to start the project.  Once you have completed both steps, your project should be up and running! Alternatively, you can run from the command line:
```sh
dotnet run
```

## Deploying
In order to deploy AnalySim, you need to perform some steps ([Tutorial Video](https://www.youtube.com/watch?v=gQMT4al2Grg:)):

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
