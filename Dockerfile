FROM microsoft/dotnet:2.1-aspnetcore-runtime AS base
WORKDIR /app
ENV ASPNETCORE_URLS http://+:80
EXPOSE 80

FROM microsoft/dotnet:2.1-sdk AS build
WORKDIR /build
COPY ./ ./

# Download and install node
ENV NODE_VERSION 8.12.0
ENV NODE_DOWNLOAD_SHA 3df19b748ee2b6dfe3a03448ebc6186a3a86aeab557018d77a0f7f3314594ef6
RUN curl -SL "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.gz" -o nodejs.tar.gz \
    && echo "$NODE_DOWNLOAD_SHA nodejs.tar.gz" | sha256sum -c - \
    && tar -xzf "nodejs.tar.gz" -C /usr/local --strip-components=1 \
    && rm nodejs.tar.gz \
    && ln -s /usr/local/bin/node /usr/local/bin/nodejs \
    && echo NODEJS VERSION: $(node --version)

# Download and install yarn
ENV YARN_VERSION 1.9.4
ENV YARN_DOWNLOAD_SHA 7667eb715077b4bad8e2a832e7084e0e6f1ba54d7280dc573c8f7031a7fb093e
RUN curl -SL "https://github.com/yarnpkg/yarn/releases/download/v${YARN_VERSION}/yarn-v${YARN_VERSION}.tar.gz" -o yarnpkg.tar.gz \
    && echo "$YARN_DOWNLOAD_SHA yarnpkg.tar.gz" | sha256sum -c - \
    && tar -xzf "yarnpkg.tar.gz" -C /usr/local --strip-components=1 \
    && rm yarnpkg.tar.gz \
    && echo YARN VERSION: $(yarn --version)

FROM build AS publish
RUN dotnet publish "src/BestClipOfTheWeek/BestClipOfTheWeek.csproj" -c Release -o /app

FROM base AS final
WORKDIR /app
COPY --from=publish /app .
ENTRYPOINT ["dotnet", "BestClipOfTheWeek.dll"]
