using BestClipOfTheWeek.Models;
using BestClipOfTheWeek.Models.Terms;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Newtonsoft.Json.Serialization;
using BestClipOfTheWeek.Repositories;

namespace BestClipOfTheWeek.Controllers
{
    [Authorize]
    [Route("[controller]/[action]")]
    public class TermController : Controller
    {
        private readonly ILogger _logger;
        private readonly ITermsRepository _termsManager;
        private readonly IMapper _mapper;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly JsonSerializerSettings _serializationSettings;
        private readonly SignInManager<ApplicationUser> _signInManager;

        public TermController(ILogger<TermController> logger, ITermsRepository termsManager, UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager, IMapper mapper)
        {
            _logger = logger;
            _termsManager = termsManager;
            _userManager = userManager;
            _signInManager = signInManager;
            _mapper = mapper;
            _serializationSettings = new JsonSerializerSettings
            {
                Formatting = Formatting.None,
                ContractResolver = new CamelCasePropertyNamesContractResolver()
            };
        }

        [HttpGet]
        [Route("/api/Term")]
        public async Task<IActionResult> Get()
        {
            var terms = await _termsManager.ReadTerms(_userManager.GetUserId(User));

            ;

            return Json(new TermListViewModel
            {
                Terms = terms?.Select(t => _mapper.Map<TermViewModel>(t)).OrderBy(t => t.Name).ToList() ?? new List<TermViewModel>()
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
                var id = await _termsManager.AddTerm(_userManager.GetUserId(User), _mapper.Map<Term>(model));

                // Return
                model.TermId = id;
                return Json(model, _serializationSettings);
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Add failed for term. {User} {Term}", _userManager.GetUserId(User), model.TermId);
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
                await _termsManager.UpdateTerm(_mapper.Map<Term>(model));

                // Return
                return Json(model, _serializationSettings);
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Update failed for term. {User} {Term}", _userManager.GetUserId(User), model.TermId);
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
                return Ok(id);
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Deletion failed for term. {User} {Term}", _userManager.GetUserId(User), id);
                return StatusCode(500, $"Deletion failed for term. Please try again. {e.Message}");
            }
        }
    }
}
