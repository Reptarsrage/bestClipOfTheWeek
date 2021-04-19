using Microsoft.Extensions.DependencyInjection;

namespace BestClipOfTheWeek.Extensions
{
    public static class ServiceCollectionExtensions
    {
        /// <summary>
        /// Configures a CORS policy
        /// </summary>
        public static IServiceCollection ConfigureCors(this IServiceCollection services)
        {
            return services.AddCors(options =>
            {
                options.AddPolicy("CorsPolicy",
                    builder => builder.AllowAnyOrigin()
                    .AllowAnyMethod()
                    .AllowAnyHeader());
            });
        }
    }
}
