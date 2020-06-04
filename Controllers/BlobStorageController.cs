using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using NeuroSimHub.Data;
using NeuroSimHub.Models;
using NeuroSimHub.ViewModels;
using NeuroSimHub.ViewModels.File;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats;
using SixLabors.ImageSharp.Formats.Gif;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Formats.Png;
using SixLabors.ImageSharp.Processing;
using System;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

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

        private static IImageEncoder GetEncoder(string extension)
        {
            IImageEncoder encoder = null;

            extension = extension.Replace(".", "");

            var isSupported = Regex.IsMatch(extension, "gif|png|jpe?g", RegexOptions.IgnoreCase);

            if (isSupported)
            {
                switch (extension)
                {
                    case "png":
                        encoder = new PngEncoder();
                        break;
                    case "jpg":
                        encoder = new JpegEncoder();
                        break;
                    case "jpeg":
                        encoder = new JpegEncoder();
                        break;
                    case "gif":
                        encoder = new GifEncoder();
                        break;
                    default:
                        break;
                }
            }

            return encoder;
        }

        private static MemoryStream ResizeImage(Stream fileStream, int height, int width, string extension)
        {
            var encoder = GetEncoder(extension);
            using (var output = new MemoryStream())
            using (Image image = Image.Load(fileStream))
            {
                image.Mutate(x => x.Resize(256, 256));
                image.Save(output, encoder);
                output.Position = 0;
                return output;
            }          
        }

        #region GET REQUEST
        /*
         * Type : GET
         * URL : /api/blobstorage/download/
         * Param : {fileID}
         * Description: Download File From Azure Storage
         */
        [HttpGet("[action]/{fileID}")]
        public async Task<IActionResult> Download([FromRoute] int fileID)
        {
            try
            {
                // Connection To Storage Account
                if (CloudStorageAccount.TryParse(storageConnString, out CloudStorageAccount cloudStorageAccount))
                {

                    // Find File
                    var blobFile = await _dbContext.BlobFiles.FindAsync(fileID);
                    if (blobFile == null) return NotFound(new { message = "File Not FOund" });

                    // Create A Blob Client
                    CloudBlobClient cloudBlobClient = cloudStorageAccount.CreateCloudBlobClient();

                    // Get Container Reference
                    CloudBlobContainer cloudBlobContainer = cloudBlobClient.GetContainerReference(blobFile.Container);

                    // Get Block Blob Reference
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
                // Return Bad Request If There Is Any Error
                return BadRequest(new
                {
                    error = e
                });
            }

        }
        #endregion

        #region POST REQUEST
        /*
         * Type : POST
         * URL : /api/blobstorage/upload
         * Param : BlobUploadViewModel
         * Description: Upload File To Azure Storage
         */
        [HttpPost("[action]")]
        public async Task<IActionResult> UploadProjectFile([FromForm] FileUploadProjectViewModel formdata)
        {
            try {
                // Reture Bad Request Status
                if (formdata.File == null) return BadRequest("Null File");
                if (formdata.File.Length == 0) return BadRequest("Empty File");

                // Find User
                var user = await _dbContext.Users.FindAsync(formdata.UserID);
                if (user == null) return NotFound(new { message = "User Not Found" });

                // Find Project
                var project = await _dbContext.Projects.FindAsync(formdata.ProjectID);
                if (project == null) return NotFound(new { message = "Project Not Found" });

                var fileDirectory = project.Name + "/" + formdata.Directory + formdata.File.FileName;

                // Connection To Storage Account
                if (CloudStorageAccount.TryParse(storageConnString, out CloudStorageAccount cloudStorageAccount))
                {

                    // Create A Blob Client
                    CloudBlobClient cloudBlobClient = cloudStorageAccount.CreateCloudBlobClient();

                    // Get Container Reference
                    CloudBlobContainer cloudBlobContainer = cloudBlobClient.GetContainerReference("projects");

                    // Get Block Blob Reference
                    CloudBlockBlob cloudBlockBlob = cloudBlobContainer.GetBlockBlobReference(fileDirectory);

                    // Create Or Overwrite File
                    using (var fileStream = formdata.File.OpenReadStream())
                    {
                        await cloudBlockBlob.UploadFromStreamAsync(fileStream);
                    }

                    // Create BlobFile
                    var newBlobFile = new BlobFile
                    {
                        Container = "projects",
                        Directory = formdata.Directory,
                        Name = formdata.File.Name,
                        Extension = Path.GetExtension(formdata.File.FileName),
                        Size = (int)cloudBlockBlob.Properties.Length,
                        Uri = cloudBlockBlob.Uri.ToString(),
                        DateCreated = DateTime.Now,
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
                else
                {
                    // Return 500 Internal Error If Server Not Found
                    return StatusCode(StatusCodes.Status500InternalServerError, "Server Connection Error");
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
               
                // Connection To Storage Account
                if (CloudStorageAccount.TryParse(storageConnString, out CloudStorageAccount cloudStorageAccount))
                {

                    // Create A Blob Client
                    CloudBlobClient cloudBlobClient = cloudStorageAccount.CreateCloudBlobClient();

                    // Get Container Reference
                    CloudBlobContainer cloudBlobContainer = cloudBlobClient.GetContainerReference("profile");

                    // Get Block Blob Reference
                    CloudBlockBlob cloudBlockBlob = cloudBlobContainer.GetBlockBlobReference(filePath);

                    // Create Or Overwrite File
                    using (var fileStream = formdata.File.OpenReadStream())
                    {
                        var encoder = GetEncoder(Path.GetExtension(formdata.File.FileName));
                        using (var output = new MemoryStream())
                        using (Image image = Image.Load(fileStream))
                        {
                            image.Mutate(x => x.Resize(256, 256));
                            image.Save(output, encoder);
                            output.Position = 0;
                            await cloudBlockBlob.UploadFromStreamAsync(output);
                        }                
                    }

                    // Find User
                    var blobFile = _dbContext.BlobFiles.FirstOrDefault(x => x.Uri == cloudBlockBlob.Uri.AbsoluteUri.ToString());
                    if (blobFile != null)
                    {
                        blobFile.Extension = Path.GetExtension(formdata.File.FileName);
                        blobFile.Size = (int)cloudBlockBlob.Properties.Length;
                        blobFile.Uri = cloudBlockBlob.Uri.AbsoluteUri.ToString();
                        blobFile.DateCreated = DateTime.Now;

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
                        Size = (int)cloudBlockBlob.Properties.Length,
                        Uri = cloudBlockBlob.Uri.AbsoluteUri.ToString(),
                        DateCreated = DateTime.Now,
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
                else
                {
                    // Return 500 Internal Error If Server Not Found
                    return StatusCode(StatusCodes.Status500InternalServerError, "Server Connection Error");
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

        /*
         * Type : POST
         * URL : /api/blobstorage/move
         * Param : BlobMoveViewModel
         * Description: Move File In Azure Storage
         */
        [HttpPost("action")]
        public async Task<IActionResult> Move([FromForm] BlobMoveViewModel formdata)
        {
            try
            {
                // Connection To Storage Account
                if (CloudStorageAccount.TryParse(storageConnString, out CloudStorageAccount cloudStorageAccount))
                {
                    // Find File
                    var blobFile = await _dbContext.BlobFiles.FindAsync(formdata.FileID);
                    if (blobFile == null) return NotFound(new { message = "File Not Found" });

                    // Create A Blob Client
                    CloudBlobClient cloudBlobClient = cloudStorageAccount.CreateCloudBlobClient();

                    // Get Reference To Container
                    CloudBlobContainer cloudBlobContainer = cloudBlobClient.GetContainerReference(blobFile.Container);

                    // Get Reference To The Source Block Blob  
                    CloudBlockBlob cloudBlockBlobSource = cloudBlobContainer.GetBlockBlobReference(blobFile.Directory + blobFile.Name + blobFile.Extension);

                    // Get Reference To The Targeted Block Blob  
                    CloudBlockBlob cloudBlockBlobTarget = cloudBlobContainer.GetBlockBlobReference(formdata.SubDirectory + blobFile.Name + blobFile.Extension);

                    // Copy Source to Target
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
                // Return Bad Request If There Is Any Error
                return BadRequest(new
                {
                    error = e
                });
            }



        }
        #endregion

        #region DELETE REQUEST
        /*
         * Type : DELETE
         * URL : /api/blobstorage/delete/
         * Param : {fileID}
         * Description: Delete File From Azure Storage
         */
        [HttpDelete("[action]/{fileID}")]
        public async Task<IActionResult> Delete([FromRoute] int fileID)
        {
            try
            {
                // Connection To Storage Account
                if (CloudStorageAccount.TryParse(storageConnString, out CloudStorageAccount cloudStorageAccount))
                {

                    // Find File
                    var blobFile = await _dbContext.BlobFiles.FindAsync(fileID);
                    if (blobFile == null) return NotFound(new { message = "File Not Found" });

                    // Create A Blob Client
                    CloudBlobClient cloudBlobClient = cloudStorageAccount.CreateCloudBlobClient();

                    // Get Container Reference
                    CloudBlobContainer cloudBlobContainer = cloudBlobClient.GetContainerReference(blobFile.Container);

                    // Get Block Blob Reference
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
                        resultObject = blobFile,
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
