using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NeuroSimHub.Data;
using NeuroSimHub.Models;
using NeuroSimHub.ViewModels;
using NeuroSimHub.ViewModels.Project;

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
        public async Task<IActionResult> Create([FromForm] ProjectViewModel formdata)
        {
            // Find User
            var user = await _dbContext.Users.FindAsync(formdata.UserID);
            if (user == null) return NotFound();

            // Check If Project Already Exist
            var project = _dbContext.Projects
                .FirstOrDefault(p => p.ApplicationUserProjects.Any(aup => 
                    aup.ApplicationUser.Id == formdata.UserID &&
                    aup.Project.Name == formdata.Name &&
                    aup.UserRole == "owner"));

            // If Project Found Then Return Conflict Error
            if (project != null) return Conflict();

            // Create Project
            var newProject = new Project
            {
                Name = formdata.Name,
                Visibility = formdata.Visibility,
                Description = formdata.Description,
                DateCreated = DateTime.Now,
                LastUpdated = DateTime.Now,
                Route = user.UserName + "/" + formdata.Name
            };  

            // Add Project and Save Change
            await _dbContext.Projects.AddAsync(newProject);
            await _dbContext.SaveChangesAsync();

            // Create UserProject
            var newUserProject = new ApplicationUserProject
            {
                ApplicationUserID = user.Id,
                ProjectID = newProject.ProjectID,
                UserRole = "owner",
                IsFollowing = true
            };

            // Add UserProject
            await _dbContext.AddAsync(newUserProject);

            // Save Changes
            await _dbContext.SaveChangesAsync();

            // Check If Default Tag Exist
            Tag tagUserName = _dbContext.Tag.FirstOrDefault(t => t.Name == user.UserName);
            Tag tagProjectName = _dbContext.Tag.FirstOrDefault(t => t.Name == formdata.Name);

            // Create Username Tag If Not Found
            if (tagUserName == null)
            {
                tagUserName = new Tag { Name = user.UserName };

                await _dbContext.Tag.AddAsync(tagUserName);
                await _dbContext.SaveChangesAsync();
            }

            // Create Project Name Tag If Not Found
            if (tagProjectName == null)
            {
                tagProjectName = new Tag { Name = formdata.Name };

                await _dbContext.Tag.AddAsync(tagProjectName);
                await _dbContext.SaveChangesAsync();
            }

            // Add Tag To Project
            await _dbContext.ProjectTags.AddRangeAsync(
                new ProjectTag { 
                    ProjectID = newProject.ProjectID,
                    TagID = tagUserName.TagID
                },
                new ProjectTag
                {
                    ProjectID = newProject.ProjectID,
                    TagID = tagProjectName.TagID
                }
            );

            // Save Changes
            await _dbContext.SaveChangesAsync();

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

        // Get: /api/Project/read
        [HttpGet("[action]")]
        //[Authorize(Policy = "RequireLoggedIn")]
        public IActionResult Read()
        {

            var project = _dbContext.Projects
                .Where(p => p.Visibility == "public")
                .Include(p => p.ApplicationUserProjects)
                .Include(p => p.BlobFiles)
                .Include(p => p.ProjectTags).ThenInclude(pt => pt.Tag)
                .ToList();

            if (project == null) return NotFound();

            // Return Ok Request
            return Ok(new
            {
                project = project,
                message = "Recieved Project"
            });
        }

        // Get: /api/Project/read/{id}
        [HttpGet("[action]/{id}")]
        //[Authorize(Policy = "RequireLoggedIn")]
        public IActionResult Read([FromRoute] string id)
        {

            var project = _dbContext.Projects
                .Where(p => p.ApplicationUserProjects.Any(aup => aup.ApplicationUser.Id == id))
                .Include(p => p.ApplicationUserProjects)
                .Include(p => p.BlobFiles)
                .Include(p => p.ProjectTags).ThenInclude(pt => pt.Tag)
                .ToList();

            if (project == null) return NotFound();

            // Return Ok Request
            return Ok(new
            {
                project = project,
                message = "Recieved Project"
            });
        }

        // Get: /api/Project/read/{owner}/{projectname}
        [HttpGet("[action]/{owner}/{projectname}")]
        //[Authorize(Policy = "RequireLoggedIn")]
        public IActionResult Read([FromRoute] string owner, [FromRoute] string projectname)
        {

            var project = _dbContext.Projects
                .Where(p => p.ApplicationUserProjects.Any(aup => aup.ApplicationUser.UserName == owner && aup.Project.Name == projectname))
                .Include(p => p.ApplicationUserProjects)
                .Include(p => p.BlobFiles)
                .Include(p => p.ProjectTags).ThenInclude(pt => pt.Tag)
                .FirstOrDefault<Project>();

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

        // Get: /api/Project/Search/{searchTerm}
        [HttpGet("[action]/{searchTerm}")]
        //[Authorize(Policy = "RequireLoggedIn")]
        public IActionResult Search([FromRoute] string searchTerm)
        {
            // Split String Into Multiple Search Tag
            var searchTermList = searchTerm.Split(" ");

            // Get List Of Tag
            var tag = _dbContext.Tag.ToList();

            // Set For Tag That Match
            var matchedTag = new HashSet<int>();

            // Look For Tag That Contains Any Of The Term In TermList
            foreach (Tag t in tag) {
                foreach (string term in searchTermList)
                {
                    // Add To Matched Tag
                    if (t.Name.ToLower().Contains(term)) { matchedTag.Add(t.TagID); break; }
                }
            }

            // Find Project That Have The Matched Tag
            var projects = _dbContext.Projects
                .Where(p => p.ProjectTags.Any(pt => matchedTag.Contains(pt.Tag.TagID)))
                .Include(p => p.ApplicationUserProjects)
                .Include(p => p.BlobFiles)
                .Include(p => p.ProjectTags).ThenInclude(pt => pt.Tag);

            // Return Ok Status
            return Ok(new
            {
                project = projects,
                message = "Recieved Search Result."
            });
        }

        // PUT: /api/Project/Update/id
        [HttpPut("[action]/{id}")]
        //[Authorize(Policy = "RequireLoggedIn")]
        public async Task<IActionResult> Update([FromRoute] int id, [FromForm] ProjectViewModel formdata)
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


            //Remove Follower If Not Following
            if (formdata.UserRole == "follower" && formdata.IsFollowing == false)
            {
                // Remove User Role
                _dbContext.ApplicationUserProjects.Remove(userRole);

                // Save Change
                await _dbContext.SaveChangesAsync();

                return Ok(new
                {
                    user = userRole,
                    message = "Follower successfully deleted"
                });
            }
            

            // Update Role
            userRole.UserRole = formdata.UserRole;
            userRole.IsFollowing = formdata.IsFollowing;

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

            // Remove User Role
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
