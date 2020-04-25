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
using NeuroSimHub.ViewModels;

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

        // Get: api/Project/GetUser/id
        [HttpGet("[action]/{id}")]
        //[Authorize(Policy = "RequireLoggedIn")]
        public IActionResult GetUser([FromRoute] int id)
        {
            return Ok(_dbContext.Projects.Where(p => p.ProjectID == id).SelectMany(x => _dbContext.Users));
        }

        // Get: api/Project/GetBlobFiles/id
        [HttpGet("[action]/{id}")]
        //[Authorize(Policy = "RequireLoggedIn")]
        public IActionResult GetBlobFiles([FromRoute] int id)
        {
            return Ok(_dbContext.Projects.Where(p => p.ProjectID == id).SelectMany(p => p.BlobFiles));
        }

        // POST: api/Project/Create
        [HttpPost("[action]")]
        //[Authorize(Policy = "RequireLoggedIn")]
        public async Task<IActionResult> Create([FromForm] ProjectCreateViewModel formdata)
        {
            // Find User
            var user = await _dbContext.Users.FindAsync(formdata.UserID);
            if (user == null) return NotFound();

            // Create Project
            var newProject = new Project
            {
                Name = formdata.Name,
                Visibility = formdata.Visibility,
                Description = formdata.Description,
                DateCreated = DateTime.Now,
                LastUpdated = DateTime.Now,
            };

            // Add Project and Save Change
            await _dbContext.Projects.AddAsync(newProject);
            await _dbContext.SaveChangesAsync();

            // Add Both Reference to Many To Many Table
            var newUserProject = new ApplicationUserProject
            {
                ApplicationUserID = user.Id,
                ProjectID = newProject.ProjectID
            };

            // Add Project
            await _dbContext.AddAsync(newUserProject);

            // Save Changes
            await _dbContext.SaveChangesAsync();

            // Return Ok Request
            return Ok(new
            {
                id = newProject.ProjectID,
                name = newProject.Name,
                username = user.UserName,
                message = "Project was successfully added"
            });
        }

        // PUT: api/Project/id
        [HttpPut("[action]/{id}")]
        //[Authorize(Policy = "RequireLoggedIn")]
        public async Task<IActionResult> Update([FromRoute] int id, [FromForm] ProjectUpdateViewModel formdata)
        {
            // Check Model State
            if (!ModelState.IsValid) return BadRequest(ModelState);

            // Get Project From Database
            var project = _dbContext.Projects.FirstOrDefault(p => p.ProjectID == id);

            // Return Not Found Status If Not Found
            if (project == null) return NotFound();

            // If the product was found
            project.Name = formdata.Name;
            project.Visibility = formdata.Visibility;
            project.Description = formdata.Description;
            project.LastUpdated = DateTime.Now;

            // Set Entity State
            _dbContext.Entry(project).State = EntityState.Modified;

            // Save Change
            await _dbContext.SaveChangesAsync();

            // Return Ok Status
            return Ok(new
            {
                project_id = id,
                project = formdata,
                message = "Project successfully updated."
            });

        }

        // DELETE: api/Project/id
        [HttpDelete("[action]/{id}")]
        [Authorize(Policy = "RequireLoggedIn")]
        public async Task<IActionResult> Delete([FromRoute] int id)
        {
            // Check Model State
            if (!ModelState.IsValid) return BadRequest(ModelState);

            // Find Project
            var project = await _dbContext.Projects.FindAsync(id);

            // Return Not Found Status If Not Found
            if (project == null) return NotFound();

            // Remove Project
            _dbContext.Projects.Remove(project);

            // Save Change
            await _dbContext.SaveChangesAsync();

            // Return Ok Status
            return Ok(new
            {
                project_id = id,
                message = "Project successfully deleted."
            });

        }

    }
}
