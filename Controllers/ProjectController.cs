using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NeuroSimHub.Data;
using NeuroSimHub.Models;

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


        // POST: api/Project/Create
        [HttpPost("[action]")]
        [Authorize(Policy = "RequireLoggedIn")]
        public async Task<IActionResult> Create([FromForm] Project formdata)
        {
            var newproject = new Project
            {
                
                ProjectID = formdata.ProjectID,
                Name = formdata.Name,
                Visibility = formdata.Visibility,
                Description = formdata.Description,
                DateCreated = formdata.DateCreated,
                LastUpdated = formdata.LastUpdated,
                User = formdata.User
            };

            await _dbContext.AddAsync(newproject);
            await _dbContext.SaveChangesAsync();

            return Ok(new JsonResult("The Project was successfully added"));
        }

        // PUT: api/Project/id?
        [HttpPut("[action]/{id}")]
        [Authorize(Policy = "RequireLoggedIn")]
        public async Task<IActionResult> Update([FromRoute] int id, [FromBody] Project formdata)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var project = _dbContext.Projects.FirstOrDefault(p => p.ProjectID == id);

            if (project == null)
            {
                return NotFound();
            }

            // If the product was found
            project.ProjectID = formdata.ProjectID;
            project.Name = formdata.Name;
            project.Visibility = formdata.Visibility;
            project.Description = formdata.Description;
            project.DateCreated = formdata.DateCreated;
            project.LastUpdated = formdata.LastUpdated;
            project.ApplicationUserProjects = formdata.ApplicationUserProjects;
            project.BlobFiles = formdata.BlobFiles;

            // Set Entity State
            _dbContext.Entry(project).State = EntityState.Modified;

            await _dbContext.SaveChangesAsync();

            return Ok(new
            {
                project_id = id,
                project = formdata,
                message = "Project successfully updated."
            });

        }

        // DELETE: api/Project/id?
        [HttpDelete("[action]/{id}")]
        [Authorize(Policy = "RequireLoggedIn")]
        public async Task<IActionResult> Delete([FromRoute] int id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var project = await _dbContext.Projects.FindAsync(id);

            if (project == null)
            {
                return NotFound();
            }

            _dbContext.Projects.Remove(project);

            await _dbContext.SaveChangesAsync();

            return Ok(new
            {
                project_id = id,
                message = "Project successfully deleted."
            });

        }

    }
}
