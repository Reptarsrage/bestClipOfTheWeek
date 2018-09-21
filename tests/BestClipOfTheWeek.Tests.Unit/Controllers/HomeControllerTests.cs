using BestClipOfTheWeek.Controllers;
using BestClipOfTheWeek.Tests.Unit.Stubs;
using Microsoft.AspNetCore.Mvc;
using Moq;
using System.Security.Claims;
using Xunit;

namespace BestClipOfTheWeek.Tests.Unit.Controllers
{
    public class HomeControllerTests
    {
        protected HomeController Target { get; }
        protected Mock<SignInManagerStub> MockSignInManager;

        public HomeControllerTests()
        {
            MockSignInManager = new Mock<SignInManagerStub>();
            Target = new HomeController(MockSignInManager.Object);
        }

        [Fact]
        public void Index_WhenSignedIn_ReturnsCorrectView()
        {
            // Arrange
            MockSignInManager
                .Setup(m => m.IsSignedIn(It.IsAny<ClaimsPrincipal>()))
                .Returns(true);

            // Act
            var actual = Target.Index();

            // Assert
            Assert.IsType<RedirectToActionResult>(actual);
            Assert.Equal("SampleData", ((RedirectToActionResult)actual).ControllerName);
            Assert.Equal("Index", ((RedirectToActionResult)actual).ActionName);
        }

        [Fact]
        public void Index_WhenNotSignedIn_ReturnsCorrectView()
        {
            // Arrange
            MockSignInManager
                .Setup(m => m.IsSignedIn(It.IsAny<ClaimsPrincipal>()))
                .Returns(false);

            // Act
            var actual = Target.Index();

            // Assert
            Assert.IsType<ViewResult>(actual);
            Assert.Null(((ViewResult)actual).ViewName);
        }
    }
}
