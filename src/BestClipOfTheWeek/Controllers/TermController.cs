using BestClipOfTheWeek.Models;
using BestClipOfTheWeek.Models.TermViewModels;
using BestClipOfTheWeek.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BestClipOfTheWeek.Controllers
{
    [Authorize]
    public class TermController : Controller
    {
        private readonly ILogger _logger;
        private readonly ITermsManager _termsManager;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly JsonSerializerSettings _serializationSettings;
        private readonly SignInManager<ApplicationUser> _signInManager;

        public TermController(
          ILogger<TermController> logger,
          ITermsManager termsManager,
          UserManager<ApplicationUser> userManager,
          SignInManager<ApplicationUser> signInManager)
        {
            _logger = logger;
            _termsManager = termsManager;
            _userManager = userManager;
            _signInManager = signInManager;
            _serializationSettings = new JsonSerializerSettings
            {
                Formatting = Formatting.None
            };
        }

        [HttpGet]
        [Route("Term")]
        [Route("Term/Index")]
        public async Task<IActionResult> Index()
        {
            if (!_signInManager.IsSignedIn(User))
            {
                return RedirectToAction(nameof(HomeController.Index), "Home");
            }

            var terms = await _termsManager.ReadTerms(_userManager.GetUserId(User));
            return View(new TermListViewModel
            {
                Terms = terms?.Select(t => new TermViewModel(t)).OrderBy(t => t.Name).ToList() ?? new List<TermViewModel>()
            });
        }

        [HttpPost]
        [Route("/api/Term")]
        public async Task<IActionResult> Post([FromBody]TermViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return StatusCode(400, string.Join(",", ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage))));
            }

            try
            {
                // Add
                var id = await _termsManager.AddTerm(_userManager.GetUserId(User), model.GetTerm());

                // Return
                model.TermId = id;
                return Json(model, _serializationSettings);
            }
            catch (Exception e)
            {
                return StatusCode(500, $"Add failed for term. Please try again. {e.Message}");
            }
        }

        [HttpPatch]
        [Route("/api/Term")]
        public async Task<IActionResult> Patch([FromBody]TermViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return StatusCode(400, string.Join(",", ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage))));
            }

            try
            {
                // Update
                await _termsManager.UpdateTerm(model.GetTerm());

                // Return
                return Json(model, _serializationSettings);
            }
            catch (Exception e)
            {
                return StatusCode(500, $"Update failed for term. Please try again. {e.Message}");
            }
        }

        [HttpDelete]
        [Route("/api/Term/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                // Delete
                await _termsManager.RemoveTerm(id);

                // Return
                return Ok();
            }
            catch (Exception e)
            {
                return StatusCode(500, $"Deletion failed for term. Please try again. {e.Message}");
            }
        }
    }
}