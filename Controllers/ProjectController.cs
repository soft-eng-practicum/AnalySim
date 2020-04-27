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

        // Post: /api/Project/AddUser
        [HttpPost("[action]")]
        //[Authorize(Policy = "RequireLoggedIn")]
        public async Task<IActionResult> AddUser([FromForm] ProjectUserViewModel formdata)
        {
            // Create Many To Many Connection
            var projectUser = new ApplicationUserProject
            {
                ProjectID = formdata.ProjectID,
                ApplicationUserID = formdata.UserID,
                UserRole = formdata.UserRole
            };

            // Add To Database
            await _dbContext.ApplicationUserProjects.AddAsync(projectUser);

            // Save Change
            await _dbContext.SaveChangesAsync();

            // Return Ok Status
            return Ok(projectUser);
        }

        // Put: /api/Project/UpdateUser
        [HttpPut("[action]")]
        //[Authorize(Policy = "RequireLoggedIn")]
        public async Task<IActionResult> UpdateUser([FromForm] ProjectUserViewModel formdata)
        {
            // Find Many To Many
            var projectUser = await _dbContext.ApplicationUserProjects.FindAsync(formdata.UserID, formdata.ProjectID);

            // Return Not Found Status If Not Found
            if (projectUser == null) return NotFound();

            // Update Role
            projectUser.UserRole = formdata.UserRole;

            // Return Ok Status
            return Ok(projectUser);
        }

        // Get: /api/Project/GetUser/id
        [HttpGet("[action]/{id}")]
        //[Authorize(Policy = "RequireLoggedIn")]
        public IActionResult GetUser([FromRoute] int id)
        {
            // Query Many To Many using Project ID
            var query = _dbContext.ApplicationUserProjects
                .Where(p => p.ProjectID == id)
                .Include(u => u.ApplicationUser)
                .Include(p => p.Project)
                .ToList();

            // Return Ok Status
            return Ok(query);
        }

        // Get: /api/Project/GetBlobFiles/id
        [HttpGet("[action]/{id}")]
        //[Authorize(Policy = "RequireLoggedIn")]
        public IActionResult GetBlobFiles([FromRoute] int id)
        {
            // Query File Of Project
            var query = _dbContext.Projects
                .Where(p => p.ProjectID == id)
                .SelectMany(p => p.BlobFiles);

            // Return Ok Status
            return Ok(query);
        }

        // POST: /api/Project/Create
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
                ProjectID = newProject.ProjectID,
                UserRole = "Owner",
                Route = user.UserName + "/" + newProject.Name
            };

            // Add Project
            await _dbContext.AddAsync(newUserProject);

            // Save Changes
            await _dbContext.SaveChangesAsync();

            // Return Ok Request
            return Ok(new
            {
                project = newProject,
                route = newUserProject.Route,
                message = "Project was successfully added"
            });
        }

        // POST: /api/Project/Create
        [HttpPost("[action]/{owner}/{projectname}")]
        //[Authorize(Policy = "RequireLoggedIn")]
        public async Task<IActionResult> Read([FromRoute] string owner, [FromRoute] string projectname)
        {
            var user = _dbContext.Users.FirstOrDefault(u => u.UserName == owner);

            if (user == null) return NotFound();

            var project = _dbContext.ApplicationUserProjects
                .Where(u => u.ApplicationUserID == user.Id)
                .Select(p => p.Project)
                .FirstOrDefault(p => p.Name == projectname);

            if (project == null) return NotFound();

            // Return Ok Request
            return Ok(project);
        }

        // PUT: /api/Project/Update/id
        [HttpPut("[action]/{id}")]
        //[Authorize(Policy = "RequireLoggedIn")]
        public async Task<IActionResult> Update([FromRoute] int id, [FromForm] ProjectCreateViewModel formdata)
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

        // DELETE: api/Project/Delete/id
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
