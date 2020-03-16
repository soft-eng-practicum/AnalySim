using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NeuroSimHub.Data;

namespace NeuroSimHub.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProjectController : ControllerBase
    {

        private readonly ApplicationDbContext _dbContext;

        public ProjectController(ApplicationDbContext _dbContext) 
        {
            this._dbContext = _dbContext;
        }

        // GET: api/Project/
        [HttpGet("[action]")]
        public IActionResult GetProject()
        {
            return Ok(_dbContext.Projects.ToList());
        }

        // POST: api/Project
        [HttpPost("[action]")]
        public void Post([FromBody] string value)
        {
        }
    }
}
