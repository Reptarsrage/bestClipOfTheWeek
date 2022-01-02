using Microsoft.AspNetCore.Hosting;
using Serilog;
using Serilog.Exceptions;
using System.IO;

namespace TheArchives.Server.Extensions
{
    public static class IWebHostBuilderExtensions
    {
        /// <summary>
        /// Configures an application logger
        /// </summary>
        public static IWebHostBuilder AddLogging(this IWebHostBuilder webHostBuilder)
        {
            return webHostBuilder.UseSerilog((hostingContext, loggingConfiguration) =>
            {
                var logDirectory = hostingContext.Configuration["LogDirectory"];
                if (!string.IsNullOrEmpty(logDirectory))
                {
                    var logPath = Path.Combine(logDirectory, "log.txt");
                    loggingConfiguration.WriteTo.File(logPath, rollingInterval: RollingInterval.Day);
                }

                loggingConfiguration
                        .ReadFrom.Configuration(hostingContext.Configuration)
                        .Enrich.FromLogContext()
                        .Enrich.WithExceptionDetails()
                        .WriteTo.Console();
            });
        }
    }
}
