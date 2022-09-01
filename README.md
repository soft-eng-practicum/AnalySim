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

1. Download [Docker Desktop](https://www.docker.com/products/docker-desktop)
2. Download [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
3. Enable Docker Support and add a new DockerFile to Analysim.Web
4. Replace the content of DockerFile with the following code (update ASP.Net versions as necessary):
   ```
   FROM mcr.microsoft.com/dotnet/aspnet:3.1 AS base
   WORKDIR /app
   COPY . .
   
   CMD ASPNETCORE_URLS=http://*:$PORT dotnet Analysim.Web.dll
   ```
4. Publish Analysim.Web to a local folder(keep default location for folder). Can also be done on the command line: 
    ```bash
    dotnet publish --configuration Release
    ```
5. Copy the DockerFile into the publish folder that was just created 
6. Navigate to your publish folder in terminal:</br>
&nbsp; cd 'Analysim\src\Analysim.Web\bin\Release\netcoreapp3.1\publish' (Publish directory of the project where docker file at)
7. Run the following commands in terminal to update Heroku deployment:
   ```
   heroku login
   heroku container:login
   docker build -t analysim-dev .
   docker tag analysim-dev registry.heroku.com/analysim-dev
   docker push registry.heroku.com/analysim-dev
   heroku container:push web -a analysim-dev
   heroku container:release web -a analysim-dev
   ```
