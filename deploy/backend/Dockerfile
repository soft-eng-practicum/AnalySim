# syntax=docker/dockerfile:1

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS restore
WORKDIR /src

COPY AnalySim.sln ./
COPY src/Analysim.Core/Analysim.Core.csproj src/Analysim.Core/
COPY src/Analysim.Infrastructure/Analysim.Infrastructure.csproj src/Analysim.Infrastructure/
COPY src/Analysim.Web/Analysim.Web.csproj src/Analysim.Web/
RUN dotnet restore src/Analysim.Web/Analysim.Web.csproj

FROM restore AS build
COPY src ./src
RUN dotnet publish src/Analysim.Web/Analysim.Web.csproj \
    --configuration Release \
    --output /app/publish \
    --no-restore \
    /p:BuildClientAppOnPublish=false \
    /p:BuildJupyterLiteOnBuild=false
RUN find /app/publish -maxdepth 1 -name 'appsettings*.json' -delete

FROM build AS migration-build
ENV ConnectionStrings__DBConnectionString="Host=localhost;Port=5432;Database=analysim;Username=analysim;Password=analysim"
ENV BuildClientAppOnPublish=false
ENV BuildJupyterLiteOnBuild=false
RUN dotnet tool install --tool-path /tools dotnet-ef --version 6.0.6
RUN dotnet restore src/Analysim.Web/Analysim.Web.csproj --runtime linux-x64
RUN dotnet build src/Analysim.Web/Analysim.Web.csproj \
    --configuration Release \
    --runtime linux-x64 \
    --no-self-contained \
    --no-restore \
    /p:BuildClientAppOnPublish=false \
    /p:BuildJupyterLiteOnBuild=false
RUN mkdir -p /app/migrations
RUN /tools/dotnet-ef migrations bundle \
    --project src/Analysim.Infrastructure/Analysim.Infrastructure.csproj \
    --startup-project src/Analysim.Web/Analysim.Web.csproj \
    --configuration Release \
    --runtime linux-x64 \
    --no-build \
    --output /app/migrations/efbundle

FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS runtime
WORKDIR /app
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:8080
ENV ClientApp__ServeFromBackend=false
EXPOSE 8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Analysim.Web.dll"]

FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS migration
WORKDIR /app
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ClientApp__ServeFromBackend=false
COPY --from=migration-build /app/migrations/efbundle ./efbundle
ENTRYPOINT ["./efbundle"]
