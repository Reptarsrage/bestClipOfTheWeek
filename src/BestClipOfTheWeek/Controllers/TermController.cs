using AutoMapper;
using BestClipOfTheWeek.Models;
using BestClipOfTheWeek.Models.Terms;
using BestClipOfTheWeek.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace BestClipOfTheWeek.Controllers
{
    [Authorize]
    public class TermsController : Controller
    {
        private readonly ILogger _logger;
        private readonly ITermsRepository _termsRepository;
        private readonly IMapper _mapper;
        private readonly UserManager<ApplicationUser> _userManager;

        public TermsController(ILogger<TermsController> logger, ITermsRepository termsManager, UserManager<ApplicationUser> userManager, IMapper mapper)
        {
            _logger = logger;
            _termsRepository = termsManager;
            _userManager = userManager;
            _mapper = mapper;
        }

        [HttpGet]
        [Route("/api/Terms")]
        public async Task<IActionResult> Get()
        {
            var terms = await _termsRepository.ReadTerms(_userManager.GetUserId(User));

            return Json(terms?
                .Select(t => _mapper.Map<TermViewModel>(t))
                .OrderBy(t => t.Name) ?? Enumerable.Empty<TermViewModel>());
        }

        [HttpPost]
        [Route("/api/Terms")]
        public async Task<IActionResult> Post([FromBody]TermViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(string.Join(",", ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage))));
            }

            try
            {
                // Add
                var id = await _termsRepository.AddTerm(_userManager.GetUserId(User), _mapper.Map<Term>(model));

                // Return
                model.TermId = id;
                return Json(model);
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Add failed for term. {User} {Term}", _userManager.GetUserId(User), model.TermId);
                return StatusCode(500, $"Add failed for term. Please try again. {e.Message}");
            }
        }

        [HttpPatch]
        [Route("/api/Terms")]
        public async Task<IActionResult> Patch([FromBody]TermViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(string.Join(",", ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage))));
            }

            try
            {
                // Update
                await _termsRepository.UpdateTerm(_mapper.Map<Term>(model));

                // Return
                return Json(model);
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Update failed for term. {User} {Term}", _userManager.GetUserId(User), model.TermId);
                return StatusCode(500, $"Update failed for term. Please try again. {e.Message}");
            }
        }

        [HttpDelete]
        [Route("/api/Terms/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                // Delete
                await _termsRepository.RemoveTerm(id);

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
