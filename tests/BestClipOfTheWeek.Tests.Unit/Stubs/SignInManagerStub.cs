using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;

namespace BestClipOfTheWeek.Tests.Unit.Stubs
{
    public class SignInManagerStub : SignInManager<IdentityUser>
    {
        public SignInManagerStub()
            : base(new Mock<UserManagerStub>().Object,
                new Mock<IHttpContextAccessor>().Object,
                new Mock<IUserClaimsPrincipalFactory<IdentityUser>>().Object,
                new Mock<IOptions<IdentityOptions>>().Object,
                new Mock<ILogger<SignInManager<IdentityUser>>>().Object,
                new Mock<IAuthenticationSchemeProvider>().Object)
        {
        }
    }
}
