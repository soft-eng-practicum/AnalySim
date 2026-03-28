using Microsoft.AspNetCore.Mvc;

namespace Analysim.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult get()
    {
        return Ok("Healthy");
    }
}