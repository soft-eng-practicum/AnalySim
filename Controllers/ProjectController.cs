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
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.VisualStudio.Web.CodeGeneration.Contracts.Messaging;
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

        #region GET REQUEST
        /*
         * Type : GET
         * URL : /api/project/getprojectList
         * Param : ProjectUserViewModel
         * Description: Get Project List
         */
        [HttpGet("[action]")]
        public IActionResult GetProjectList()
        {

            // Get All Project And Include To Many List
            var project = _dbContext.Projects
                .Include(p => p.ProjectUsers)
                .Include(p => p.BlobFiles)
                .Include(p => p.ProjectTags).ThenInclude(pt => pt.Tag)
                .ToList();

            // Return Ok Request
            return Ok(new
            {
                resultObject = project,
                message = "Recieved Project"
            });
        }

        /*
         * Type : GET
         * URL : /api/project/getproject/
         * Param : {owner}/{projectname}
         * Description: Get Project
         */
        [HttpGet("[action]/{owner}/{projectname}")]
        public IActionResult GetProject([FromRoute] string owner, [FromRoute] string projectname)
        {
            // Find Project
            var project = _dbContext.Projects.Where(p => p.ProjectUsers.Any(aup => aup.User.UserName == owner && aup.Project.Name == projectname));
            if (project == null) return NotFound(new { message = "Project Not Found"});

            // Include To Many List
            var query = project
                .Include(p => p.ProjectUsers)
                .Include(p => p.BlobFiles)
                .Include(p => p.ProjectTags).ThenInclude(pt => pt.Tag);            

            // Return Ok Request
            return Ok(new
            {
                resultObject = query,
                message = "Recieved Project"
            });
        }

        /*
         * Type : GET
         * URL : /api/project/getuserlist/
         * Param : {projectID}
         * Description: Get User List Of Project
         */
        [HttpGet("[action]/{projectID}")]
        public IActionResult GetUserList([FromRoute] int projectID)
        {
            // Find Project
            var project = _dbContext.Projects.Where(p => p.ProjectID == projectID);
            if (project == null) return NotFound(new { message = "Project Not Found" });

            // Find Project List
            var query = project
                .SelectMany(p => _dbContext.ProjectUsers)
                .Select(pu => new 
                { 
                    UserID = pu.UserID,
                    UserRole = pu.UserRole,
                    IsFollowing = pu.IsFollowing
                }).ToList();

            // Return Ok Status
            return Ok(new
            {
                resultObject = query,
                message = "Recieved User Roles List."
            });
        }

        /*
         * Type : GET
         * URL : /api/project/search/
         * Param : {searchTerm}
         * Description: Filter Project Using Search Term
         */
        [HttpGet("[action]/{searchTerm}")]
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
            var projects = _dbContext.Projects.Where(p => p.ProjectTags.Any(pt => matchedTag.Contains(pt.Tag.TagID)));

            var query = projects
                .Include(p => p.ProjectUsers)
                .Include(p => p.BlobFiles)
                .Include(p => p.ProjectTags).ThenInclude(pt => pt.Tag);

            // Return Ok Status
            return Ok(new
            {
                resultObject = query,
                message = "Recieved Search Result."
            });
        }

        /*
         * Type : GET
         * URL : /api/project/getfilelist/
         * Param : {projectID}
         * Description: Get list of file from project
         */
        [HttpGet("[action]/{projectID}")]
        public IActionResult GetFileList([FromRoute] int projectID)
        {
            var project = _dbContext.Projects.Where(p => p.ProjectID == projectID);

            // Query File Of Project
            var query = project
                .SelectMany(p => p.BlobFiles);

            // Return Ok Status
            return Ok(new
            {
                resultObject = query,
                message = "Project File Received"
            });
        }

        /*
         * Type : GET
         * URL : /api/project/gettaglist/
         * Param : {projectID}
         * Description: Get list of tag from project
         */
        [HttpGet("[action]/{projectID}")]
        public IActionResult GetTagList([FromRoute] int projectID)
        {
            // Find Project
            var project = _dbContext.Projects.Where(p => p.ProjectID == projectID);
            if (project == null) return NotFound(new { message = "Project Not Found"});

            var query = project
                .SelectMany(p => _dbContext.ProjectTags)
                .Select(pt => pt.Tag);

            // Return Ok Status
            return Ok(new
            {
                resultObject = query,
                message = "Recieved Tag List."
            });
        }
        #endregion

        #region POST REQUEST
        /*
        * Type : POST
        * URL : /api/project/createproject
        * Param : ProjectViewModel
        * Description: Create Project
        */
        [HttpPost("[action]")]
        public async Task<IActionResult> CreateProject([FromForm] ProjectViewModel formdata)
        {
            // Find User
            var user = await _dbContext.Users.FindAsync(formdata.UserID);
            if (user == null) return NotFound(new { message = "User Not Found" });

            // Check If Project Already Exist
            var project = _dbContext.Projects
                .FirstOrDefault(p => p.ProjectUsers.Any(aup =>
                    aup.User.Id == formdata.UserID &&
                    aup.Project.Name == formdata.Name &&
                    aup.UserRole == "owner"));

            // If Conflict If Project Found
            if (project != null) return Conflict(new { message = "Project Already Exist" });

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

            // Add Project And Save Change
            await _dbContext.Projects.AddAsync(newProject);
            await _dbContext.SaveChangesAsync();

            // Create ProjectUser
            var newProjectUser = new ProjectUser
            {
                UserID = user.Id,
                ProjectID = newProject.ProjectID,
                UserRole = "owner",
                IsFollowing = true
            };

            // Add ProjectUser And Save Change
            await _dbContext.AddAsync(newProjectUser);
            await _dbContext.SaveChangesAsync();

            // Check If Default Tag Exist
            Tag tagUserName = _dbContext.Tag.FirstOrDefault(t => t.Name == user.UserName);
            Tag tagProjectName = _dbContext.Tag.FirstOrDefault(t => t.Name == formdata.Name);

            // Create Username Tag If Not Found
            if (tagUserName == null)
            {
                tagUserName = new Tag { Name = user.UserName };

                // Add Tag And Save Change
                await _dbContext.Tag.AddAsync(tagUserName);
                await _dbContext.SaveChangesAsync();
            }

            // Create Project Name Tag If Not Found
            if (tagProjectName == null)
            {
                tagProjectName = new Tag { Name = formdata.Name };

                // Add Tag And Save Change
                await _dbContext.Tag.AddAsync(tagProjectName);
                await _dbContext.SaveChangesAsync();
            }

            // Add Tag To Project
            await _dbContext.ProjectTags.AddRangeAsync(
                new ProjectTag
                {
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
                resultObject = newProject,
                message = "Project Successfully Created"
            });
        }

        /*
         * Type : POST
         * URL : /api/project/adduser
         * Param : ProjectUserViewModel
         * Description: Add User To Project
         */
        [HttpPost("[action]")]
        public async Task<IActionResult> AddUser([FromForm] ProjectUserViewModel formdata)
        {
            // Create Many To Many Connection
            var userRole = new ProjectUser
            {
                ProjectID = formdata.ProjectID,
                UserID = formdata.UserID,
                UserRole = formdata.UserRole,
                IsFollowing = formdata.IsFollowing
            };

            // Add To Database And Save Change
            await _dbContext.ProjectUsers.AddAsync(userRole);
            await _dbContext.SaveChangesAsync();

            // Return Ok Status
            return Ok(new
            {
                resultObject = userRole,
                message = "Project User Successfully Created"
            });
        }

        /*
         * Type : POST
         * URL : /api/project/addtag
         * Param : ProjectTagViewModel
         * Description: Add Tag To Project
         */
        [HttpPost("[action]")]
        //[Authorize(Policy = "RequireLoggedIn")]
        public async Task<IActionResult> AddTag([FromForm] ProjectTagViewModel formdata)
        {
            // Find Tag In Database
            Tag tag = _dbContext.Tag.FirstOrDefault(t => t.Name == formdata.TagName);
            if (tag == null)
            {

                // Add Tag To Project
                tag = new Tag
                {
                    Name = formdata.TagName,
                };
            }

            // Find ProjectTag In Database
            ProjectTag projectTag = _dbContext.ProjectTags.FirstOrDefault(pt => pt.ProjectID == formdata.ProjectID && pt.TagID == tag.TagID);
            if (projectTag != null) return Conflict(new { message = "Project Tag Already Exist" });

            
            // Add Tag To Project
            projectTag = new ProjectTag
            {
                ProjectID = formdata.ProjectID,
                TagID = tag.TagID
            };

            // Add Tag to Project And Save
            await _dbContext.ProjectTags.AddAsync(projectTag);
            await _dbContext.SaveChangesAsync();

            // Return Ok Status
            return Ok(new
            {
                resultObject = projectTag,
                message = "Project Tag Added"
            });
        }
        #endregion

        #region PUT REQUEST
        /*
         * Type : PUT
         * URL : /api/project/updateproject/
         * Param : {projectID}, ProjectViewModel
         * Description: Update Project
         */
        [HttpPut("[action]/{id}")]
        public async Task<IActionResult> UpdateProject([FromRoute] int projectID, [FromForm] ProjectViewModel formdata)
        {
            // Check Model State
            if (!ModelState.IsValid) return BadRequest(ModelState);

            // Find Project
            var project = _dbContext.Projects.FirstOrDefault(p => p.ProjectID == projectID);
            if (project == null) return NotFound(new { message = "Project Not Found"});

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
                resultObject = project,
                message = "Project successfully updated."
            });

        }

        /*
         * Type : PUT
         * URL : /api/project/updateuser
         * Param : ProjectUserViewModel
         * Description: Update Project
         */
        [HttpPut("[action]")]
        public async Task<IActionResult> UpdateUser([FromForm] ProjectUserViewModel formdata)
        {
            // Find Many To Many
            var userRole = await _dbContext.ProjectUsers.FindAsync(formdata.UserID, formdata.ProjectID);
            if (userRole == null) return NotFound(new { message = "User Not Found"});

            //Remove Follower If Not Following
            if (formdata.UserRole == "follower" && formdata.IsFollowing == false)
            {
                // Remove User Role
                _dbContext.ProjectUsers.Remove(userRole);

                // Save Change
                await _dbContext.SaveChangesAsync();

                return Ok(new
                {
                    resultObject = userRole,
                    message = "Follower successfully deleted"
                });
            }
            
            // Update Role
            userRole.UserRole = formdata.UserRole;
            userRole.IsFollowing = formdata.IsFollowing;

            // Set Entity State
            _dbContext.Entry(userRole).State = EntityState.Modified;

            // Save Change
            await _dbContext.SaveChangesAsync();

            // Return Ok Status
            return Ok(new
            {
                user = userRole,
                message = "Project successfully updated."
            });
        }
        #endregion

        #region DELETE REQUEST
        /*
         * Type : DELETE
         * URL : /api/project/deleteproject/
         * Param : {projectID}
         * Description: Delete Project
         */
        [HttpDelete("[action]/{projectID}")]
        public async Task<IActionResult> DeleteProject([FromRoute] int projectID)
        {
            // Check Model State
            if (!ModelState.IsValid) return BadRequest(ModelState);

            // Find Project
            var deleteProject = await _dbContext.Projects.FindAsync(projectID);
            if (deleteProject == null) return NotFound(new { message = "Project Not Found"});

            // Remove Project
            _dbContext.Projects.Remove(deleteProject);

            // Save Change
            await _dbContext.SaveChangesAsync();

            // Return Ok Status
            return Ok(new
            {
                resultObject = deleteProject,
                message = "Project successfully deleted."
            });

        }

        /*
         * Type : DELETE
         * URL : /api/project/removeuser/
         * Param : {projectID}/{userID}
         * Description: Delete User
         */
        [HttpDelete("[action]/{projectID}/{userID}")]
        public async Task<IActionResult> RemoveUser([FromRoute] int projectID, int userID)
        {
            // Find Many To Many
            var projectUser = await _dbContext.ProjectUsers.FindAsync(projectID, userID);
            if (projectUser == null) return NotFound( new { message = "User Not Found"});

            // Remove User Role
            _dbContext.ProjectUsers.Remove(projectUser);

            // Save Change
            await _dbContext.SaveChangesAsync();

            // Return Ok Status
            return Ok(new
            {
                resultObject = projectUser,
                message = "User Role successfully deleted."
            });
        }

        /*
         * Type : DELETE
         * URL : /api/project/removetag/
         * Param : {projectID}/{tagID}
         * Description: Delete User
         */
        [HttpDelete("[action]/{projectID}/{tagID}")]
        public async Task<IActionResult> RemoveTag([FromRoute] int projectID, [FromRoute] int tagID)
        {
            // Find ProjectTag In Database
            ProjectTag projectTag = _dbContext.ProjectTags.FirstOrDefault(pt => pt.ProjectID == projectID && pt.TagID == tagID);
            if (projectTag == null) return NotFound(new { message = "Project Tag Not Found"});

            // Remove Project Tag
            _dbContext.ProjectTags.Remove(projectTag);

            // Check If Last Tag
            var projectTagList = _dbContext.ProjectTags.Where(pt => pt.TagID == tagID).ToList();

            // Delete Tag If No Connection Exist
            if (projectTagList.Count == 0)
            {
                // Find Tag
                var tag = await _dbContext.Tag.FindAsync(tagID);
                if (tag == null) return NotFound(new { message = "Tag Not Found" });

                // Remove Tag
                _dbContext.Tag.Remove(tag);
            }

            // Save Change
            await _dbContext.SaveChangesAsync();

            // Return Ok Status
            return Ok(new
            {
                resultObject = projectTag,
                message = "Project Tag Successfully Deleted"
            });
        }
        #endregion

    }
}
