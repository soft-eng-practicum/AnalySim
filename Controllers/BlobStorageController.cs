using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting.Internal;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using NeuroSimHub.Data;
using NeuroSimHub.Models;
using NeuroSimHub.ViewModels;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace NeuroSimHub.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BlobStorageController : ControllerBase
    {

        private readonly string storageConnString;
        private readonly ApplicationDbContext _dbContext;

        public BlobStorageController(IConfiguration config, ApplicationDbContext _dbContext)
        {
            storageConnString = config.GetConnectionString("AccessKey");
            this._dbContext = _dbContext;
        }

        // Post: api/blobstorage/upload
        [HttpPost("[action]")]
        [Authorize(Policy = "RequireLoggedIn")]
        public async Task<IActionResult> Upload([FromForm] UploadView formdata)
        {
            try {
                // Reture Bad Request Status
                if (formdata.File == null) return BadRequest("Null File");
                if (formdata.File.Length == 0) return BadRequest("Empty File");

                // Connection to Storage Account
                if (CloudStorageAccount.TryParse(storageConnString, out CloudStorageAccount cloudStorageAccount))
                {

                    // Create a blob client
                    CloudBlobClient cloudBlobClient = cloudStorageAccount.CreateCloudBlobClient();

                    // Get a reference to a container
                    CloudBlobContainer cloudBlobContainer = cloudBlobClient.GetContainerReference(formdata.Container);

                    // Get a reference to a block blob
                    CloudBlockBlob cloudBlockBlob = cloudBlobContainer.GetBlockBlobReference(formdata.Directory + formdata.Name + formdata.Extension);

                    // Create or overwrite the blob with the contents of a local file
                    using (var fileStream = formdata.File.OpenReadStream())
                    {
                        await cloudBlockBlob.UploadFromStreamAsync(fileStream);
                    }

                    // Find Foreign Key
                    ApplicationUser user = await _dbContext.Users.FindAsync(formdata.UserID);
                    Project project = await _dbContext.Projects.FindAsync(formdata.ProjectID);

                    // Return Not Found Status If Null
                    if (user == null || project == null) return NotFound();

                    // Create BlobFile
                    var newBlobFile = new BlobFile
                    {
                        Container = formdata.Container,
                        Directory = formdata.Directory,
                        Name = formdata.Name,
                        Extension = formdata.Extension,
                        Size = (int)cloudBlockBlob.Properties.Length,
                        Uri = cloudBlockBlob.Uri.ToString(),
                        DateCreated = DateTime.Now,
                        User = user,
                        UserID = formdata.UserID,
                        Project = project,
                        ProjectID = formdata.ProjectID  
                    };

                    // Update Database with entry
                    await _dbContext.BlobFiles.AddAsync(newBlobFile);
                    await _dbContext.SaveChangesAsync();
                
                    // Return Ok Status
                    return Ok(new
                    {
                        file = newBlobFile,
                        message = "File Successfully Uploaded"
                    });
                }
                else
                {
                    // Return 500 Internal Error If Server Not Found
                    return StatusCode(StatusCodes.Status500InternalServerError, "Server Connection Error");
                }
            }
            catch (Exception e)
            {
                return BadRequest(new { DownloadError = "Error ", exception = e });
            }

        }

        // Delete: api/blobstorage/delete/id?
        [HttpDelete("[action/{id}]")]
        [Authorize(Policy = "RequireLoggedIn")]
        public async Task<IActionResult> Delete([FromRoute]string id)
        {
            try
            {
                // Connection To Storage Account
                if (CloudStorageAccount.TryParse(storageConnString, out CloudStorageAccount cloudStorageAccount))
                {

                    // Find Project
                    var blobFile = await _dbContext.BlobFiles.FindAsync(id);

                    // Return Not Found Status Code If Not Found
                    if (blobFile == null) return NotFound();

                    // Create A Blob Client
                    CloudBlobClient cloudBlobClient = cloudStorageAccount.CreateCloudBlobClient();

                    // Get Reference To Container
                    CloudBlobContainer cloudBlobContainer = cloudBlobClient.GetContainerReference(blobFile.Container);

                    // Get A Reference To A Block Blob  
                    CloudBlockBlob cloudBlockBlob = cloudBlobContainer.GetBlockBlobReference(blobFile.Directory + blobFile.Name + blobFile.Extension);

                    // Delete Blob From Container
                    await cloudBlockBlob.DeleteIfExistsAsync();

                    // Delete Blob Files From Database
                    _dbContext.BlobFiles.Remove(blobFile);

                    // Save Change to Database
                    await _dbContext.SaveChangesAsync();

                    // Return Ok Status
                    return Ok(new
                    {
                        container = cloudBlockBlob.Container,
                        name = cloudBlockBlob.Name,
                        type = cloudBlockBlob.Properties.ContentType,
                        size = cloudBlockBlob.Properties.Length,
                        uri = cloudBlockBlob.Uri,
                        message = "File Successfully Deleted"
                    });
                }
                else
                {
                    // Return 500 Internal Error If Server Not Found
                    return StatusCode(StatusCodes.Status500InternalServerError, "Server Connection Error");
                }

            }
            catch (Exception e)
            {
                return BadRequest(new { DownloadError = "Error ", exception = e });
            }

        }

        // Get: api/blobstorage/Download
        [HttpGet("[action/{id}]")]
        [Authorize(Policy = "RequireLoggedIn")]
        public async Task<IActionResult> Download([FromRoute] int id)
        {
            try
            {
                // Connection To Storage Account
                if (CloudStorageAccount.TryParse(storageConnString, out CloudStorageAccount cloudStorageAccount))
                {
                    // Find Project
                    var blobFile = await _dbContext.BlobFiles.FindAsync(id);

                    // Return Not Found Status Code If Not Found
                    if (blobFile == null) return NotFound();

                    // Create A Blob Client
                    CloudBlobClient cloudBlobClient = cloudStorageAccount.CreateCloudBlobClient();

                    // Get Reference To Container
                    CloudBlobContainer cloudBlobContainer = cloudBlobClient.GetContainerReference(blobFile.Container);

                    // Get A Reference To A Block Blob  
                    CloudBlockBlob cloudBlockBlob = cloudBlobContainer.GetBlockBlobReference(blobFile.Directory + blobFile.Name + blobFile.Extension);

                    // Download File to User Download Folder
                    string user = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
                    string download = Path.Combine(user, "Downloads", blobFile.Name + blobFile.Extension);

                    // Write File to Download
                    using (var fileStream = System.IO.File.OpenWrite(download))
                    {
                        // Download From Cloud Block
                        await cloudBlockBlob.DownloadToStreamAsync(fileStream);

                        // Return Ok Status
                        return Ok(new
                        {
                            container = cloudBlockBlob.Container,
                            name = cloudBlockBlob.Name,
                            type = cloudBlockBlob.Properties.ContentType,
                            size = cloudBlockBlob.Properties.Length,
                            uri = cloudBlockBlob.Uri,
                            message = "File Successfully Downloaded"
                        });
                    }
                }
                else
                {
                    // Return 500 Internal Error If Server Not Found
                    return StatusCode(StatusCodes.Status500InternalServerError, "Server Connection Error");
                }
            }
            catch (Exception e)
            {
                return BadRequest(new { DownloadError = "Error ", exception = e });
            }

        }

        // Post: api/blobstorage/move
        [HttpPost("action")]
        public async Task<IActionResult> Move([FromForm] MoveView formdata)
        {
            try
            {
                // Connection To Storage Account
                if (CloudStorageAccount.TryParse(storageConnString, out CloudStorageAccount cloudStorageAccount))
                {
                    // Find Project
                    var blobFile = await _dbContext.BlobFiles.FindAsync(formdata.FileID);

                    // Return Not Found Status Code If Not Found
                    if (blobFile == null) return NotFound();


                    // Create A Blob Client
                    CloudBlobClient cloudBlobClient = cloudStorageAccount.CreateCloudBlobClient();

                    // Get Reference To Container
                    CloudBlobContainer cloudBlobContainer = cloudBlobClient.GetContainerReference(blobFile.Container);

                    // Get A Reference To The Source Block Blob  
                    CloudBlockBlob cloudBlockBlobSource = cloudBlobContainer.GetBlockBlobReference(blobFile.Directory + blobFile.Name + blobFile.Extension);

                    // Get A Reference To The Targeted Block Blob  
                    CloudBlockBlob cloudBlockBlobTarget = cloudBlobContainer.GetBlockBlobReference(formdata.SubDirectory + blobFile.Name + blobFile.Extension);

                    //Copy Source to Target
                    await cloudBlockBlobTarget.StartCopyAsync(cloudBlockBlobSource);
                
                    // Delete Source
                    await cloudBlockBlobSource.DeleteAsync();

                    // Return Ok Status
                    return Ok(new
                    {
                        file = cloudBlockBlobTarget.Name,
                        message = "File Successfully Moved"
                    });

                }
                else
                {
                    // Return 500 Internal Error If Server Not Found
                    return StatusCode(StatusCodes.Status500InternalServerError, "Server Connection Error");
                }

            }
            catch (Exception e)
            {
                return BadRequest(new { DownloadError = "Error ", exception = e });
            }



        }

    }
}
