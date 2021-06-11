using BestClipOfTheWeek.Data;
using BestClipOfTheWeek.Repositories;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace BestClipOfTheWeek
{
    public class Startup
    {
        public Startup(IConfiguration configuration, IWebHostEnvironment environment)
        {
            Configuration = configuration;
            Environment = environment;
        }

        public IConfiguration Configuration { get; }
        public IWebHostEnvironment Environment { get; }

        public void ConfigureServices(IServiceCollection services)
        {
            // Enable Entity Framework
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlite(
                    Configuration.GetConnectionString("DefaultConnection")));

            services.AddDatabaseDeveloperPageExceptionFilter();

            // Add authentication (Identity Server, JWT)
            services.AddDefaultIdentity<Models.Dto.ApplicationUser>(options => options.SignIn.RequireConfirmedAccount = true)
                .AddEntityFrameworkStores<ApplicationDbContext>();

            services.AddIdentityServer()
                .AddApiAuthorization<Models.Dto.ApplicationUser, ApplicationDbContext>();

            // Add MVC
            services.AddControllersWithViews();

            // Add Razor
            services.AddRazorPages();

            // Enable AutoMapper
            services.AddAutoMapper(typeof(Startup));

            // Enable compression
            services.AddResponseCompression(o =>
            {
                o.EnableForHttps = true;
            });

            // Enable default memory cache
            services.AddMemoryCache();

            // Configure Dependency Injection and Authentication
            ConfigureDependencyInjection(services);
            ConfigureAuthentication(services);
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseMigrationsEndPoint();
            }
            else
            {
                app.UseForwardedHeaders();
                app.UseExceptionHandler("/Error");
                app.UseHsts();
                app.UseResponseCompression();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseRouting();

            app.UseAuthentication();
            app.UseIdentityServer();
            app.UseAuthorization();
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller}/{action=Index}/{id?}");
                endpoints.MapRazorPages();

                endpoints.MapFallbackToFile("index.html");
            });
        }

        protected virtual void ConfigureDependencyInjection(IServiceCollection services)
        {
            // Configuration for Forwarded Headers.
            // Handle headers set by our load balancer.
            // This allows authentication to work even though the load balancer removes the https scheme from the request
            services.Configure<ForwardedHeadersOptions>(options =>
            {
                options.ForwardedHeaders = Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedFor | Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedProto;

                // Only loopback proxies are allowed by default.
                // Clear that restriction because forwarders are enabled by explicit configuration.
                options.KnownNetworks.Clear();
                options.KnownProxies.Clear();
            });

            // Configure compression
            services.Configure<BrotliCompressionProviderOptions>(options =>
            {
                options.Level = System.IO.Compression.CompressionLevel.Fastest;
            });

            // Repositories
            services.AddScoped<ITermsRepository, TermsRepository>();
        }

        protected virtual void ConfigureAuthentication(IServiceCollection services)
        {
            // Add JWT verification (when not testing)
            if (!Environment.IsEnvironment("Testing"))
            {
                services.AddAuthentication()
                    .AddIdentityServerJwt();
            }
        }
    }
}
