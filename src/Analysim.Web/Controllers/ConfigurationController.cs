using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Mvc;
using System;

namespace Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ConfigurationController : ControllerBase
{
    private readonly IConfiguration _configuration;

    public ConfigurationController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    [HttpGet("[action]")]
    public IActionResult GetLengthOfRegistrationCodes()
    {
    // Find User
    string[] registrationKeys =  _configuration.GetSection("registrationCodes").Get<string[]>();
    int length = 0;
    if(registrationKeys != null && registrationKeys.Length != 0)
    {
        length = registrationKeys.Length;
    }

    return Ok(new
            {
                result = length,
                message = 10
            });
    }

    // Your controller actions
}
}