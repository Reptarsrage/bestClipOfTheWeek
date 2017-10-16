using BestClipOfTheWeek.Models;
using BestClipOfTheWeek.Models.ReportViewModels;
using BestClipOfTheWeek.Models.TermViewModels;
using BestClipOfTheWeek.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Linq;
using System.Threading.Tasks;

namespace BestClipOfTheWeek.Controllers
{
    [Authorize]
    [Route("[controller]/[action]")]
    public class ReportController : Controller
    {
        private readonly ILogger _logger;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly ITermsManager _termsManager;
        private readonly UserManager<ApplicationUser> _userManager;

        public ReportController(
          ILogger<ReportController> logger,
          ITermsManager termsManager,
          UserManager<ApplicationUser> userManager,
          SignInManager<ApplicationUser> signInManager)
        {
            _logger = logger;
            _termsManager = termsManager;
            _userManager = userManager;
            _signInManager = signInManager;
        }

        [HttpGet]
        public async Task<IActionResult> Index()
        {
            if (!_signInManager.IsSignedIn(User))
            {
                return RedirectToAction(nameof(HomeController.Index), "Home");
            }

            var terms = await _termsManager.ReadTerms(_userManager.GetUserId(User));
            return View(new IndexViewModel { Terms = terms.Select(t => new TermViewModel(t)).OrderBy(t => t.Name).ToList() });
        }

        [HttpGet]
        public async Task<IActionResult> Quick()
        {
            if (!_signInManager.IsSignedIn(User))
            {
                return RedirectToAction(nameof(HomeController.Index), "Home");
            }

            var terms = await _termsManager.ReadTerms(_userManager.GetUserId(User));
            return View(new IndexViewModel { Terms = terms.Select(t => new TermViewModel(t)).OrderBy(t => t.Name).ToList() });
        }

        [HttpGet]
        public IActionResult Commenters()
        {
            if (!_signInManager.IsSignedIn(User))
            {
                return RedirectToAction(nameof(HomeController.Index), "Home");
            }

            return View(new IndexViewModel { Terms = null });
        }
    }
}