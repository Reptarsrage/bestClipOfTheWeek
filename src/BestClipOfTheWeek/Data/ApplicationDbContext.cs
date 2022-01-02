using Duende.IdentityServer.EntityFramework.Options;
using Microsoft.AspNetCore.ApiAuthorization.IdentityServer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace BestClipOfTheWeek.Data
{
    public class ApplicationDbContext : ApiAuthorizationDbContext<Models.Dto.ApplicationUser>
    {
        public DbSet<Models.Dto.Term> Terms { get; set; } = default!;

        public ApplicationDbContext(
            DbContextOptions options,
            IOptions<OperationalStoreOptions> operationalStoreOptions) : base(options, operationalStoreOptions)
        {
        }
    }
}
