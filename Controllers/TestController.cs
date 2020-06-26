using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.AspNetCore.Mvc;
using NeuroSimHub.Data;
using NeuroSimHub.Models;
using NeuroSimHub.Services;
using NeuroSimHub.ViewModels;

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

        #region POST REQUEST
        /*
         * Type : POST
         * URL : /api/test/upload
         * Param : BlobUploadViewModel
         * Description: Upload File To Azure Storage
         */
        [HttpPost("[action]")]
        public async Task<IActionResult> Upload([FromForm] FileUploadProjectViewModel formdata)
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

                var filePath = project.Name + "/" + formdata.Directory + formdata.File.FileName;

                BlobClient blobClient = await _blobService.UploadFileBlobAsync(formdata.File, filePath, "projects");
                BlobProperties properties = blobClient.GetProperties();

                // Create BlobFile
                var newBlobFile = new BlobFile
                {
                    Container = "projects",
                    Directory = formdata.Directory,
                    Name = formdata.File.Name,
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
    }
    #endregion
}