using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NeuroSimHub.Data;
using NeuroSimHub.Models;
using NeuroSimHub.Services;
using NeuroSimHub.ViewModels;
using NeuroSimHub.ViewModels.File;

namespace AnalySim.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TestController : ControllerBase
    {
        private readonly IBlobService _blobService;
        private readonly ApplicationDbContext _dbContext;

        public TestController(ApplicationDbContext dbContext, IBlobService blobService)
        {
            _dbContext = dbContext;
            _blobService = blobService;
        }

        #region GET REQUEST
        [HttpGet("[action]")]
        public async Task<IActionResult> AuditFile() {
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
                resultObject = relatedDirectory,
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
                if (directory == null || directory == "/") {
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
                    resultObject = relatedDirectory,
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
                if (blobFile == null) return NotFound(new { message = "BlobFile Not Found" });

                var data = await _blobService.GetBlobAsync(blobFile);

                return File(data.Content, data.ContentType);
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
         * URL : /api/blobstorage/uploadprofileimage
         * Param : BlobUploadViewModel
         * Description: Upload File To Azure Storage
         */
        [HttpPost("[action]")]
        public async Task<IActionResult> UploadProfileImage([FromForm] FileUploadProfileViewModel formdata)
        {
            try
            {
                // Reture Bad Request Status
                if (formdata.File == null) return BadRequest("Null File");
                if (formdata.File.Length == 0) return BadRequest("Empty File");

                // Find User
                var user = await _dbContext.Users.FindAsync(formdata.UserID);
                if (user == null) return NotFound(new { message = "User Not Found" });

                //Create File Path With File
                var filePath = user.UserName + "/profileImage" + Path.GetExtension(formdata.File.FileName);

                BlobClient blobClient = await _blobService.UploadFileBlobResizeAsync(formdata.File, filePath, "profile", 250, 250);
                BlobProperties blobProperties = blobClient.GetProperties();

                // Check For Existing
                var blobFile = _dbContext.BlobFiles.FirstOrDefault(x => x.Uri == blobClient.Uri.AbsoluteUri.ToString());
                if (blobFile != null)
                {
                    blobFile.Extension = Path.GetExtension(formdata.File.FileName);
                    blobFile.Size = (int)blobProperties.ContentLength;
                    blobFile.Uri = blobClient.Uri.AbsoluteUri.ToString();
                    blobFile.DateCreated = blobProperties.CreatedOn.DateTime;

                    // Set Entity State
                    _dbContext.Entry(blobFile).State = EntityState.Modified;

                    await _dbContext.SaveChangesAsync();

                    return Ok(new { resultObject = blobFile, message = "Profile Image Updated" });
                }

                // Create BlobFile
                var newBlobFile = new BlobFile
                {
                    Container = "profile",
                    Directory = user.UserName + "/",
                    Name = "profileImage",
                    Extension = Path.GetExtension(formdata.File.FileName),
                    Size = (int)blobProperties.ContentLength,
                    Uri = blobClient.Uri.AbsoluteUri.ToString(),
                    DateCreated = blobProperties.CreatedOn.DateTime,
                    UserID = formdata.UserID
                };

                // Update Database with entry
                await _dbContext.BlobFiles.AddAsync(newBlobFile);
                await _dbContext.SaveChangesAsync();

                // Return Ok Status
                return Ok(new
                {
                    resultObject = newBlobFile,
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
         * URL : /api/test/createfolder
         * Param : BlobUploadViewModel
         * Description: Upload File To Azure Storage
         */
        [HttpPost("[action]")]
        public async Task<IActionResult> CreateFolder([FromForm] FileUploadProjectViewModel formdata)
        {
            try
            {

                // Find User
                var user = await _dbContext.Users.FindAsync(formdata.UserID);
                if (user == null) return NotFound(new { message = "User Not Found" });

                // Find Project
                var project = await _dbContext.Projects.FindAsync(formdata.ProjectID);
                if (project == null) return NotFound(new { message = "Project Not Found" });

                var filePath = formdata.Directory + "$$$.$$";
                BlobClient blobClient = await _blobService.CreateFolder(project.Name.ToLower(), filePath);

                // Return Ok Status
                return Ok(new
                {
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
         * URL : /api/test/uploadfile
         * Param : BlobUploadViewModel
         * Description: Upload Folder To Azure Storage
         */
        [HttpPost("[action]")]
        public async Task<IActionResult> UploadFile([FromForm] FileUploadProjectViewModel formdata)
        {
            try
            {
                // Reture Bad Request Status
                if (formdata.File == null) return BadRequest("Null File");
                if (formdata.File.Length == 0) return BadRequest("Empty File");

                // Find User
                var user = await _dbContext.Users.FindAsync(formdata.UserID);
                if (user == null) return NotFound(new { message = "User Not Found" });

                // Find Project
                var project = await _dbContext.Projects.FindAsync(formdata.ProjectID);
                if (project == null) return NotFound(new { message = "Project Not Found" });

                var filePath = formdata.Directory + formdata.File.FileName;

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
                    DateCreated = properties.CreatedOn.DateTime,
                    UserID = formdata.UserID,
                    ProjectID = formdata.ProjectID
                };

                // Update Database with entry
                await _dbContext.BlobFiles.AddAsync(newBlobFile);
                await _dbContext.SaveChangesAsync();

                // Return Ok Status
                return Ok(new
                {
                    resultObject = newBlobFile,
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
        public async Task<IActionResult> MoveFile([FromForm] BlobMoveViewModel formdata)
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

                // Set Entity State
                _dbContext.Entry(blobFile).State = EntityState.Modified;

                // Update Database with entry
                await _dbContext.SaveChangesAsync();

                // Return Ok Status
                return Ok(new
                {
                    resultObject = blobFile,
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

        /*
         * Type : DELETE
         * URL : /api/test/delete/
         * Param : {fileID}
         * Description: Delete File From Azure Storage
         */
        [HttpDelete("[action]/{fileID}")]
        public async Task<IActionResult> Delete([FromRoute] int fileID)
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
                    resultObject = blobFile,
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
    }
    #endregion
}