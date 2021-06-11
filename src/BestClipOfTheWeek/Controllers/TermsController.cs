using AutoMapper;
using BestClipOfTheWeek.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BestClipOfTheWeek.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class TermsController : ControllerBase
    {
        private readonly ILogger<TermsController> _logger;
        private readonly ITermsRepository _termsRepository;
        private readonly IMapper _mapper;

        public TermsController(ILogger<TermsController> logger, ITermsRepository termsRepository, IMapper mapper)
        {
            _logger = logger;
            _termsRepository = termsRepository;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<IEnumerable<Models.Term>> Get()
        {
            var userId = GetUserId(User);
            var terms = await _termsRepository.ReadTerms(userId);
            if (terms is null)
            {
                return Enumerable.Empty<Models.Term>();
            }

            return terms
                .Select(t => _mapper.Map<Models.Term>(t))
                .OrderBy(t => t.Name);
        }

        [HttpPost]
        public async Task<ActionResult<Models.Term>> Post([FromBody] Models.Term model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(string.Join(",", ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage))));
            }

            // Add
            var id = await _termsRepository.AddTerm(GetUserId(User), _mapper.Map<Models.Dto.Term>(model));

            // Return
            model.TermId = id;
            return Ok(model);

        }

        [HttpPatch]
        public async Task<ActionResult<Models.Term>> Patch([FromBody] Models.Term model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(string.Join(",", ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage))));
            }

            // Update
            await _termsRepository.UpdateTerm(_mapper.Map<Models.Dto.Term>(model));

            // Return
            return Ok(model);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<int>> Delete([FromRoute] int id)
        {
            // Delete
            await _termsRepository.RemoveTerm(id);

            // Return
            return Ok(id);
        }

        private string GetUserId(System.Security.Claims.ClaimsPrincipal User)
        {
            return User.Claims.First(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier).Value;
        }
    }
}
