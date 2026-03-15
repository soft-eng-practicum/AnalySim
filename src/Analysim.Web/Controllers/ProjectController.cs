using Internal;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
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
using System.Net.Http;
using System.Collections;
using Microsoft.AspNetCore.Http;
using System.ComponentModel;
using static System.Reflection.Metadata.BlobBuilder;
using System.Net;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Analysim.Web.ViewModels.Project;
using SixLabors.ImageSharp.Metadata.Profiles.Exif;
using System.Web;
using Newtonsoft.Json;
using Analysim.Core.Entities;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Core.Helper;
using Microsoft.Extensions.Options;

namespace Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProjectController : ControllerBase
    {

        private readonly ApplicationDbContext _dbContext;
        private readonly IConfiguration _configuration;
        private readonly FileValidationSettings _fileValidationSettings;

        public ProjectController(ApplicationDbContext dbContext, IConfiguration configuration,
                                 IOptions<FileValidationSettings> fileValidationSettings)
        {
            _dbContext = dbContext;
            _configuration = configuration;
            _fileValidationSettings = fileValidationSettings.Value;
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
                .Include(p => p.Notebooks)
                .Include(p => p.ProjectTags).ThenInclude(pt => pt.Tag)
                .SingleOrDefault(p => p.ProjectID == projectID);
            if (project == null) return NotFound(new { message = "Project Not Found" });

            // Return Ok Request
            return Ok(new
            {
                result = project,
                message = "Received Project"
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
                .Include(p => p.Notebooks)
                .Include(p => p.ProjectUsers).ThenInclude(pu => pu.User)
                .Include(p => p.ProjectTags).ThenInclude(pt => pt.Tag)
                .SingleOrDefault(p => p.Route.ToLower() == owner.ToLower() + "/" + projectname.ToLower());
            if (project == null) return NotFound(new { message = "Project Not Found" });

            // Return Ok Request
            return Ok(new
            {
                result = project,
                message = "Received Project"
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
                message = "Received Project"
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
                message = "Received Project"
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
                message = "Received Search Result."
            });
        }

        /*
         * Type : GET
         * URL : /api/project/downloadfile/
         * Param : {fileID}
         * Description: Download file from Azure Storage
         */
        [HttpGet("[action]/{fileID}")]
        public async Task<IActionResult> DownloadFile([FromRoute] int fileID)
        {
            try
            {

                // Find blobfile
                var blobFile = await _dbContext.BlobFiles.FindAsync(fileID);
                if (blobFile == null) return NotFound();

                //find blobfile content
                var blobFileContent = await _dbContext.BlobFileContent.FindAsync(fileID);
                if (blobFileContent == null) return NotFound();

                //BlobDownloadInfo data = await _blobService.GetBlobAsync(blobFile);

                return File(blobFileContent.Content, "application/octet-stream", blobFile.Name + blobFile.Extension);
            }
            catch (Exception e)
            {
                // Return Bad Request If There Is Any Error
                return BadRequest(e);
            }

        }

        /*
         * Type : GET
         * URL : /api/project/download/
         * Param : {username}/{projectname}/{directory}/{filename}
         * Description: Download file with user and project name
         */
        [HttpGet("[action]/{username}/{projectname}/{*filepath}")]
        public async Task<IActionResult> Download([FromRoute] string username, [FromRoute] string projectname, [FromRoute] string filepath)
        {
            try
            {

                // Find blobfile
                var blobFile = await _dbContext.BlobFiles
                    .FirstOrDefaultAsync(b => b.User.UserName == username && b.Container == projectname && b.Directory + b.Name + b.Extension == filepath);

                if (blobFile == null) return NotFound();

                //find blobfile content
                var blobFileContent = await _dbContext.BlobFileContent.FindAsync(blobFile.BlobFileID);
                if (blobFileContent == null) return NotFound();

                //BlobDownloadInfo data = await _blobService.GetBlobAsync(blobFile);

                return File(blobFileContent.Content, "application/octet-stream", blobFile.Name + blobFile.Extension);
            }
            catch (Exception e)
            {
                // Return Bad Request If There Is Any Error
                return BadRequest(e);
            }

        }

        [HttpGet("[action]/{notebookID}/{version}")]
        public async Task<IActionResult> DownloadNotebook([FromRoute] int notebookID, [FromRoute] int version)
        {
            try
            {

                // Find Project
                var notebookContent = await _dbContext.NotebookContent
                    .FindAsync(notebookID, version);
                if (notebookContent == null) return NotFound();

                var notebook = await _dbContext.Notebook.FindAsync(notebookID);
                if (notebook == null) return NotFound();

                //BlobDownloadInfo data = await _blobService.GetNotebookAsync(notebook);

                return File(notebookContent.Content, "application/octet-stream", notebook.Name + "_v" + version + notebook.Extension);
            }
            catch (Exception e)
            {
                // Return Bad Request If There Is Any Error
                return BadRequest(e);
            }

        }

        [HttpGet("[action]/{notebookID}")]
        public async Task<IActionResult> GetNotebook([FromRoute] int notebookID)
        {
            try
            {
                var notebook = await _dbContext.Notebook.Include(notebook => notebook.
                observableNotebookDatasets).FirstOrDefaultAsync(notebook => notebook.NotebookID == notebookID);
                return Ok(new
                {
                    message = "Notebook Retrieved",
                    notebook
                });
            }
            catch (Exception e)
            {
                // Return Bad Request If There Is Any Error
                return BadRequest(e);
            }
        }

        [HttpGet("[action]")]
        public IActionResult GetAllNotebooks()
        {
            var notebooks = _dbContext.Notebook
                .Include(n => n.observableNotebookDatasets)
                .ToList();

            return Ok(new
            {
                result = notebooks,
                message = "All notebooks retrieved"
            });
        }

        [HttpGet("[action]/{notebookID}")]
        public async Task<IActionResult> GetNotebookVersions([FromRoute] int notebookID)
        {
            try
            {
                var versions = await _dbContext.NotebookContent
                .Where(n => n.NotebookID == notebookID)
                .OrderByDescending(n => n.Version)
                .Select(n => n.Version)
                .ToListAsync();

                return Ok(new
                {
                    message = "versions for the notebook retrieved",
                    versions = versions
                });
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
       * URL : /api/project/forkproject
       * Param : ProjectViewModel
       * Description: Fork Project
       */
        [Authorize]
        [HttpPost("[action]")]
        public async Task<IActionResult> ForkProject([FromForm] ProjectForkVM formdata)
        {
            // Find User
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid user identifier." });
            }

            var user = await _dbContext.Users.SingleOrDefaultAsync(u => u.Id == userId);
            if (user == null) return NotFound(new { message = "User Not Found" });

            // Find Project
            var project = await _dbContext.Projects.FindAsync(formdata.ProjectID);
            if (project == null) return NotFound(new { message = "Project Not Found" });

            // Check if the project already exists
            bool projectExists = await _dbContext.Projects
                .AnyAsync(p => p.ProjectUsers.Any(aup =>
                    aup.User.Id == userId &&
                    aup.Project.Name == project.Name &&
                    aup.UserRole == "owner"));

            if (projectExists) return Conflict(new { message = "Project Already Exists" });

            await using var tx = await _dbContext.Database.BeginTransactionAsync();

            try
            {
                // 1) Create Project
                var newProject = new Project
                {
                    Name = project.Name,
                    Visibility = project.Visibility,
                    Description = project.Description,
                    DateCreated = DateTimeOffset.UtcNow,
                    LastUpdated = DateTimeOffset.UtcNow,
                    Route = user.UserName + "/" + project.Name,
                    ForkedFromProjectID = project.ProjectID,
                };

                await _dbContext.Projects.AddAsync(newProject);
                await _dbContext.SaveChangesAsync();

                // 2) Add ProjectUser (owner)
                await _dbContext.AddAsync(new ProjectUser
                {
                    UserID = user.Id,
                    ProjectID = newProject.ProjectID,
                    UserRole = "owner",
                    IsFollowing = true
                });
                await _dbContext.SaveChangesAsync();

                // Maps old blob ids with new blob ids
                var blobFileIdMap = new Dictionary<int, int>();

                // 3) Add BlobFiles 
                if (formdata.BlobFilesID != null && formdata.BlobFilesID.Length > 0)
                {
                    for (int i = 0; i < formdata.BlobFilesID.Length; i++)
                    {
                        var file = await _dbContext.BlobFiles.FindAsync(formdata.BlobFilesID[i]);
                        if (file == null) continue; 

                       var newBlobFile = new BlobFile
                       {
                           Container = file.Container,
                           Directory = file.Directory,
                           Name = file.Name,
                           Extension = file.Extension,
                           Size = file.Size,
                           Uri = file.Uri,
                           DateCreated = DateTimeOffset.UtcNow,
                           LastModified = DateTimeOffset.UtcNow,
                           User = user,
                           UserID = user.Id,
                           Project = newProject,
                           ProjectID = newProject.ProjectID,
                       };

                       await _dbContext.BlobFiles.AddAsync(newBlobFile);
                       await _dbContext.SaveChangesAsync();

                       // Link blob ids
                       blobFileIdMap[file.BlobFileID] = newBlobFile.BlobFileID;

                       var oldBlobFileContent = await _dbContext.BlobFileContent.FindAsync(file.BlobFileID);
                       if(oldBlobFileContent != null)
                        {
                            await _dbContext.BlobFileContent.AddAsync(new BlobFileContent
                            {
                                BlobFileID = newBlobFile.BlobFileID,
                                Content = oldBlobFileContent.Content
                            });

                            await _dbContext.SaveChangesAsync();
                        }
                    }
                }

                // 4) Clone Notebooks + Contents + ObservableNotebookDataset 
                var sourceNotebooks = await _dbContext.Notebook
                    .Where(n => n.ProjectID == project.ProjectID)
                    .Include(n => n.NotebookContents)
                    .Include(n => n.observableNotebookDatasets)
                    .ToListAsync();

                foreach (var oldNotebook in sourceNotebooks)
                {
                    var newNotebook = new Notebook
                    {
                        ProjectID = newProject.ProjectID,
                        Project = newProject,

                        Name = oldNotebook.Name,
                        Directory = oldNotebook.Directory,
                        Extension = oldNotebook.Extension,

                        Container = "notebook-" + newProject.Name.ToLower(),
                        Route = user.UserName + "/" + newProject.Name,

                        Uri = oldNotebook.Uri,
                        Size = oldNotebook.Size,

                        DateCreated = DateTimeOffset.UtcNow,
                        LastModified = DateTimeOffset.UtcNow,

                        type = oldNotebook.type
                    };

                    await _dbContext.Notebook.AddAsync(newNotebook);
                    await _dbContext.SaveChangesAsync();

                    // Copy versions
                    if (oldNotebook.NotebookContents != null && oldNotebook.NotebookContents.Count > 0)
                    {
                        foreach (var oldContent in oldNotebook.NotebookContents)
                        {
                            await _dbContext.NotebookContent.AddAsync(new NotebookContent
                            {
                                NotebookID = newNotebook.NotebookID,
                                Version = oldContent.Version,
                                Content = oldContent.Content,
                                Author = oldContent.Author,
                                Size = oldContent.Size,
                                DateCreated = oldContent.DateCreated
                            });
                        }
                    }

                    // Copy observable dataset links
                    if (oldNotebook.observableNotebookDatasets != null && oldNotebook.observableNotebookDatasets.Count > 0)
                    {
                        foreach (var oldObs in oldNotebook.observableNotebookDatasets)
                        {
                            // Checks if map includes blob copy
                            // if not, do not create row
                            if(!blobFileIdMap.TryGetValue(oldObs.BlobFileID, out var newBlobFileId))
                            {
                                continue;
                            }

                            await _dbContext.ObservableNotebookDataset.AddAsync(new ObservableNotebookDataset
                            {
                                NotebookID = newNotebook.NotebookID,
                                datasetName = oldObs.datasetName,
                                datasetURL = oldObs.datasetURL,
                                BlobFileID = newBlobFileId
                            });
                        }
                    }

                    await _dbContext.SaveChangesAsync();
                }

                await tx.CommitAsync();

                return Ok(new
                {
                    result = newProject,
                    message = "Project Successfully Forked"
                });
            }
            catch (Exception ex)
            {
                await tx.RollbackAsync();
                Console.WriteLine(ex);
                return BadRequest(new
                {
                    message = "Fork failed",
                    detail = ex.Message
                });
            }
        }

        /*
        * Type : POST
        * URL : /api/project/forkprojectwithoutblob
        * Param : ProjectViewModel
        * Description: Fork Project Without Blob
        */
        [Authorize]
        [HttpPost("[action]")]
        public async Task<IActionResult> ForkProjectWithoutBlob([FromForm] ProjectForkVM formdata)
        {
            // Find User
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid user identifier." });
            }

            var user = await _dbContext.Users.SingleOrDefaultAsync(u => u.Id == userId);
            if (user == null) return NotFound(new { message = "User Not Found" });

            // Find Project
            var project = await _dbContext.Projects.FindAsync(formdata.ProjectID);
            if (project == null) return NotFound(new { message = "Project Not Found" });

            // Check if the project already exists
            bool projectExists = await _dbContext.Projects
                .AnyAsync(p => p.ProjectUsers.Any(aup =>
                    aup.User.Id == userId &&
                    aup.Project.Name == project.Name &&
                    aup.UserRole == "owner"));

            // If the project exists, return a conflict response
            if (projectExists) return Conflict(new { message = "Project Already Exists" });

            await using var tx = await _dbContext.Database.BeginTransactionAsync();

            try
            {
                // 1) Create forked Project
                var newProject = new Project
                {
                    Name = project.Name,
                    Visibility = project.Visibility,
                    Description = project.Description,
                    DateCreated = DateTimeOffset.UtcNow,
                    LastUpdated = DateTimeOffset.UtcNow,
                    Route = user.UserName + "/" + project.Name,
                    ForkedFromProjectID = project.ProjectID,
                };

                // Add Project And Save Change
                await _dbContext.Projects.AddAsync(newProject);
                await _dbContext.SaveChangesAsync();

                // 2) Add owner
                await _dbContext.AddAsync(new ProjectUser
                {
                    UserID = user.Id,
                    ProjectID = newProject.ProjectID,
                    UserRole = "owner",
                    IsFollowing = true
                });
                await _dbContext.SaveChangesAsync();

                // 3) Clone Notebooks + Contents + ObservableNotebookDataset
                var sourceNotebooks = await _dbContext.Notebook
                    .Where(n => n.ProjectID == project.ProjectID)
                    .Include(n => n.NotebookContents)
                    .Include(n => n.observableNotebookDatasets)
                    .ToListAsync();

                foreach (var oldNotebook in sourceNotebooks)
                {
                    var newNotebook = new Notebook
                    {
                        ProjectID = newProject.ProjectID,
                        Project = newProject,

                        Name = oldNotebook.Name,
                        Directory = oldNotebook.Directory,
                        Extension = oldNotebook.Extension,

                        Container = "notebook-" + newProject.Name.ToLower(),
                        Route = user.UserName + "/" + newProject.Name,

                        Uri = oldNotebook.Uri,
                        Size = oldNotebook.Size,

                        DateCreated = DateTimeOffset.UtcNow,
                        LastModified = DateTimeOffset.UtcNow,

                        type = oldNotebook.type
                    };

                    await _dbContext.Notebook.AddAsync(newNotebook);
                    await _dbContext.SaveChangesAsync();

                    // Copy versions
                    if (oldNotebook.NotebookContents != null && oldNotebook.NotebookContents.Count > 0)
                    {
                        foreach (var oldContent in oldNotebook.NotebookContents)
                        {
                            await _dbContext.NotebookContent.AddAsync(new NotebookContent
                            {
                                NotebookID = newNotebook.NotebookID,
                                Version = oldContent.Version,
                                Content = oldContent.Content,
                                Author = oldContent.Author,
                                Size = oldContent.Size,
                                DateCreated = oldContent.DateCreated
                            });
                        }
                    }

                    // Do not copy observable dataset links
                    // this fork mode does not copy blob files.

                    await _dbContext.SaveChangesAsync();
                }

                await tx.CommitAsync();

                return Ok(new
                {
                    result = newProject,
                    message = "Project Successfully Forked"
                });
            }
            catch (Exception ex)
            {
                await tx.RollbackAsync();
                Console.WriteLine(ex);
                return BadRequest(new
                {
                    message = "Fork failed",
                    detail = ex.Message
                });
            }
        }

        /*
        * Type : POST
        * URL : /api/project/createproject
        * Param : ProjectViewModel
        * Description: Create Project
        */
        [Authorize]
        [HttpPost("[action]")]
            public async Task<IActionResult> CreateProject([FromForm] ProjectVM formdata)
            {

            // Find User
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid user identifier." });
            }

            var user = await _dbContext.Users.SingleOrDefaultAsync(u => u.Id == userId);
            //var user = await _dbContext.Users.FindAsync(userId);
            if (user == null) return NotFound(new { message = "User Not Found" });

            // Check if the project already exists
            bool projectExists = await _dbContext.Projects
                .AnyAsync(p => p.ProjectUsers.Any(aup =>
                    aup.User.Id == formdata.UserID &&
                    aup.Project.Name == formdata.Name &&
                    aup.UserRole == "owner"));

            // If the project exists, return a conflict response
            if (projectExists)  return Conflict(new { message = "Project Already Exists" }); 

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
                new ProjectUser
                {
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

            //uploading a readme file
            var readmeContent = new
            {
                cells = new[]
        {
            new
            {
                cell_type = "markdown",
                metadata = new { },
                source = new[] { $"# Hello, this is Readme file of {formdata.Name}" }
            }
        },
                metadata = new { },
                nbformat = 4,
                nbformat_minor = 2
            };

            var readmeJson = System.Text.Json.JsonSerializer.Serialize(readmeContent);
            var readmeFileContent = System.Text.Encoding.UTF8.GetBytes(readmeJson);

            Notebook readmeNotebook = new Notebook
            {
                Container = "notebook-" + newProject.Name.ToLower(),
                Name = "readme",
                Directory = "notebook/",
                Extension = ".ipynb",
                Uri = "",
                Size = readmeFileContent.Length,
                DateCreated = DateTime.UtcNow,
                LastModified = DateTime.UtcNow,
                ProjectID = newProject.ProjectID,
                type = "new",
                Route = user.UserName + "/" + newProject.Name
            };

            await _dbContext.Notebook.AddAsync(readmeNotebook);
            await _dbContext.SaveChangesAsync();

            NotebookContent readmeNotebookContent = new NotebookContent
            {
                NotebookID = readmeNotebook.NotebookID,
                Version = 1,
                Content = readmeFileContent,
                Author = "hello",
                Size = readmeFileContent.Length,
                DateCreated = DateTime.UtcNow
            };

            await _dbContext.NotebookContent.AddAsync(readmeNotebookContent);
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
        [Authorize]
        [HttpPost("[action]")]
        public async Task<IActionResult> AddUser([FromForm] ProjectUserVM formdata)
        {
            // Find User
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid user identifier." });
            }
            var user = await _dbContext.Users.SingleOrDefaultAsync(u => u.Id == userId);
            if (user == null) return NotFound(new { message = "User Not Found" });

            bool isOwner = await _dbContext.Projects
                .AnyAsync(p => p.ProjectUsers.Any(aup =>
                    aup.User.Id == user.Id &&
                    aup.Project.ProjectID == formdata.ProjectID &&
                    aup.UserRole == "owner"));

            if (!isOwner)   return Unauthorized(new { message = "You are not the owner of the project" });
            
            // Find Tag In Database
            var projectUser = _dbContext.ProjectUsers.Find(formdata.UserID, formdata.ProjectID);

            // Update Project User If Exist
            if (projectUser != null)
            {
                // If Project User Is Not Follower Return Error
                if (projectUser.UserRole != "follower") return Conflict(new { result = formdata, message = "Project User Already Exist" });

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
        [Authorize]
        public async Task<IActionResult> AddTag([FromForm] ProjectTagVM formdata)
        {
            // Find User
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid user identifier." });
            }
            var user = await _dbContext.Users.SingleOrDefaultAsync(u => u.Id == userId);
            if (user == null) return NotFound(new { message = "User Not Found" });


            bool isOwner = await _dbContext.Projects
                .AnyAsync(p => p.ProjectUsers.Any(aup =>
                    aup.User.Id == user.Id &&
                    aup.Project.ProjectID == formdata.ProjectID &&
                    aup.UserRole == "owner"));

            if (!isOwner)
            {
                return Unauthorized(new { message = "You are not the owner of the project" });
            }

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
         * Description: Upload file to Azure Storage
         */
        [Authorize]
        [HttpPost("[action]")]
        public async Task<IActionResult> UploadFile([FromForm] ProjectFileUploadVM formdata)
        {
            try
            {
                // Find User
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { message = "Invalid user identifier." });
                }
                var user = await _dbContext.Users.SingleOrDefaultAsync(u => u.Id == userId);
                if (user == null) return NotFound(new { message = "User Not Found" });

                bool isOwner = await _dbContext.Projects
                     .AnyAsync(p => p.ProjectUsers.Any(aup =>
                         aup.User.Id == user.Id &&
                         aup.Project.ProjectID == formdata.ProjectID &&
                         aup.UserRole == "owner"));

                if (!isOwner) return Unauthorized(new { message = "You are not the owner of the project" });
                

                if (formdata.Directory == null) { formdata.Directory = ""; }

                // Return Bad Request Status
                if (formdata.File == null) return BadRequest("Null File");
                if (formdata.File.Length == 0) return BadRequest("Empty File");

                // Find User
                //var user = await _dbContext.Users.FindAsync(formdata.UserID);
                //if (user == null) return NotFound(new { message = "User Not Found" });

                // Find Project
                var project = await _dbContext.Projects.FindAsync(formdata.ProjectID);
                if (project == null) return NotFound(new { message = "Project Not Found" });

                // Check quota (TODO: check if conf file has field and give proper error)
                var maxsize = int.Parse(_configuration["UserQuota"]);
                var totalsize = await _dbContext.BlobFiles
                    .Where(b => b.UserID == user.Id)
                    .SumAsync(b => b.Size);
                if (totalsize + formdata.File.Length > maxsize)
                    return BadRequest($"Exceeds total user quota of {(maxsize / 1e6).ToString()} MB.");

                // Set File Path
                //var filePath = formdata.Directory + formdata.File.FileName;

                //System.Diagnostics.Debug.WriteLine($"filePath: {filePath}");

                // Upload Blob File
                //BlobClient blobClient = await _blobService.UploadFileBlobAsync(formdata.File, project.Name.ToLower(), filePath);
                //System.Diagnostics.Debug.WriteLine($"after upload test");
                //BlobProperties properties = blobClient.GetProperties();

                using var memoryStream = new MemoryStream();
                await formdata.File.CopyToAsync(memoryStream);
                var fileContent = memoryStream.ToArray();

                // Validate file type and size
                var fileValidator = new Core.Helper.FileTypeValidator(_fileValidationSettings);
                var validationResult = fileValidator.ValidateProjectFile(formdata.File.FileName, fileContent);
                if (!validationResult.IsValid)
                    return BadRequest(validationResult.ErrorMessage);

                // Create BlobFile
                var newBlobFile = new BlobFile
                {
                    Container = project.Name.ToLower(),
                    Directory = formdata.Directory,
                    Name = Path.GetFileNameWithoutExtension(formdata.File.FileName),
                    Extension = Path.GetExtension(formdata.File.FileName),
                    Size = (int)formdata.File.Length,
                    Uri = "",
                    DateCreated = DateTimeOffset.UtcNow,
                    LastModified = DateTimeOffset.UtcNow,
                    UserID = user.Id,
                    ProjectID = formdata.ProjectID
                };

                // Update Database with entry
                await _dbContext.BlobFiles.AddAsync(newBlobFile);
                await _dbContext.SaveChangesAsync();

                //create blobfilecontent
                var newBlobFileContent = new BlobFileContent
                {
                    BlobFileID = newBlobFile.BlobFileID,
                    Content = fileContent,
                    DateCreated = DateTimeOffset.UtcNow
                };

                await _dbContext.BlobFileContent.AddAsync(newBlobFileContent);
                await _dbContext.SaveChangesAsync();

                newBlobFile.BlobFileContents = null;

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
                System.Console.WriteLine(e);
                return BadRequest(e);
            }
        }

        /*
         * Type : POST
         * URL : /api/project/uploadnotebook
         * Param : NotebookUploadProjectViewModel
         * Description: Upload Notebook to Azure Storage
         */
        [Authorize]
        [HttpPost("[action]")]
        public async Task<IActionResult> UploadNotebook([FromForm] ProjectNotebookUploadVM noteBookData)
        {

            try
            {
                // Find User
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { message = "Invalid user identifier." });
                }
                var user = await _dbContext.Users.SingleOrDefaultAsync(u => u.Id == userId);
                if (user == null) return NotFound(new { message = "User Not Found" });


                bool isOwner = await _dbContext.Projects
                     .AnyAsync(p => p.ProjectUsers.Any(aup =>
                         aup.User.Id == user.Id &&
                         aup.Project.ProjectID == noteBookData.ProjectID &&
                         aup.UserRole == "owner"));

                if (!isOwner)   return Unauthorized(new { message = "You are not the owner of the project" });
                

                // Find Project
                var project = await _dbContext.Projects.FindAsync(noteBookData.ProjectID);
                if (project == null) return NotFound(new { message = "Project Not Found" });

                var existingFile = await _dbContext.Notebook
                    .Where(n => n.ProjectID == noteBookData.ProjectID && n.Name == noteBookData.NotebookName && n.Directory == noteBookData.Directory && n.Extension == ".ipynb")
                    .FirstOrDefaultAsync();

                if (existingFile != null)
                {
                    return Conflict(new { message = "Notebook Already Exist" });
                }

                using var memoryStream = new MemoryStream();
                await noteBookData.NotebookFile.CopyToAsync(memoryStream);
                var fileContent = memoryStream.ToArray();

                // Validate notebook file type and size
                var fileValidator = new Core.Helper.FileTypeValidator(_fileValidationSettings);
                var validationResult = fileValidator.ValidateNotebookFile(noteBookData.NotebookFile.FileName, fileContent);
                if (!validationResult.IsValid)
                    return BadRequest(validationResult.ErrorMessage);

                Notebook newNotebook = new Notebook
                {
                    Container = "notebook-" + project.Name.ToLower(),
                    Name = Path.GetFileNameWithoutExtension(noteBookData.NotebookName),
                    Directory = noteBookData.Directory,
                    Extension = Path.GetExtension(noteBookData.NotebookFile.FileName),
                    Uri = "",
                    Size = 0,
                    DateCreated = DateTime.UtcNow,
                    LastModified = DateTime.UtcNow,
                    ProjectID = noteBookData.ProjectID,
                    type = "new",
                    Route = user.UserName + "/" + project.Name
                };
                await _dbContext.Notebook.AddAsync(newNotebook);
                await _dbContext.SaveChangesAsync();

                NotebookContent newNotebookContent = new NotebookContent
                {
                    NotebookID = newNotebook.NotebookID,
                    Version = 1,
                    Content = fileContent,
                    Author = "hello",
                    Size = (int)noteBookData.NotebookFile.Length,
                    DateCreated = DateTime.UtcNow
                };
                await _dbContext.NotebookContent.AddAsync(newNotebookContent);


                await _dbContext.SaveChangesAsync();
                newNotebook.NotebookContents = null;

                // Return Ok Status
                return Ok(new
                {
                    result = newNotebook,
                    message = "Notebook Successfully Uploaded",
                });

            }
            catch (Exception e)
            {
                // Return Bad Request If There Is Any Error
                System.Console.WriteLine(e);
                return BadRequest(e);
            }

        }

        /*
         * Type : POST
         * URL : /api/project/uploadnotebooknewversion
         * Param : NotebookUploadProjectViewModel
         * Description: Upload Notebook's new version 
         */
        [Authorize]
        [HttpPost("[action]")]
        public async Task<IActionResult> UploadNotebookNewVersion([FromForm] ProjectNotebookUploadVM noteBookData)
        {

            try
            {
                // Find User
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { message = "Invalid user identifier." });
                }
                var user = await _dbContext.Users.SingleOrDefaultAsync(u => u.Id == userId);
                if (user == null) return NotFound(new { message = "User Not Found" });

                bool isOwner = await _dbContext.Projects
                     .AnyAsync(p => p.ProjectUsers.Any(aup =>
                         aup.User.Id == user.Id &&
                         aup.Project.ProjectID == noteBookData.ProjectID &&
                         aup.UserRole == "owner"));
                if (!isOwner) return Unauthorized(new { message = "You are not the owner of the project" });
                

                // Find Project
                var project = await _dbContext.Projects.FindAsync(noteBookData.ProjectID);
                if (project == null) return NotFound(new { message = "Project Not Found" });

                var decodedDirectory = HttpUtility.UrlDecode(noteBookData.Directory);

                var existingNotebook = await _dbContext.Notebook
                     .Where(n => n.ProjectID == noteBookData.ProjectID && n.Name == noteBookData.NotebookName && n.Directory == noteBookData.Directory && n.Extension == ".ipynb")
                     .FirstOrDefaultAsync();
                if (existingNotebook == null) return NotFound(new { message = "Notebook Not Found" });

                var latestVersion = await _dbContext.NotebookContent
                    .Where(n => n.NotebookID == existingNotebook.NotebookID)
                    .OrderByDescending(n => n.Version)
                    .Select(n => n.Version)
                    .FirstOrDefaultAsync();


                var version = latestVersion + 1;

                using var memoryStream = new MemoryStream();
                await noteBookData.NotebookFile.CopyToAsync(memoryStream);
                var fileContent = memoryStream.ToArray();

                // Validate notebook file type and size
                var fileValidator = new Core.Helper.FileTypeValidator(_fileValidationSettings);
                var validationResult = fileValidator.ValidateNotebookFile(noteBookData.NotebookFile.FileName, fileContent);
                if (!validationResult.IsValid)
                    return BadRequest(validationResult.ErrorMessage);

                NotebookContent newNotebookContent = new NotebookContent
                {
                    NotebookID = existingNotebook.NotebookID,
                    Version = version,
                    Content = fileContent,
                    Author = "hello",
                    Size = (int)noteBookData.NotebookFile.Length,
                    DateCreated = DateTime.UtcNow
                };
                await _dbContext.NotebookContent.AddAsync(newNotebookContent);


                await _dbContext.SaveChangesAsync();

                // Return Ok Status
                return Ok(new
                {
                    message = "Notebook new version Successfully Uploaded",
                });

            }
            catch (Exception e)
            {
                // Return Bad Request If There Is Any Error
                System.Console.WriteLine(e);
                return BadRequest(e);
            }

        }

        static string GrabId(string line)
        {
            System.Text.RegularExpressions.Match match = System.Text.RegularExpressions.Regex.Match(line, @"(\w|-){26,}");
            return match.Value;
        }

        [Authorize]
        [HttpPost("[action]")]
        public async Task<IActionResult> UploadExistingNotebook([FromForm] ExistingProjectUploadVM noteBookData)
        {
            try
            {
                // Find User
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { message = "Invalid user identifier." });
                }
                var user = await _dbContext.Users.SingleOrDefaultAsync(u => u.Id == userId);
                if (user == null) return NotFound(new { message = "User Not Found" });

                bool isOwner = await _dbContext.Projects
                     .AnyAsync(p => p.ProjectUsers.Any(aup =>
                         aup.User.Id == user.Id &&
                         aup.Project.ProjectID == noteBookData.ProjectID &&
                         aup.UserRole == "owner"));

                if (!isOwner)   return Unauthorized(new { message = "You are not the owner of the project" });
                

                var project = await _dbContext.Projects.FindAsync(noteBookData.ProjectID);
                if (project == null) return NotFound(new { message = "Project Not Found" });

                Notebook newNotebook;

                string notebookUrl = noteBookData.NotebookURL;
                if (noteBookData.Type == "colab")
                {
                    string fileId = GrabId(notebookUrl);
                    Console.WriteLine(fileId);
                    string url = $"https://docs.google.com/uc?export=download&id={fileId}";
                    string fileName = noteBookData.NotebookName + ".ipynb";
                    string filePath = Path.Combine(Path.GetTempPath(), fileName); // Save file in the temp directory
                    using (HttpClient client = new HttpClient())
                    {
                        HttpResponseMessage response = await client.GetAsync(url);
                        response.EnsureSuccessStatusCode();

                        using (HttpContent content = response.Content)
                        {
                            byte[] data = await content.ReadAsByteArrayAsync();
                            System.IO.File.WriteAllBytes(filePath, data);
                        }
                    }

                    newNotebook = new Notebook
                    {
                        Container = "notebook-" + project.Name.ToLower(),
                        Directory = noteBookData.Directory,
                        Name = Path.GetFileNameWithoutExtension(noteBookData.NotebookName),
                        Extension = Path.GetExtension(fileName),
                        Size = 0,
                        Uri = "",
                        DateCreated = DateTimeOffset.UtcNow,
                        LastModified = DateTimeOffset.UtcNow,
                        ProjectID = noteBookData.ProjectID,
                        type = "new",
                        Route = user.UserName + "/" + project.Name
                    };

                    await _dbContext.Notebook.AddAsync(newNotebook);
                    await _dbContext.SaveChangesAsync();

                    using (FileStream fileStream = new FileStream(filePath, FileMode.Open, FileAccess.Read))
                    {
                        byte[] fileContent = System.IO.File.ReadAllBytes(filePath);

                        // Validate notebook file type and size for colab downloads
                        var fileValidator = new Core.Helper.FileTypeValidator(_fileValidationSettings);
                        var validationResult = fileValidator.ValidateNotebookFile(fileName, fileContent);
                        if (!validationResult.IsValid)
                            return BadRequest(validationResult.ErrorMessage);

                        NotebookContent notebookContent = new NotebookContent
                        {
                            NotebookID = newNotebook.NotebookID,
                            Version = 1,
                            Content = fileContent,
                            Author = "hello",
                            Size = (int)fileStream.Length,
                            DateCreated = DateTime.UtcNow
                        };
                        await _dbContext.NotebookContent.AddAsync(notebookContent);
                        await _dbContext.SaveChangesAsync();
                    }

                    newNotebook.NotebookContents = null;

                    // Delete the local file after use
                    if (System.IO.File.Exists(filePath))
                    {
                        System.IO.File.Delete(filePath);
                    }
                }
                else if (noteBookData.Type == "observablehq")
                {
                    List<ObservableNotebookDataset> observableNotebookDatasets = JsonConvert.DeserializeObject<List<ObservableNotebookDataset>>(noteBookData.observableNotebookDatasets);
                    string fileName = noteBookData.Directory + $"{noteBookData.NotebookName}.observable";
                    newNotebook = new Notebook
                    {
                        Container = "notebook-" + project.Name.ToLower(),
                        Directory = noteBookData.Directory,
                        Name = Path.GetFileNameWithoutExtension(noteBookData.NotebookName),
                        Extension = Path.GetExtension(fileName),
                        Size = 0,
                        Uri = notebookUrl,
                        DateCreated = DateTimeOffset.Now.UtcDateTime,
                        LastModified = DateTimeOffset.Now.UtcDateTime,
                        ProjectID = noteBookData.ProjectID,
                        type = "observable",
                        Route = user.UserName + "/" + project.Name,
                        observableNotebookDatasets = observableNotebookDatasets
                    };

                    await _dbContext.Notebook.AddAsync(newNotebook);
                    await _dbContext.SaveChangesAsync();


                }
                else
                {
                    return BadRequest("Nonacceptable type of notebook");
                }

                return Ok(new
                {
                    result = newNotebook,
                    message = "Notebook Uploaded Successfully"
                });
            }
            catch (Exception e)
            {
                return BadRequest(e);
            }
        }
        /*
         * Type : POST
         * URL : /api/project/createfolder
         * Param : FileUploadProjectViewModel
         * Description: Upload Folder To Azure Storage
         */
        [Authorize]
        [HttpPost("[action]")]
        public async Task<IActionResult> CreateFolder([FromForm] FolderUploadProfileViewModel formdata)
        {
            try
            {
                // Find User
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { message = "Invalid user identifier." });
                }
                var user = await _dbContext.Users.SingleOrDefaultAsync(u => u.Id == userId);
                if (user == null) return NotFound(new { message = "User Not Found" });

                bool isOwner = await _dbContext.Projects
                    .AnyAsync(p => p.ProjectUsers.Any(aup =>
                        aup.User.Id == user.Id &&
                        aup.Project.ProjectID == formdata.ProjectID &&
                        aup.UserRole == "owner"));

                if (!isOwner)   return Unauthorized(new { message = "You are not the owner of the project" });
                

                if (formdata.Directory == null) { formdata.Directory = ""; }

                // Find Project
                var project = await _dbContext.Projects.FindAsync(formdata.ProjectID);
                if (project == null) return NotFound(new { message = "Project Not Found" });

                //var filePath = formdata.Directory + "$$$.$$";
                //BlobClient blobClient = await _blobService.CreateFolder(project.Name.ToLower(), filePath);
                //BlobProperties properties = blobClient.GetProperties();

                // Create BlobFile
                var newBlobFile = new BlobFile
                {
                    Container = project.Name.ToLower(),
                    Directory = formdata.Directory,
                    Name = "$$$",
                    Extension = ".$$",
                    Size = 0,
                    Uri = "",
                    DateCreated = DateTimeOffset.UtcNow,
                    LastModified = DateTimeOffset.UtcNow,
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

        [Authorize]
        [HttpPost("[action]")]
        public async Task<IActionResult> CreateNotebookFolder([FromForm] FolderUploadProfileViewModel formdata)
        {
            try
            {
                // Find User
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { message = "Invalid user identifier." });
                }
                var user = await _dbContext.Users.SingleOrDefaultAsync(u => u.Id == userId);
                if (user == null) return NotFound(new { message = "User Not Found" });

                bool isOwner = await _dbContext.Projects
                    .AnyAsync(p => p.ProjectUsers.Any(aup =>
                        aup.User.Id == user.Id &&
                        aup.Project.ProjectID == formdata.ProjectID &&
                        aup.UserRole == "owner"));

                if (!isOwner) return Unauthorized(new { message = "You are not the owner of the project" });
                

                if (formdata.Directory == null) { formdata.Directory = ""; }

                // Find Project
                var project = await _dbContext.Projects.FindAsync(formdata.ProjectID);
                if (project == null) return NotFound(new { message = "Project Not Found" });

                //var filePath = formdata.Directory + formdata.folderName + ".$$";
                //BlobClient blobClient = await _blobService.CreateFolder("notebook-" + project.Name.ToLower(), filePath);
                //BlobProperties properties = blobClient.GetProperties();

                // Create BlobFile
                var newNotebook = new Notebook
                {
                    Container = "notebook-" + project.Name.ToLower(),
                    Directory = formdata.Directory,
                    Name = formdata.folderName,
                    Extension = ".$$",
                    Size = 0,
                    Uri = "",
                    DateCreated = DateTimeOffset.UtcNow,
                    LastModified = DateTimeOffset.UtcNow,
                    ProjectID = formdata.ProjectID,
                    type = "folder",
                    Route = user.UserName + "/" + project.Name
                };

                // Update Database with entry
                await _dbContext.Notebook.AddAsync(newNotebook);
                await _dbContext.SaveChangesAsync();

                // Return Ok Status
                return Ok(new
                {
                    result = newNotebook,
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
         * Type : POST
         * URL : /api/project/addDatasetToNotebook
         * Param : 
         * Description: add dataset to the notebook
         */
        [Authorize]
        [HttpPost("[action]")]
        public async Task<IActionResult> AddDatasetToNotebook([FromForm] int notebookID, [FromForm] int blobFileID, [FromForm] string datasetName)
        {
            try
            {
                // Find User
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { message = "Invalid user identifier." });
                }
                var user = await _dbContext.Users.SingleOrDefaultAsync(u => u.Id == userId);
                if (user == null) return NotFound(new { message = "User Not Found" });

                var notebook = _dbContext.Notebook.SingleOrDefault(n => n.NotebookID == notebookID);

                bool isOwner = await _dbContext.Projects
                    .AnyAsync(p => p.ProjectUsers.Any(aup =>
                        aup.User.Id == user.Id &&
                        aup.Project.ProjectID == notebook.ProjectID &&
                        aup.UserRole == "owner"));
                if (!isOwner)   return Unauthorized(new { message = "You are not the owner of the project" });
                

                var dataset = await _dbContext.ObservableNotebookDataset
                    .FirstOrDefaultAsync(d => d.NotebookID == notebookID && d.BlobFileID == blobFileID);

                if (dataset != null)
                {
                    return Conflict(new { message = "Dataset Already Exist" });
                }

                var newDataset = new ObservableNotebookDataset
                {
                    NotebookID = notebookID,
                    //datasetURL = datasetURL,
                    BlobFileID = blobFileID,
                    datasetName = datasetName
                };

                await _dbContext.ObservableNotebookDataset.AddAsync(newDataset);
                await _dbContext.SaveChangesAsync();

                return Ok(new
                {
                    result = newDataset,
                    message = "Dataset added to the notebook successfully."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error.", error = ex.Message });
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
        [Authorize]
        [HttpPut("[action]/{projectID}")]
        public async Task<IActionResult> UpdateProject([FromRoute] int projectID, [FromForm] ProjectVM formdata)
        {
            // Find User
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid user identifier." });
            }
            var user = await _dbContext.Users.SingleOrDefaultAsync(u => u.Id == userId);
            if (user == null) return NotFound(new { message = "User Not Found" });

            bool isOwner = await _dbContext.Projects
                .AnyAsync(p => p.ProjectUsers.Any(aup =>
                    aup.User.Id == user.Id &&
                    aup.Project.ProjectID == projectID &&
                    aup.UserRole == "owner"));

            if (!isOwner)   return Unauthorized(new { message = "You are not the owner of the project" });
            

            // Check Model State
            if (!ModelState.IsValid) return BadRequest(ModelState);


            // Find Project
            var project = _dbContext.Projects.FirstOrDefault(p => p.ProjectID == projectID);
            if (project == null) return NotFound(new { message = "Project Not Found" });


            // Check If Project Already Exist
            var newuser = _dbContext.Users
                .SingleOrDefault(p => p.ProjectUsers.Any(aup =>
                    aup.User.Id == p.Id &&
                    aup.ProjectID == projectID &&
                    aup.Project.Name == formdata.Name &&
                    aup.UserRole == "owner"));
            if (newuser == null) return NotFound(new { message = "User Not Found" });

            // If the product was found
            project.Name = formdata.Name;
            project.Visibility = formdata.Visibility;
            project.Description = formdata.Description;
            project.LastUpdated = DateTime.UtcNow;
            project.Route = newuser.UserName + "/" + formdata.Name;

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
         * URL : /api/project/deleteDatasetFromNotebook
         * Param : 
         * Description: delete dataset from notebook
         */
        [Authorize]
        [HttpPut("[action]")]
        public async Task<IActionResult> DeleteDatasetFromNotebook([FromForm] int notebookID, [FromForm] int blobFileID)
        {
            try
            {
                // Find User
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { message = "Invalid user identifier." });
                }
                var user = await _dbContext.Users.SingleOrDefaultAsync(u => u.Id == userId);
                if (user == null) return NotFound(new { message = "User Not Found" });

                var notebook = _dbContext.Notebook.SingleOrDefault(n => n.NotebookID == notebookID);

                bool isOwner = await _dbContext.Projects
                    .AnyAsync(p => p.ProjectUsers.Any(aup =>
                        aup.User.Id == user.Id &&
                        aup.Project.ProjectID == notebook.ProjectID &&
                        aup.UserRole == "owner"));

                if (!isOwner) return Unauthorized(new { message = "You are not the owner of the project" });
                

                var dataset = await _dbContext.ObservableNotebookDataset
                    .FirstOrDefaultAsync(d => d.NotebookID == notebookID && d.BlobFileID == blobFileID);

                if (dataset == null)
                {
                    return NotFound(new { message = "Dataset Not Found" });
                }

                _dbContext.ObservableNotebookDataset.Remove(dataset);
                await _dbContext.SaveChangesAsync();
                return Ok(new
                {
                    result = dataset,
                    message = "Dataset deleted from the notebook successfully."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error.", error = ex.Message });
            }
        }

        /*
         * Type : PUT
         * URL : /api/project/updateuser
         * Param : ProjectUserViewModel
         * Description: Update Project
         */
        [Authorize]
        [HttpPut("[action]")]
        public async Task<IActionResult> UpdateUser([FromForm] ProjectUserVM formdata)
        {
            // Find User
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid user identifier." });
            }
            var user = await _dbContext.Users.SingleOrDefaultAsync(u => u.Id == userId);
            if (user == null) return NotFound(new { message = "User Not Found" });

            bool isOwner = await _dbContext.Projects
                .AnyAsync(p => p.ProjectUsers.Any(aup =>
                    aup.User.Id == user.Id &&
                    aup.Project.ProjectID == formdata.ProjectID &&
                    aup.UserRole == "owner"));

            if (!isOwner)   return Unauthorized(new { message = "You are not the owner of the project" });
            

            // Find Many To Many
            var userRole = await _dbContext.ProjectUsers.FindAsync(formdata.UserID, formdata.ProjectID);
            if (userRole == null) return NotFound(new { message = "User Not Found" });

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

        [Authorize]
        [HttpPut("[action]")]
        public async Task<IActionResult> RenameNotebook([FromForm] NotebookNameChangeVM notebookNameChangeVM)
        {
            // Find User
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid user identifier." });
            }
            var user = await _dbContext.Users.SingleOrDefaultAsync(u => u.Id == userId);
            if (user == null) return NotFound(new { message = "User Not Found" });

            var notebookE = await _dbContext.Notebook.FindAsync(notebookNameChangeVM.NotebookID);
            if (notebookE == null) return NotFound(new { message = "File Not Found" });

            bool isOwner = await _dbContext.Projects
               .AnyAsync(p => p.ProjectUsers.Any(aup =>
                   aup.User.Id == user.Id &&
                   aup.Project.ProjectID == notebookE.ProjectID &&
                   aup.UserRole == "owner"));

            if (!isOwner) return Unauthorized(new { message = "You are not the owner of the project" });

            Notebook notebook = await _dbContext.Notebook.FindAsync(notebookNameChangeVM.NotebookID);

            if (notebook != null)
            {
                notebook.Name = notebookNameChangeVM.NotebookName;
                _dbContext.Update(notebook);
                await _dbContext.SaveChangesAsync();
            }
            return Ok(new
            {
                notebook,
                message = "Notebook name Successfully Changed"
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
            try
            {
                // Find User
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { message = "Invalid user identifier." });
                }
                var user = await _dbContext.Users.SingleOrDefaultAsync(u => u.Id == userId);
                if (user == null) return NotFound(new { message = "User Not Found" });

                var admins = _configuration
                .GetSection("AdminUsers")
                .Get<List<string>>() ?? new List<string>();

                bool isAdmin = admins
                    .Any(u => string.Equals(u, user.UserName, StringComparison.OrdinalIgnoreCase));

                bool isOwner = await _dbContext.Projects
                   .AnyAsync(p => p.ProjectUsers.Any(aup =>
                       aup.User.Id == user.Id &&
                       aup.Project.ProjectID == projectID &&
                       aup.UserRole == "owner"));

                if (!isAdmin && !isOwner)
                    return Forbid();
                
                // Check Model State
                if (!ModelState.IsValid) return BadRequest(ModelState);

                // Find Project
                var deleteProject = await _dbContext.Projects.FindAsync(projectID);
                if (deleteProject == null) return NotFound(new { message = "Project Not Found" });

                // Remove all users that follow the project
                foreach (var newuser in deleteProject.ProjectUsers)
                {
                    _dbContext.ProjectUsers.Remove(newuser);
                }

                // Delete from Azure
                //var containerClient = _blobServiceClient.GetBlobContainerClient(deleteProject.Name.ToLower());
                // await containerClient.DeleteBlobIfExistsAsync(deleteProject.Name.ToLower());
                //containerClient.DeleteIfExists();

                // get the project by project ID
                var blobsResult = _dbContext.BlobFiles
                    .Where(p => p.ProjectID == projectID).ToList();

                // delete blobFiles
                _dbContext.BlobFiles.RemoveRange(blobsResult);

                // remove the project
                _dbContext.Projects.Remove(await _dbContext.Projects.FindAsync(projectID));

                // Save Change
                await _dbContext.SaveChangesAsync();

                // Return Ok Status
                return Ok(new
                {
                    result = deleteProject,
                    message = "Project successfully deleted."
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
         * Type : DELETE
         * URL : /api/project/removeuser/
         * Param : {projectID}/{userID}
         * Description: Delete User
         */
        [Authorize]
        [HttpDelete("[action]/{projectID}/{userID}")]
        public async Task<IActionResult> RemoveUser([FromRoute] int projectID, int userID)
        {
            // Find User
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid user identifier." });
            }
            var user = await _dbContext.Users.SingleOrDefaultAsync(u => u.Id == userId);
            if (user == null) return NotFound(new { message = "User Not Found" });


            bool isOwner = await _dbContext.Projects
               .AnyAsync(p => p.ProjectUsers.Any(aup =>
                   aup.User.Id == user.Id &&
                   aup.Project.ProjectID == projectID &&
                   aup.UserRole == "owner"));

            if (!isOwner) return Unauthorized(new { message = "You are not the owner of the project" });

            // Find Many To Many
            var projectUser = await _dbContext.ProjectUsers.FindAsync(userID, projectID);
            if (projectUser == null) return NotFound(new { message = "User Not Found" });

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
        [Authorize]
        [HttpDelete("[action]/{projectID}/{tagID}")]
        public async Task<IActionResult> RemoveTag([FromRoute] int projectID, [FromRoute] int tagID)
        {
            // Find User
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid user identifier." });
            }
            var user = await _dbContext.Users.SingleOrDefaultAsync(u => u.Id == userId);
            if (user == null) return NotFound(new { message = "User Not Found" });

            bool isOwner = await _dbContext.Projects
               .AnyAsync(p => p.ProjectUsers.Any(aup =>
                   aup.User.Id == user.Id &&
                   aup.Project.ProjectID == projectID &&
                   aup.UserRole == "owner"));

            if (!isOwner) return Unauthorized(new { message = "You are not the owner of the project" });

            // Find ProjectTag In Database
            ProjectTag projectTag = _dbContext.ProjectTags
                .Include(pt => pt.Tag)
                .SingleOrDefault(pt => pt.ProjectID == projectID && pt.TagID == tagID);
            if (projectTag == null) return NotFound(new { message = "Project Tag Not Found" });

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
                message = projectTag.Tag.Name + " tag has been removed"
            });
        }

        /*
         * Type : DELETE
         * URL : /api/project/deletefile/
         * Param : {fileID}
         * Description: Delete File From Azure Storage
         */
        [Authorize]
        [HttpDelete("[action]/{fileID}/{isMember}")]
        public async Task<IActionResult> DeleteFile([FromRoute] int fileID, [FromRoute] bool isMember)
        {
            try
            {
                // Find User
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { message = "Invalid user identifier." });
                }
                var user = await _dbContext.Users.SingleOrDefaultAsync(u => u.Id == userId);
                if (user == null) return NotFound(new { message = "User Not Found" });

                var blobFile = await _dbContext.BlobFiles.FindAsync(fileID);
                if (blobFile == null) return NotFound(new { message = "File Not Found" });

                bool isOwner = await _dbContext.Projects
                  .AnyAsync(p => p.ProjectUsers.Any(aup =>
                      aup.User.Id == user.Id &&
                      aup.Project.ProjectID == blobFile.ProjectID &&
                      aup.UserRole == "owner"));

                var admins = _configuration
                .GetSection("AdminUsers")
                .Get<List<string>>() ?? new List<string>();

                bool isAdmin = admins
                    .Any(u => string.Equals(u, user.UserName, StringComparison.OrdinalIgnoreCase));

                if (!isAdmin && !isOwner)
                    return Forbid();

                if (isMember)
                {
                    if (blobFile.Extension != ".$$")
                    {
                        var dataset = await _dbContext.ObservableNotebookDataset.FirstOrDefaultAsync(data => data.BlobFileID == blobFile.BlobFileID);
                        // Console.Write(blobFile.Uri);

                        if (dataset != null)
                        {
                            // Console.Write("deleting the dataset from observable");
                            _dbContext.ObservableNotebookDataset.Remove(dataset);
                        }
                    }

                    //await _blobService.DeleteBlobAsync(blobFile);

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
                else
                {
                    return BadRequest(new
                    {
                        error = "You do not have permission to delete this file"
                    });
                }
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

        [Authorize]
        [HttpDelete("[action]/{notebookID}/{version}/{isMember}")]
        public async Task<IActionResult> DeleteNotebook([FromRoute] int notebookID, [FromRoute] int version, [FromRoute] bool isMember)
        {
            try
            {
                // Find User
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                {
                    return Unauthorized(new { message = "Invalid user identifier." });
                }
                var user = await _dbContext.Users.SingleOrDefaultAsync(u => u.Id == userId);
                if (user == null) return NotFound(new { message = "User Not Found" });

                var notebook = await _dbContext.Notebook.FindAsync(notebookID);
                if (notebook == null) return NotFound(new { message = "File Not Found" });

                bool isOwner = await _dbContext.Projects
                  .AnyAsync(p => p.ProjectUsers.Any(aup =>
                      aup.User.Id == user.Id &&
                      aup.Project.ProjectID == notebook.ProjectID &&
                      aup.UserRole == "owner"));

                if (!isOwner) return Unauthorized(new { message = "You are not the owner of the project" });
                if (isMember)
                {
                    //await _blobService.DeleteNotebookAsync(notebook);

                    // Delete Blob Files From Database
                    //_dbContext.Notebook.Remove(notebook);

                    if (notebook.type == "observable")
                    {
                        _dbContext.Notebook.Remove(notebook);
                        await _dbContext.SaveChangesAsync();
                    }
                    else
                    {
                        var noteContent = await _dbContext.NotebookContent
                            .Where(n => n.NotebookID == notebookID && n.Version == version)
                            .FirstOrDefaultAsync();
                        if (noteContent == null) return NotFound(new { message = "Notebook Content Not Found" });

                        _dbContext.NotebookContent.Remove(noteContent);

                        // Save Change to Database
                        await _dbContext.SaveChangesAsync();

                        var notebookContents = await _dbContext.NotebookContent
                            .Where(n => n.NotebookID == notebookID)
                            .OrderByDescending(n => n.Version)
                            .FirstOrDefaultAsync();

                        if (notebookContents == null)
                        {
                            _dbContext.Notebook.Remove(notebook);
                            await _dbContext.SaveChangesAsync();
                        }
                    }

                    // Return Ok Status
                    return Ok(new
                    {
                        result = notebook,
                        message = "Notebook Successfully Deleted"
                    });
                }
                else
                {
                    return BadRequest(new
                    {
                        error = "You do not have permission to delete this notebook"
                    });
                }
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
                message = "Received Project User"
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

        [HttpGet("[action]")]
        public IActionResult GetAllDatasets()
        {
            var files = _dbContext.BlobFiles
                .Where(b => b.Extension == ".csv")
                .ToList();

            // Return Ok Status
            return Ok(new
            {
                result = files,
                message = "Datasets Received"
            });
        }

        [HttpGet("[action]/{projectID}/{directory}")]
        public IActionResult GetNotebooks([FromRoute] int projectID, [FromRoute] string directory)
        {
            string decodedDirectory = HttpUtility.UrlDecode(directory);
            var notebooks = _dbContext.Notebook
                .Include(n => n.observableNotebookDatasets)
                .Where(p => p.ProjectID == projectID && p.Directory == decodedDirectory)
                .ToList();

            return Ok(new
            {
                result = notebooks,
                message = "Project Notebooks Received"
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
                message = "Received Tag List."
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

            //var relatedDirectory = await _blobService.ListBlobsAsync(project.Name.ToLower());

            // Update Database with entry
            //_dbContext.BlobFiles.AddRange(relatedDirectory);
            //await _dbContext.SaveChangesAsync();

            // Return Ok Status
            return Ok(new
            {
                //result = relatedDirectory,
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

                // var relatedDirectory = await _blobService.ListBlobsAsync(project.Name.ToLower(), directory);

                // Return Ok Status
                return Ok(new
                {
                    directory = directory,
                    //result = relatedDirectory,
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

                //BlobClient blobClient = await _blobService.MoveBlobAsync(blobFile, filePath);
                //BlobProperties properties = blobClient.GetProperties();

                blobFile.Directory = formdata.SubDirectory;
                //blobFile.Uri = blobClient.Uri.ToString();
                //blobFile.LastModified = properties.LastModified.LocalDateTime;

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
