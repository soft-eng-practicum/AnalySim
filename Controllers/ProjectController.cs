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
                Route = formdata.Route
            };

            // Add Project and Save Change
            await _dbContext.Projects.AddAsync(newProject);
            await _dbContext.SaveChangesAsync();

            // Add Both Reference to Many To Many Table
            var newUserProject = new ApplicationUserProject
            {
                ApplicationUserID = user.Id,
                ProjectID = newProject.ProjectID,
                UserRole = "Owner"
            };

            // Add Project
            await _dbContext.AddAsync(newUserProject);

            // Save Changes
            await _dbContext.SaveChangesAsync();

            // Organization Project Table
            var project = _dbContext.Projects
                .Where(p => p.ApplicationUserProjects.Any(aup => aup.Project.ProjectID == newUserProject.ProjectID))
                .Select(p => new
                {
                    ProjectID = p.ProjectID,
                    Name = p.Name,
                    Visibility = p.Visibility,
                    Description = p.Description,
                    DateCreated = p.DateCreated,
                    LastUpdated = p.LastUpdated,
                    Route = p.Route,
                    ApplicationUserProjects = p.ApplicationUserProjects.Select(aup => new
                    {
                        ApplicationUserID = aup.ApplicationUserID,
                        UserRole = aup.UserRole
                    }),
                    BlobFiles = p.BlobFiles
                });

            // Return Ok Request
            return Ok(new
            {
                project = newUserProject,
                message = "Project Successfully Created"
            });
        }

        // Post: /api/Project/CreateUserRole
        [HttpPost("[action]")]
        //[Authorize(Policy = "RequireLoggedIn")]
        public async Task<IActionResult> CreateUserRole([FromForm] ProjectUserViewModel formdata)
        {
            // Create Many To Many Connection
            var userRole = new ApplicationUserProject
            {
                ProjectID = formdata.ProjectID,
                ApplicationUserID = formdata.UserID,
                UserRole = formdata.UserRole
            };

            // Add To Database
            await _dbContext.ApplicationUserProjects.AddAsync(userRole);

            // Save Change
            await _dbContext.SaveChangesAsync();

            // Return Ok Status
            return Ok(new
            {
                user = userRole,
                message = "Project User Successfully Created"
            });
        }

        // Get: /api/Project/read/{id}
        [HttpGet("[action]/{id}")]
        //[Authorize(Policy = "RequireLoggedIn")]
        public IActionResult Read([FromRoute] string id)
        {

            var project = _dbContext.Projects
                .Where(p => p.ApplicationUserProjects.Any(aup => aup.ApplicationUser.Id == id))
                .Select(p => new
                {
                    ProjectID = p.ProjectID,
                    Name = p.Name,
                    Visibility = p.Visibility,
                    Description = p.Description,
                    DateCreated = p.DateCreated,
                    LastUpdated = p.LastUpdated,
                    Route = p.Route,
                    ApplicationUserProjects = p.ApplicationUserProjects.Select(aup => new
                    {
                        ApplicationUserID = aup.ApplicationUserID,
                        UserRole = aup.UserRole
                    }),
                    BlobFiles = p.BlobFiles
                }).ToList();

            if (project == null) return NotFound();

            // Return Ok Request
            return Ok(project);
        }

        // Get: /api/Project/read/{owner}/{projectname}
        [HttpGet("[action]/{owner}/{projectname}")]
        //[Authorize(Policy = "RequireLoggedIn")]
        public IActionResult Read([FromRoute] string owner, [FromRoute] string projectname)
        {

            var project = _dbContext.Projects
                .Where(p => p.ApplicationUserProjects.Any(aup => aup.ApplicationUser.UserName == owner && aup.Project.Name == projectname))
                .Select(p => new 
                {
                    ProjectID = p.ProjectID,
                    Name = p.Name,
                    Visibility = p.Visibility,
                    Description = p.Description,
                    DateCreated = p.DateCreated,
                    LastUpdated = p.LastUpdated,
                    Route = p.Route,
                    ApplicationUserProjects = p.ApplicationUserProjects.Select(aup => new 
                    { 
                        ApplicationUserID = aup.ApplicationUserID,
                        UserRole = aup.UserRole
                    }),
                    BlobFiles = p.BlobFiles
                });

            if (project == null) return NotFound();

            // Return Ok Request
            return Ok(new
            {
                project = project,
                message = "Recieved Project"
            });
        }

        // Get: /api/Project/ReadUserRole/{id}
        [HttpGet("[action]/{id}")]
        //[Authorize(Policy = "RequireLoggedIn")]
        public IActionResult ReadUserRole([FromRoute] int id)
        {

            var userRole = _dbContext.ApplicationUserProjects
                .Where(aup => aup.Project.ProjectID == id)
                .Select(aup => new
                {
                    ApplicationUserID = aup.ApplicationUserID,
                    UserRole = aup.UserRole
                }).ToList();

            if (userRole == null) return NotFound();

            // Return Ok Status
            return Ok(new
            {
                user = userRole,
                message = "Recieved User Roles List."
            });
        }

        // PUT: /api/Project/Update/id
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
                project = project,
                message = "Project successfully updated."
            });

        }

        // Put: /api/Project/UpdateUser
        [HttpPut("[action]")]
        //[Authorize(Policy = "RequireLoggedIn")]
        public async Task<IActionResult> UpdateUserRole([FromForm] ProjectUserViewModel formdata)
        {
            // Find Many To Many
            var userRole = await _dbContext.ApplicationUserProjects.FindAsync(formdata.UserID, formdata.ProjectID);

            // Return Not Found Status If Not Found
            if (userRole == null) return NotFound();

            // Update Role
            userRole.UserRole = formdata.UserRole;

            _dbContext.Entry(userRole).State = EntityState.Modified;

            await _dbContext.SaveChangesAsync();

            // Return Ok Status
            return Ok(new
            {
                user = userRole,
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
            var deleteProject = await _dbContext.Projects.FindAsync(id);

            // Return Not Found Status If Not Found
            if (deleteProject == null) return NotFound();

            // Remove Project
            _dbContext.Projects.Remove(deleteProject);

            // Save Change
            await _dbContext.SaveChangesAsync();

            // Return Ok Status
            return Ok(new
            {
                project = deleteProject,
                message = "Project successfully deleted."
            });

        }

        // Put: /api/Project/DeleteUserRole
        [HttpDelete("[action]/{projectid}/{userid}")]
        //[Authorize(Policy = "RequireLoggedIn")]
        public async Task<IActionResult> DeleteUserRole([FromForm] ProjectUserViewModel formdata)
        {
            // Find Many To Many
            var projectUser = await _dbContext.ApplicationUserProjects.FindAsync(formdata.UserID, formdata.ProjectID);

            // Return Not Found Status If Not Found
            if (projectUser == null) return NotFound();

            // Remove Project
            _dbContext.ApplicationUserProjects.Remove(projectUser);

            // Save Change
            await _dbContext.SaveChangesAsync();

            // Return Ok Status
            return Ok(new
            {
                user = projectUser,
                message = "User Role successfully deleted."
            });
        }

    }
}
