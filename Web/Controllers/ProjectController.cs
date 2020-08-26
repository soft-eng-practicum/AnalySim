using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection.Metadata;
using System.Threading.Tasks;
using Infrastructure.Data;
using Core.Interfaces;
using Web.ViewModels.Project;
using Core.Entities;

namespace Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProjectController : ControllerBase
    {

        private readonly ApplicationDbContext _dbContext;
        private readonly IBlobService _blobService;
        private readonly BlobServiceClient _blobServiceClient;

        public ProjectController(ApplicationDbContext dbContext, IBlobService blobService, BlobServiceClient blobServiceClient) 
        {
            _dbContext = dbContext;
            _blobService = blobService;
            _blobServiceClient = blobServiceClient;
        }

        #region GET REQUEST
        /*
         * Type : GET
         * URL : /api/project/getprojectbyid/
         * Param : {projectID}
         * Description: Get Project
         */
        [HttpGet("[action]/{projectID}")]
        public IActionResult GetProjectByID([FromRoute] int projectID)
        {
            // Find Project
            // Include To Many List
            var project = _dbContext.Projects
                .Include(p => p.BlobFiles)
                .Include(p => p.ProjectUsers)
                .Include(p => p.ProjectTags).ThenInclude(pt => pt.Tag)
                .SingleOrDefault(p => p.ProjectID == projectID);
            if (project == null) return NotFound(new { message = "Project Not Found" });

            // Return Ok Request
            return Ok(new
            {
                result = project,
                message = "Recieved Project"
            });
        }

        /*
         * Type : GET
         * URL : /api/project/getprojectbyroute/
         * Param : {owner}/{projectname}
         * Description: Get Project
         */
        [HttpGet("[action]/{owner}/{projectname}")]
        public IActionResult GetProjectByRoute([FromRoute] string owner, [FromRoute] string projectname)
        {
            // Find Project
            var project = _dbContext.Projects
                .Include(p => p.BlobFiles)
                .Include(p => p.ProjectUsers)
                .Include(p => p.ProjectTags).ThenInclude(pt => pt.Tag)
                .SingleOrDefault(p => p.Route.ToLower() == owner.ToLower() + "/" + projectname.ToLower());
            if (project == null) return NotFound(new { message = "Project Not Found" });

            // Return Ok Request
            return Ok(new
            {
                result = project,
                message = "Recieved Project"
            });
        }

        /*
         * Type : GET
         * URL : /api/project/getprojectrange?
         * Description: Get Project Range
         */
        [HttpGet("[action]")]
        public IActionResult GetProjectRange([FromQuery(Name = "id")] List<int> idList)
        {
            // Find Project
            var projects = _dbContext.Projects
                .Include(p => p.BlobFiles)
                .Include(p => p.ProjectUsers)
                .Include(p => p.ProjectTags).ThenInclude(pt => pt.Tag)
                .Where(p => idList.Contains(p.ProjectID))
                .ToList();

            // Return Ok Request
            return Ok(new
            {
                result = projects,
                message = "Recieved Project"
            });
        }

        /*
         * Type : GET
         * URL : /api/project/getprojectList
         * Description: Get Project List
         */
        [HttpGet("[action]")]
        public IActionResult GetProjectList()
        {

            // Get All Project And Include To Many List
            var projects = _dbContext.Projects
                .Include(p => p.BlobFiles)
                .Include(p => p.ProjectUsers)
                .Include(p => p.ProjectTags).ThenInclude(pt => pt.Tag)
                .ToList();

            // Return Ok Request
            return Ok(new
            {
                result = projects,
                message = "Recieved Project"
            });
        }

        /*
         * Type : GET
         * URL : /api/project/search?
         * Description: Filter Project Using Search Term
         */
        [HttpGet("[action]")]
        public IActionResult Search([FromQuery(Name = "term")] List<string> searchTerms)
        {
            var matchedTag = _dbContext.Tag
                .ToList()
                .Where(t => searchTerms.Any(st => t.Name.ToLower().Contains(st.ToLower())));

            var matchedProject = _dbContext.Projects
                .Include(p => p.BlobFiles)
                .Include(p => p.ProjectUsers)
                .Include(p => p.ProjectTags).ThenInclude(pt => pt.Tag)
                .ToList()
                .Where(p => matchedTag.Any(mt => p.ProjectTags.Any(pt => pt.Tag.Name.ToLower() == mt.Name.ToLower())));
            if (matchedProject.Count() == 0) return NoContent();

            return Ok(new
            {
                result = matchedProject,
                message = "Recieved Search Result."
            });
        }

        /*
         * Type : POST
         * URL : /api/test/downloadfile/
         * Param : {fileID}
         * Description: Upload File To Azure Storage
         */
        [HttpGet("[action]/{fileID}")]
        public async Task<IActionResult> DownloadFile([FromRoute] int fileID)
        {
            try
            {

                // Find Project
                var blobFile = await _dbContext.BlobFiles.FindAsync(fileID);
                if (blobFile == null) return NotFound();

                BlobDownloadInfo data = await _blobService.GetBlobAsync(blobFile);

                return File(data.Content, data.ContentType, blobFile.Name + blobFile.Extension);
            }
            catch (Exception e)
            {
                // Return Bad Request If There Is Any Error
                return BadRequest(e);
            }

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
        public async Task<IActionResult> CreateProject([FromForm] ProjectVM formdata)
        {
            // Find User
            var user = await _dbContext.Users.FindAsync(formdata.UserID);
            if (user == null) return NotFound(new { message = "User Not Found" });

            // Check If Project Already Exist
            var project = _dbContext.Projects
                .SingleOrDefault(p => p.ProjectUsers.Any(aup =>
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
                DateCreated = DateTimeOffset.UtcNow,
                LastUpdated = DateTimeOffset.UtcNow,
                Route = user.UserName + "/" + formdata.Name
            };

            // Add Project And Save Change
            await _dbContext.Projects.AddAsync(newProject);
            await _dbContext.SaveChangesAsync();

            // Add ProjectUser And Save Change
            await _dbContext.AddAsync(
                new ProjectUser{
                    UserID = user.Id,
                    ProjectID = newProject.ProjectID,
                    UserRole = "owner",
                    IsFollowing = true
                }
            );
            await _dbContext.SaveChangesAsync();

            // Check If Default Tag Exist
            Tag tagUserName = _dbContext.Tag.SingleOrDefault(t => t.Name == user.UserName);
            Tag tagProjectName = _dbContext.Tag.SingleOrDefault(t => t.Name == formdata.Name);

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

            // Add Both Tag To Project
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
                result = newProject,
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
        public async Task<IActionResult> AddUser([FromForm] ProjectUserVM formdata)
        {
            // Find Tag In Database
            var projectUser = _dbContext.ProjectUsers.Find(formdata.UserID, formdata.ProjectID);

            // Update Project User If Exist
            if (projectUser != null)
            {
                // If Project User Is Not Follower Return Error
                if(projectUser.UserRole != "follower") return Conflict(new {result = formdata, message = "Project User Already Exist"});

                // Add Tag To Project
                projectUser.UserRole = formdata.UserRole;

                await _dbContext.SaveChangesAsync();

                _dbContext.Entry(projectUser).Reference(pu => pu.User).Load();

                // Return Ok Status
                return Ok(new
                {
                    result = projectUser,
                    message = "Project User Successfully Updated"
                });
            }

            // Create Many To Many Connection
            projectUser = new ProjectUser
            {
                ProjectID = formdata.ProjectID,
                UserID = formdata.UserID,
                UserRole = formdata.UserRole,
                IsFollowing = formdata.IsFollowing
            };

            // Add To Database And Save Change
            await _dbContext.ProjectUsers.AddAsync(projectUser);
            await _dbContext.SaveChangesAsync();

            _dbContext.Entry(projectUser).Reference(pu => pu.User).Load();

            // Return Ok Status
            return Ok(new
            {
                result = projectUser,
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
        public async Task<IActionResult> AddTag([FromForm] ProjectTagVM formdata)
        {
            // Find Tag In Database
            Tag tag = _dbContext.Tag.SingleOrDefault(t => t.Name == formdata.TagName);
            if (tag == null)
            {

                // Create Tag
                tag = new Tag
                {
                    Name = formdata.TagName,
                };

                // Add Tag To Database
                await _dbContext.Tag.AddAsync(tag);
                await _dbContext.SaveChangesAsync();
            }

            // Find ProjectTag In Database
            ProjectTag projectTag = _dbContext.ProjectTags.SingleOrDefault(pt => pt.ProjectID == formdata.ProjectID && pt.TagID == tag.TagID);
            if (projectTag != null) return Conflict(new { message = "Project Tag Already Exist" });

            
            // Add Project Tag To Project
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
                result = projectTag,
                message = "Project Tag Added"
            });
        }

        /*
         * Type : POST
         * URL : /api/project/uploadfile
         * Param : FileUploadProjectViewModel
         * Description: Upload Folder To Azure Storage
         */
        [HttpPost("[action]")]
        public async Task<IActionResult> UploadFile([FromForm] ProjectFileUploadVM formdata)
        {
            try
            {
                if (formdata.Directory == null) { formdata.Directory = ""; }

                // Reture Bad Request Status
                if (formdata.File == null) return BadRequest("Null File");
                if (formdata.File.Length == 0) return BadRequest("Empty File");

                // Find User
                var user = await _dbContext.Users.FindAsync(formdata.UserID);
                if (user == null) return NotFound(new { message = "User Not Found" });

                // Find Project
                var project = await _dbContext.Projects.FindAsync(formdata.ProjectID);
                if (project == null) return NotFound(new { message = "Project Not Found" });

                // Set File Path
                var filePath = formdata.Directory + formdata.File.FileName;

                // Upload Blob File
                BlobClient blobClient = await _blobService.UploadFileBlobAsync(formdata.File, project.Name.ToLower(), filePath);
                BlobProperties properties = blobClient.GetProperties();

                // Create BlobFile
                var newBlobFile = new BlobFile
                {
                    Container = blobClient.BlobContainerName,
                    Directory = formdata.Directory,
                    Name = Path.GetFileNameWithoutExtension(formdata.File.FileName),
                    Extension = Path.GetExtension(formdata.File.FileName),
                    Size = (int)properties.ContentLength,
                    Uri = blobClient.Uri.ToString(),
                    DateCreated = properties.CreatedOn.UtcDateTime,
                    LastModified = properties.LastModified.UtcDateTime,
                    UserID = formdata.UserID,
                    ProjectID = formdata.ProjectID
                };

                // Update Database with entry
                await _dbContext.BlobFiles.AddAsync(newBlobFile);
                await _dbContext.SaveChangesAsync();

                // Return Ok Status
                return Ok(new
                {
                    result = newBlobFile,
                    message = "File Successfully Uploaded",
                });

            }
            catch (Exception e)
            {
                // Return Bad Request If There Is Any Error
                return BadRequest(new
                {
                    error = e
                });
            }
        }

        /*
         * Type : POST
         * URL : /api/project/createfolder
         * Param : FileUploadProjectViewModel
         * Description: Upload Folder To Azure Storage
         */
        [HttpPost("[action]")]
        public async Task<IActionResult> CreateFolder([FromForm] FolderUploadProfileViewModel formdata)
        {
            try
            {
                if (formdata.Directory == null) { formdata.Directory = ""; }

                // Find User
                var user = await _dbContext.Users.FindAsync(formdata.UserID);
                if (user == null) return NotFound(new { message = "User Not Found" });

                // Find Project
                var project = await _dbContext.Projects.FindAsync(formdata.ProjectID);
                if (project == null) return NotFound(new { message = "Project Not Found" });

                var filePath = formdata.Directory + "$$$.$$";
                BlobClient blobClient = await _blobService.CreateFolder(project.Name.ToLower(), filePath);
                BlobProperties properties = blobClient.GetProperties();

                // Create BlobFile
                var newBlobFile = new BlobFile
                {
                    Container = blobClient.BlobContainerName,
                    Directory = formdata.Directory,
                    Name = "$$$",
                    Extension = ".$$",
                    Size = (int)properties.ContentLength,
                    Uri = blobClient.Uri.ToString(),
                    DateCreated = properties.CreatedOn.UtcDateTime,
                    LastModified = properties.LastModified.UtcDateTime,
                    UserID = formdata.UserID,
                    ProjectID = formdata.ProjectID
                };

                // Update Database with entry
                await _dbContext.BlobFiles.AddAsync(newBlobFile);
                await _dbContext.SaveChangesAsync();

                // Return Ok Status
                return Ok(new
                {
                    result = newBlobFile,
                    message = "File Successfully Uploaded"
                });

            }
            catch (Exception e)
            {
                // Return Bad Request If There Is Any Error
                return BadRequest(new
                {
                    error = e
                });
            }

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
        public async Task<IActionResult> UpdateProject([FromRoute] int projectID, [FromForm] ProjectVM formdata)
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
                result = project,
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
        public async Task<IActionResult> UpdateUser([FromForm] ProjectUserVM formdata)
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
                    result = userRole,
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
                result = userRole,
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
                result = deleteProject,
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
            var projectUser = await _dbContext.ProjectUsers.FindAsync(userID, projectID);
            if (projectUser == null) return NotFound( new { message = "User Not Found"});

            // Remove User Role
            _dbContext.ProjectUsers.Remove(projectUser);

            // Save Change
            await _dbContext.SaveChangesAsync();

            // Return Ok Status
            return Ok(new
            {
                result = projectUser,
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
            ProjectTag projectTag = _dbContext.ProjectTags
                .Include(pt => pt.Tag)
                .SingleOrDefault(pt => pt.ProjectID == projectID && pt.TagID == tagID);
            if (projectTag == null) return NotFound(new { message = "Project Tag Not Found"});

            // Remove Project Tag
            _dbContext.ProjectTags.Remove(projectTag);

            // Save Change
            await _dbContext.SaveChangesAsync();

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
                result = projectTag,
                message = projectTag.Tag.Name  + " tag has been removed"
            });
        }

        /*
         * Type : DELETE
         * URL : /api/project/deletefile/
         * Param : {fileID}
         * Description: Delete File From Azure Storage
         */
        [HttpDelete("[action]/{fileID}")]
        public async Task<IActionResult> DeleteFile([FromRoute] int fileID)
        {
            try
            {
                // Find File
                var blobFile = await _dbContext.BlobFiles.FindAsync(fileID);
                if (blobFile == null) return NotFound(new { message = "File Not Found" });

                await _blobService.DeleteBlobAsync(blobFile);

                // Delete Blob Files From Database
                _dbContext.BlobFiles.Remove(blobFile);

                // Save Change to Database
                await _dbContext.SaveChangesAsync();

                // Return Ok Status
                return Ok(new
                {
                    result = blobFile,
                    message = "File Successfully Deleted"
                });
            }
            catch (Exception e)
            {
                // Return Bad Request If There Is Any Error
                return BadRequest(new
                {
                    error = e
                });
            }

        }
        #endregion

        #region Extra
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
            var users = _dbContext.ProjectUsers
                .Include(pu => pu.User).ThenInclude(u => u.BlobFiles)
                .Include(pu => pu.User).ThenInclude(u => u.Followers)
                .Include(pu => pu.User).ThenInclude(u => u.Following)
                .Include(pu => pu.User).ThenInclude(u => u.ProjectUsers)
                .Where(pu => pu.ProjectID == projectID)
                .ToList();
            if (users.Count() == 0) return NoContent();

            // Return Ok Status
            return Ok(new
            {
                result = users,
                message = "Recieved Project User"
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
            var files = _dbContext.BlobFiles
                .ToList()
                .Where(p => p.ProjectID == projectID);

            // Return Ok Status
            return Ok(new
            {
                result = files,
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
            if (!project.Any()) return NotFound(new { message = "Project Not Found" });

            var query = project
                .SelectMany(p => _dbContext.ProjectTags)
                .Select(pt => pt.Tag);

            // Return Ok Status
            return Ok(new
            {
                result = query,
                message = "Recieved Tag List."
            });
        }
        #endregion

        #region Testing
        [HttpGet("[action]")]
        public async Task<IActionResult> AuditFile()
        {
            // Find Project
            var project = await _dbContext.Projects.FindAsync(1);
            if (project == null) return NotFound(new { message = "Project Not Found" });

            var relatedDirectory = await _blobService.ListBlobsAsync(project.Name.ToLower());

            // Update Database with entry
            _dbContext.BlobFiles.AddRange(relatedDirectory);
            await _dbContext.SaveChangesAsync();

            // Return Ok Status
            return Ok(new
            {
                result = relatedDirectory,
                message = "File Successfully Uploaded"
            });
        }

        [HttpGet("[action]")]
        public async Task<IActionResult> Test()
        {
            // Find Project
            var project = await _dbContext.Projects.FindAsync(3);
            if (project == null) return NotFound(new { message = "Project Not Found" });


            // Get Storage Container
            var containerClient = _blobServiceClient.GetBlobContainerClient(project.Name.ToLower());

            // Create Container If Storage Doesn't Exist
            bool isExist = containerClient.Exists();
            if (!isExist)
            {
                containerClient.Create();
            }


            // Return Ok Status
            return Ok(new
            {
                result = containerClient,
                message = "File Successfully Uploaded"
            });
        }


        /*
         * Type : GET
         * URL : /api/test/getrelated?
         * Param : 
         * Description: Upload File To Azure Storage
         */
        [HttpGet("[action]")]
        public async Task<IActionResult> GetRelated([FromQuery(Name = "directory")] string directory)
        {
            try
            {
                if (directory == null || directory == "/")
                {
                    directory = "";
                }


                // Find Project
                var project = await _dbContext.Projects.FindAsync(1);
                if (project == null) return NotFound(new { message = "Project Not Found" });

                var relatedDirectory = await _blobService.ListBlobsAsync(project.Name.ToLower(), directory);

                // Return Ok Status
                return Ok(new
                {
                    directory = directory,
                    result = relatedDirectory,
                    message = "File Successfully Uploaded"
                });

            }
            catch (Exception e)
            {
                // Return Bad Request If There Is Any Error
                return BadRequest(new
                {
                    error = e
                });
            }

        }

        /*
         * Type : PUT
         * URL : /api/test/movefile
         * Param : BlobUploadViewModel
         * Description: Upload Folder To Azure Storage
         */
        [HttpPut("[action]")]
        public async Task<IActionResult> MoveFile([FromForm] ProjectFileMoveVM formdata)
        {
            try
            {
                // Check Model State
                if (!ModelState.IsValid) return BadRequest(ModelState);

                // Find User
                var blobFile = await _dbContext.BlobFiles.FindAsync(formdata.FileID);
                if (blobFile == null) return NotFound(new { message = "File Not Found" });

                var filePath = formdata.SubDirectory + blobFile.Name + blobFile.Extension;

                BlobClient blobClient = await _blobService.MoveBlobAsync(blobFile, filePath);
                BlobProperties properties = blobClient.GetProperties();

                blobFile.Directory = formdata.SubDirectory;
                blobFile.Uri = blobClient.Uri.ToString();
                blobFile.LastModified = properties.LastModified.LocalDateTime;

                // Set Entity State
                _dbContext.Entry(blobFile).State = EntityState.Modified;

                // Update Database with entry
                await _dbContext.SaveChangesAsync();

                // Return Ok Status
                return Ok(new
                {
                    result = blobFile,
                    message = "File Successfully Moved"
                });

            }
            catch (Exception e)
            {
                // Return Bad Request If There Is Any Error
                return BadRequest(new
                {
                    error = e
                });
            }
        }
        #endregion
    }
}
