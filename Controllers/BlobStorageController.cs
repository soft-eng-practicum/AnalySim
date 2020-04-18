using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting.Internal;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using NeuroSimHub.Models;

// For more information on enabling MVC for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace NeuroSimHub.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BlobStorageController : ControllerBase
    {

        private readonly string storageConnString;

        public BlobStorageController(IConfiguration config)
        {
            storageConnString = config.GetConnectionString("AccessKey");
        }

        // Post: api/blobstorage/uploadfile
        [HttpPost("[action]")]
        public async Task<IActionResult> UploadFile([FromForm(Name = "Blob")]IFormFile files, string containerName, string directory = "")
        {
            try {
                if (files == null) return BadRequest("Null File");
                if (files.Length == 0)
                {
                    return BadRequest("Empty File");
                }

                //Connection to Storage Account
                CloudStorageAccount cloudStorageAccount = CloudStorageAccount.Parse(storageConnString);

                // Create a blob client
                CloudBlobClient cloudBlobClient = cloudStorageAccount.CreateCloudBlobClient();

                // Get a reference to a container
                CloudBlobContainer cloudBlobContainer = cloudBlobClient.GetContainerReference("temp");

                // Get a reference to a block blob
                CloudBlockBlob cloudBlockBlob = cloudBlobContainer.GetBlockBlobReference(directory + files.FileName);

                // Create or overwrite the blob with the contents of a local file
                using (var fileStream = files.OpenReadStream())
                {
                    await cloudBlockBlob.UploadFromStreamAsync(fileStream);
                }

                return Ok(new
                {
                    container = cloudBlockBlob.Container.Name,
                    name = cloudBlockBlob.Name,
                    type = cloudBlockBlob.Properties.ContentType,
                    size = cloudBlockBlob.Properties.Length,
                    uri = cloudBlockBlob.Uri
                });
            }
            catch (Exception e)
            {
                System.Diagnostics.Debug.WriteLine(e);
                return BadRequest(new { DownloadError = "Error when trying to download file", exception = e });
            }

        }

        // Delete: api/blobstorage/deletefile
        [HttpDelete("[action]")]
        public async Task<IActionResult> DeleteFile(string fileName, string containerName)
        {
            try
            {
                //Connection to Storage Account
                CloudStorageAccount cloudStorageAccount = CloudStorageAccount.Parse(storageConnString);

                //Create a blob client
                CloudBlobClient cloudBlobClient = cloudStorageAccount.CreateCloudBlobClient();

                //Get reference to container
                CloudBlobContainer cloudBlobContainer = cloudBlobClient.GetContainerReference(containerName);

                // get block blob refarence    
                CloudBlockBlob cloudBlockBlob = cloudBlobContainer.GetBlockBlobReference(fileName);

                // Delete Blob from container
                await cloudBlockBlob.DeleteIfExistsAsync();

                return Ok(new
                {
                    container = cloudBlockBlob.Container,
                    name = cloudBlockBlob.Name,
                    type = cloudBlockBlob.Properties.ContentType,
                    size = cloudBlockBlob.Properties.Length,
                    uri = cloudBlockBlob.Uri
                });
            }
            catch (Exception e)
            {
                return BadRequest(new { DownloadError = "Error when trying to download file", exception = e });
            }

        }

        // Get: api/blobstorage/DownloadFile
        [HttpGet("action")]
        public async Task<IActionResult> DownloadFile(string fileName, string containerName)
        {
            try
            {
                //Connection to Storage Account
                CloudStorageAccount cloudStorageAccount = CloudStorageAccount.Parse(storageConnString);

                //Create a blob client
                CloudBlobClient cloudBlobClient = cloudStorageAccount.CreateCloudBlobClient();

                //Get reference to container
                CloudBlobContainer cloudBlobContainer = cloudBlobClient.GetContainerReference(containerName);

                // get block blob refarence    
                CloudBlockBlob cloudBlockBlob = cloudBlobContainer.GetBlockBlobReference(fileName);

                string user = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
                string download = Path.Combine(user, "Downloads", fileName);


                using (var fileStream = System.IO.File.OpenWrite(download))
                {
                    await cloudBlockBlob.DownloadToStreamAsync(fileStream);
                    return Ok(new
                    {
                        container = cloudBlockBlob.Container,
                        name = cloudBlockBlob.Name,
                        type = cloudBlockBlob.Properties.ContentType,
                        size = cloudBlockBlob.Properties.Length,
                        uri = cloudBlockBlob.Uri
                    });
                }
            }
            catch (Exception e)
            {
                return BadRequest(new { DownloadError = "Error when trying to download file", exception = e });
            }

        }

        // Post: api/blobstorage/transferfile
        [HttpPost("action")]
        public async Task<IActionResult> TransferFile(string fileName, string containerNameSource, string containerNameTarget)
        {
            try
            {
                //Connection to Storage Account
                CloudStorageAccount cloudStorageAccount = CloudStorageAccount.Parse(storageConnString);

                //Create a blob client
                CloudBlobClient cloudBlobClient = cloudStorageAccount.CreateCloudBlobClient();

                //Get reference to container
                CloudBlobContainer cloudBlobContainerSource = cloudBlobClient.GetContainerReference(containerNameSource);

                //Get reference to container
                CloudBlobContainer cloudBlobContainerTarget = cloudBlobClient.GetContainerReference(containerNameTarget);


                CloudBlockBlob cloudBlockBlobSource = cloudBlobContainerSource.GetBlockBlobReference(fileName);
                CloudBlockBlob cloudBlockBlobTarget = cloudBlobContainerTarget.GetBlockBlobReference(fileName);

                //Copy Source to Target
                await cloudBlockBlobTarget.StartCopyAsync(cloudBlockBlobSource);
                
                // Delete Source
                await cloudBlockBlobSource.DeleteAsync();

                return Ok(new
                {
                    source_container = cloudBlockBlobSource.Container,
                    target_container = cloudBlockBlobTarget.Container,
                    name = cloudBlockBlobTarget.Name,
                    type = cloudBlockBlobTarget.Properties.ContentType,
                    size = cloudBlockBlobTarget.Properties.Length,
                    uri = cloudBlockBlobTarget.Uri
                });

            }
            catch (Exception e)
            {
                return BadRequest(new { DownloadError = "Error ", exception = e });
            }



        }

    }
}
