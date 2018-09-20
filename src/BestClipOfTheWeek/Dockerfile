FROM microsoft/dotnet:2.1-aspnetcore-runtime AS base
WORKDIR /app
EXPOSE 60998
EXPOSE 44397

FROM microsoft/dotnet:2.1-sdk AS build
WORKDIR /src
COPY ["BestClipOfTheWeek/BestClipOfTheWeek.csproj", "BestClipOfTheWeek/"]
RUN dotnet restore "BestClipOfTheWeek/BestClipOfTheWeek.csproj"
COPY . .
WORKDIR "/src/BestClipOfTheWeek"
RUN dotnet build "BestClipOfTheWeek.csproj" -c Release -o /app

FROM build AS publish
RUN dotnet publish "BestClipOfTheWeek.csproj" -c Release -o /app

FROM base AS final
WORKDIR /app
COPY --from=publish /app .
ENTRYPOINT ["dotnet", "BestClipOfTheWeek.dll"]