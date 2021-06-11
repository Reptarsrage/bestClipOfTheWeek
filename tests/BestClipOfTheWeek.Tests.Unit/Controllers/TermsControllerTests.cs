using AutoMapper;
using BestClipOfTheWeek.Controllers;
using BestClipOfTheWeek.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Xunit;

namespace BestClipOfTheWeek.Tests.Unit
{
    public class TermsControllerTests : UnitTestBase
    {
        private readonly TermsController Target;

        public TermsControllerTests() : base()
        {
            Target = new TermsController(
                The<ILogger<TermsController>>().Object,
                The<ITermsRepository>().Object,
                The<IMapper>().Object
            );
        }

        [Fact]
        public async Task Get_ReturnsOk()
        {
            // Arrange
            var expectedUserId = "EPECTED USER ID";
            var expectedTerms = new Models.Dto.Term[] {
                new Models.Dto.Term(),
                new Models.Dto.Term(),
                new Models.Dto.Term()
            };

            The<ITermsRepository>()
                .Setup(m => m.ReadTerms(expectedUserId))
                .ReturnsAsync(expectedTerms);

            The<IMapper>()
                .Setup(m => m.Map<Models.Term>(It.IsAny<Models.Dto.Term>()))
                .Returns(new Models.Term());

            Target.ControllerContext = new ControllerContext()
            {
                HttpContext = new DefaultHttpContext
                {
                    User = GenerateUser(expectedUserId)
                }
            };

            // Act
            var response = await Target.Get();

            // Assert
            Assert.Equal(3, response.ToArray().Length);
            VerifyAll();
        }

        private ClaimsPrincipal GenerateUser(string expectedUserId)
        {
            return new ClaimsPrincipal(new ClaimsIdentity[] {
                new ClaimsIdentity(new Claim[] {
                    new Claim(ClaimTypes.NameIdentifier, expectedUserId)
                })
            });
        }
    }
}
