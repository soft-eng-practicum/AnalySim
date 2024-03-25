# Learn about building .NET container images:
# https://github.com/dotnet/dotnet-docker/blob/main/samples/README.md
FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /source

# copy csproj and restore as distinct layers
#COPY src/Analysim.Web/*.csproj .
#RUN dotnet restore --use-current-runtime

# copy and publish app and libraries
COPY src/ .
WORKDIR /source/Analysim.Web
#RUN dotnet publish --use-current-runtime --self-contained false --no-restore -o /app --configuration Release

# install NodeJS 18.x
# see https://github.com/nodesource/distributions/blob/master/README.md#deb
RUN apt-get update -yq 
RUN apt-get install curl gnupg -yq 
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - &&\
  apt-get install -y nodejs

# build app
RUN dotnet publish -o /app --configuration Release

# problem: this needs to run when we bring up the docker stack, or maybe as a separate exec command
# see: https://codebuckets.com/2020/08/14/applying-entity-framework-migrations-to-a-docker-container/
# or add to docker compose: https://itnext.io/database-development-in-docker-with-entity-framework-core-95772714626f
#RUN dotnet tool install --global dotnet-ef
#ENV PATH="$PATH:/root/.dotnet/tools"
#RUN dotnet ef database update

# final stage/image
FROM mcr.microsoft.com/dotnet/aspnet:6.0
WORKDIR /app
COPY --from=build /app .
ENTRYPOINT ["dotnet", "Analysim.Web.dll"]
