using AutoMapper;
using BestClipOfTheWeek.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace BestClipOfTheWeek.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class YouTubeApiConfigController : ControllerBase
    {
        private readonly ILogger<YouTubeApiConfigController> _logger;
        private readonly Models.YouTubeOptions _options;

        public YouTubeApiConfigController(ILogger<YouTubeApiConfigController> logger, ITermsRepository termsRepository, IMapper mapper, IOptions<Models.YouTubeOptions> options)
        {
            _logger = logger;
            _options = options.Value;
        }

        [HttpGet]
        [ResponseCache(Duration = 3600)]
        public string Index()
        {
            return _options.ApiKey;
        }
    }
}
