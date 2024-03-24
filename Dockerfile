# Requires running database
FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /source
COPY src .

# install NPM
RUN apt-get update -yq && apt-get upgrade -yq && apt-get install -yq curl git nano
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -yq nodejs build-essential
RUN npm install -g npm

# build project
WORKDIR Analysim.Web
RUN dotnet publish --configuration Release -o /app

# run database migrations
FROM build as database-update
WORKDIR /source/Analysim.Web
RUN dotnet tool install --global dotnet-ef --version 6.0
ENV PATH="$PATH:/root/.dotnet/tools"
CMD dotnet ef database update

# run project in new container
FROM mcr.microsoft.com/dotnet/aspnet:6.0 as run
WORKDIR /app
COPY --from=build /app .

#CMD ASPNETCORE_URLS=http://*:$PORT dotnet Analysim.Web.dll
CMD dotnet Analysim.Web.dll
