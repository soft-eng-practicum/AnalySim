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

namespace Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProjectController : ControllerBase
    {

        private readonly ApplicationDbContext _dbContext;
        private readonly IBlobService _blobService;
        private readonly BlobServiceClient _blobServiceClient;
        private readonly IConfiguration _configuration;

        public ProjectController(ApplicationDbContext dbContext, IBlobService blobService,
                                 BlobServiceClient blobServiceClient, IConfiguration configuration)
        {
            _dbContext = dbContext;
            _blobService = blobService;
            _blobServiceClient = blobServiceClient;
            _configuration = configuration;
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
                .Include(p => p.ProjectUsers).ThenInclude(pu => pu.User)
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
         * Description: Download file from Azure Storage
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

        [HttpGet("[action]/{notebookID}")]
        public async Task<IActionResult> DownloadNotebook([FromRoute] int notebookID)
        {
            try
            {

                // Find Project
                var notebook = await _dbContext.Notebook.FindAsync(notebookID);
                if (notebook == null) return NotFound();

                BlobDownloadInfo data = await _blobService.GetNotebookAsync(notebook);

                return File(data.Content, data.ContentType, notebook.Name + notebook.Extension);
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
                    message="Notebook Retrieved",
                    notebook
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
        [HttpPost("[action]")]
        public async Task<IActionResult> ForkProject([FromForm] ProjectForkVM formdata)
        {
            // Find User
            var user = await _dbContext.Users.FindAsync(formdata.UserID);
            if (user == null) return NotFound(new { message = "User Not Found" });

            // Find Project
            var project = await _dbContext.Projects.FindAsync(formdata.ProjectID);
            if (project == null) return NotFound(new { message = "Project Not Found" });

            // Check If Project Already Exist
            var checkProject = _dbContext.Projects
                .SingleOrDefault(p => p.ProjectUsers.Any(aup =>
                    aup.User.Id == formdata.UserID &&
                    aup.Project.Name == project.Name &&
                    aup.UserRole == "owner"));

            // If Conflict If Project Found
            if (checkProject != null) return Conflict(new { message = "Project Already Exist" });

            // Create Project
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

            // Add BlobFiles 
            for (int i = 0; i < formdata.BlobFilesID.Length; i++)
            {
                // Find File
                var file = await _dbContext.BlobFiles.FindAsync(formdata.BlobFilesID[i]);

                // Create new file
                await _dbContext.BlobFiles.AddAsync(
                 new BlobFile
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
                 }
                 );

                //Save Change
                await _dbContext.SaveChangesAsync();
            }

            // Return Ok Request
            return Ok(new
            {
                result = newProject,
                message = "Project Successfully Forked"
            });

        }

        /*
        * Type : POST
        * URL : /api/project/forkprojectwithoutblob
        * Param : ProjectViewModel
        * Description: Fork Project Without Blob
        */
        [HttpPost("[action]")]
        public async Task<IActionResult> ForkProjectWithoutBlob([FromForm] ProjectForkVM formdata)
        {
            // Find User
            var user = await _dbContext.Users.FindAsync(formdata.UserID);
            if (user == null) return NotFound(new { message = "User Not Found" });

            // Find Project
            var project = await _dbContext.Projects.FindAsync(formdata.ProjectID);
            if (project == null) return NotFound(new { message = "Project Not Found" });

            // Check If Project Already Exist
            var checkProject = _dbContext.Projects
                .SingleOrDefault(p => p.ProjectUsers.Any(aup =>
                    aup.User.Id == formdata.UserID &&
                    aup.Project.Name == project.Name &&
                    aup.UserRole == "owner"));

            // If Conflict If Project Found
            if (checkProject != null) return Conflict(new { message = "Project Already Exist" });

            // Create Project
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

            // Return Ok Request
            return Ok(new
            {
                result = newProject,
                message = "Project Successfully Forked"
            });

        }

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
         * Description: Upload file to Azure Storage
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

                // Check quota (TODO: check if conf file has field and give proper error)
                var maxsize = int.Parse(_configuration["UserQuota"]);
                var totalsize = await _dbContext.BlobFiles
                    .Where(b => b.UserID == user.Id)
                    .SumAsync(b => b.Size);
                if (totalsize + formdata.File.Length > maxsize)
                    return BadRequest($"Exceeds total user quota of {(maxsize / 1e6).ToString()} MB.");
                
                // Set File Path
                var filePath = formdata.Directory + formdata.File.FileName;

                System.Diagnostics.Debug.WriteLine($"filePath: {filePath}");

                // Upload Blob File
                BlobClient blobClient = await _blobService.UploadFileBlobAsync(formdata.File, project.Name.ToLower(), filePath);
                System.Diagnostics.Debug.WriteLine($"after upload test");
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
        [HttpPost("[action]")]
        public async Task<IActionResult> UploadNotebook([FromForm] ProjectNotebookUploadVM noteBookData)
        {

            try{

                // Find Project
                var project = await _dbContext.Projects.FindAsync(noteBookData.ProjectID);
                if (project == null) return NotFound(new { message = "Project Not Found" });

            

                Notebook newNotebook = null;

                var filePath = noteBookData.Directory + noteBookData.NotebookName+ Path.GetExtension(noteBookData.NotebookFile.FileName);

                System.Diagnostics.Debug.WriteLine($"filePath: {filePath}");

                // Upload Blob File

                BlobClient blobClient = await _blobService.UploadFileBlobAsync(noteBookData.NotebookFile, "notebook-"+project.Name.ToLower(), filePath);
                System.Diagnostics.Debug.WriteLine($"after upload test");
                BlobProperties properties = blobClient.GetProperties();

                newNotebook = new Notebook
                {
                    Container = blobClient.BlobContainerName,
                    Name = Path.GetFileNameWithoutExtension(noteBookData.NotebookName),
                    Directory = noteBookData.Directory,
                    Extension = Path.GetExtension(noteBookData.NotebookFile.FileName),
                    Size = (int)properties.ContentLength,
                    Uri = blobClient.Uri.ToString(),
                    DateCreated = properties.CreatedOn.UtcDateTime,
                    LastModified = properties.LastModified.UtcDateTime,
                    ProjectID = noteBookData.ProjectID,
                    type = "new"
                };
                await _dbContext.Notebook.AddAsync(newNotebook);


                await _dbContext.SaveChangesAsync();

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

        static string GrabId(string line)
        {
            System.Text.RegularExpressions.Match match = System.Text.RegularExpressions.Regex.Match(line, @"(\w|-){26,}");
            return match.Value;
        }

        [HttpPost("[action]")]
        public async Task<IActionResult> UploadExistingNotebook([FromForm]  ExistingProjectUploadVM noteBookData)
        {
            try
            {
                var project = await _dbContext.Projects.FindAsync(noteBookData.ProjectID);
                if (project == null) return NotFound(new { message = "Project Not Found" });

                Notebook newNotebook;

                string notebookUrl = noteBookData.NotebookURL;
                if (noteBookData.Type == "collab")
                {
                    string fileId = GrabId(notebookUrl);
                    Console.WriteLine(fileId);
                    string url = $"https://docs.google.com/uc?export=download&id={fileId}";
                    string fileName = noteBookData.NotebookName+".ipynb";
                    using (HttpClient client = new HttpClient())
                    {
                        HttpResponseMessage response = await client.GetAsync(url);
                        response.EnsureSuccessStatusCode();

                        using (HttpContent content = response.Content)
                        {
                            byte[] data = await content.ReadAsByteArrayAsync();
                            System.IO.File.WriteAllBytes(fileName, data);
                        }
                    }

                    Console.WriteLine(fileName);
                    var containerClient = _blobServiceClient.GetBlobContainerClient("notebook-" + project.Name.ToLower());
                    Console.WriteLine(project.Name);

                    // Create Container If Storage Doesn't Exist
                    bool isExist = containerClient.Exists();
                    if (!isExist)
                    {
                        containerClient = await _blobService.CreateContainer(containerClient);
                    }
                    BlobClient blob = containerClient.GetBlobClient(noteBookData.Directory + fileName);
                    using (FileStream fileStream = new FileStream(fileName, FileMode.Open, FileAccess.Read))
                    {
                        containerClient.UploadBlob(noteBookData.Directory + fileName, fileStream);
                    }

                    BlobProperties properties = blob.GetProperties();
                    newNotebook = new Notebook
                    {
                        Container = blob.BlobContainerName,
                        Directory = noteBookData.Directory,
                        Name = Path.GetFileNameWithoutExtension(noteBookData.NotebookName),
                        Extension = Path.GetExtension(fileName),
                        Size = (int)properties.ContentLength,
                        Uri = blob.Uri.ToString(),
                        DateCreated = properties.CreatedOn.UtcDateTime,
                        LastModified = properties.LastModified.UtcDateTime,
                        ProjectID = noteBookData.ProjectID,
                        type = "collab"
                    };

                    Console.WriteLine(blob.Uri.ToString());

                    string ExitingFile = Path.Combine("", fileName);
                    //System.IO.File.Delete(ExitingFile);
                }
                else if (noteBookData.Type == "observablehq")
                {
                    Console.WriteLine(noteBookData.observableNotebookDatasets);
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
                        observableNotebookDatasets = observableNotebookDatasets
                    };

                }
                else if (noteBookData.Type == "jupyter")
                {
                    string fileName = noteBookData.Directory + $"{noteBookData.NotebookName}.ipynb";
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
                        type = "jupyter"
                    };

                }
                else
                {
                    return BadRequest("Nonacceptable type of notebook");
                }

                await _dbContext.Notebook.AddAsync(newNotebook);
                await _dbContext.SaveChangesAsync();

                return Ok(new
                {
                    result = newNotebook,
                    message = "Notebook Uploaded Succesfully"
                });
            }
            catch(Exception e)
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

        [HttpPost("[action]")]
        public async Task<IActionResult> CreateNotebookFolder([FromForm] FolderUploadProfileViewModel formdata)
        {
            try
            {
                if (formdata.Directory == null) { formdata.Directory = ""; }

                // Find Project
                var project = await _dbContext.Projects.FindAsync(formdata.ProjectID);
                if (project == null) return NotFound(new { message = "Project Not Found" });

                var filePath = formdata.Directory + "/"+ formdata.folderName + ".$$";
                BlobClient blobClient = await _blobService.CreateFolder("notebook-"+project.Name.ToLower(), filePath);
                BlobProperties properties = blobClient.GetProperties();

                // Create BlobFile
                var newNotebook = new Notebook
                {
                    Container = blobClient.BlobContainerName,
                    Directory = formdata.Directory,
                    Name = formdata.folderName,
                    Extension = ".$$",
                    Size = (int)properties.ContentLength,
                    Uri = blobClient.Uri.ToString(),
                    DateCreated = properties.CreatedOn.UtcDateTime,
                    LastModified = properties.LastModified.UtcDateTime,
                    ProjectID = formdata.ProjectID,
                    type= "folder"
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
        #endregion

        #region PUT REQUEST
        /*
         * Type : PUT
         * URL : /api/project/updateproject/
         * Param : {projectID}, ProjectViewModel
         * Description: Update Project
         */
        [HttpPut("[action]/{projectID}")]
        public async Task<IActionResult> UpdateProject([FromRoute] int projectID, [FromForm] ProjectVM formdata)
        {
            // Check Model State
            if (!ModelState.IsValid) return BadRequest(ModelState);


            // Find Project
            var project = _dbContext.Projects.FirstOrDefault(p => p.ProjectID == projectID);
            if (project == null) return NotFound(new { message = "Project Not Found" });


            // Check If Project Already Exist
            var user = _dbContext.Users
                .SingleOrDefault(p => p.ProjectUsers.Any(aup =>
                    aup.User.Id == p.Id &&
                    aup.ProjectID == projectID &&
                    aup.Project.Name == formdata.Name &&
                    aup.UserRole == "owner"));
            if (user == null) return NotFound(new { message = "User Not Found" });

            // If the product was found
            project.Name = formdata.Name;
            project.Visibility = formdata.Visibility;
            project.Description = formdata.Description;
            project.LastUpdated = DateTime.UtcNow;
            project.Route = user.UserName + "/" + formdata.Name;

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

        [HttpPut("[action]")]
        public async Task<IActionResult> RenameNotebook([FromForm] NotebookNameChangeVM notebookNameChangeVM)
        {
            Notebook? notebook = await _dbContext.Notebook.FindAsync(notebookNameChangeVM.NotebookID);

            if(notebook!=null)
            {
                notebook.Name = notebookNameChangeVM.NotebookName;
                _dbContext.Update(notebook);
                await _dbContext.SaveChangesAsync();
            }
            return Ok(new { 
                notebook ,
                message = "Notebook name Succesfully Changed"
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
            if (deleteProject == null) return NotFound(new { message = "Project Not Found" });

            // Remove all users that follow the project
            foreach (var user in deleteProject.ProjectUsers)
            {
                _dbContext.ProjectUsers.Remove(user);
            }

            // Delete from Azure
            var containerClient = _blobServiceClient.GetBlobContainerClient(deleteProject.Name.ToLower());
            // await containerClient.DeleteBlobIfExistsAsync(deleteProject.Name.ToLower());
            containerClient.DeleteIfExists();

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
        [HttpDelete("[action]/{projectID}/{tagID}")]
        public async Task<IActionResult> RemoveTag([FromRoute] int projectID, [FromRoute] int tagID)
        {
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

        [HttpDelete("[action]/{notebookID}")]
        public async Task<IActionResult> DeleteNotebook([FromRoute] int notebookID)
        {
            try
            {
                // Find File
                var notebook = await _dbContext.Notebook.FindAsync(notebookID);
                if (notebook == null) return NotFound(new { message = "Notebook Not Found" });

                await _blobService.DeleteNotebookAsync(notebook);

                // Delete Blob Files From Database
                _dbContext.Notebook.Remove(notebook);

                // Save Change to Database
                await _dbContext.SaveChangesAsync();

                // Return Ok Status
                return Ok(new
                {
                    result = notebook,
                    message = "Notebook Successfully Deleted"
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

        [HttpGet("[action]/{projectID}/{directory}")]
        public IActionResult GetNotebooks([FromRoute] int projectID, [FromRoute] string directory)
        {
            string decodedDirectory = HttpUtility.UrlDecode(directory);
            var notebooks = _dbContext.Notebook.Include(notebook=>notebook.observableNotebookDatasets).ToList().Where(p => p.ProjectID == projectID && p.Directory == decodedDirectory);
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
