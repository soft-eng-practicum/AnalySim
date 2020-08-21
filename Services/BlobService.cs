using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using AnalySim.Extensions;
using AnalySim.Models;
using Microsoft.AspNetCore.Http;
using AnalySim.Helpers;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using System;
using System.Linq;

namespace AnalySim.Services
{
    public class BlobService : IBlobService
    {
        private readonly BlobServiceClient _blobServiceClient;

        public BlobService(BlobServiceClient blobServiceClient)
        {
            _blobServiceClient = blobServiceClient;
        }

        public async Task<BlobContainerClient> CreateContainer(BlobContainerClient containerClient)
        {
            // Create Container
            await containerClient.CreateIfNotExistsAsync();

            // Get File Reference
            var blobClient = containerClient.GetBlobClient("$$$.$$");

            // Upload PlaceHolder Since Empty Folder Can't Exist
            using (FileStream fs = File.OpenRead("wwwroot/$$.$$$"))
            {
                await blobClient.UploadAsync(fs);
                fs.Dispose();
            }

            // Return Container Client
            return containerClient;
        }

        public async Task<BlobDownloadInfo> GetBlobAsync(BlobFile file)
        {
            // Get Storage Container
            var containerClient = _blobServiceClient.GetBlobContainerClient(file.Container.ToLower());

            // Get File Reference
            var blobClient = containerClient.GetBlobClient(file.Directory + file.Name + file.Extension);

            // Download File
            BlobDownloadInfo blobDownloadInfo = await blobClient.DownloadAsync();

            // Return Downloaded File Info
            return blobDownloadInfo;
        }

        public async Task<List<BlobFile>> ListBlobsAsync(string container)
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(container.ToLower());
            var items = new List<BlobFile>();

            await foreach (var blobItem in containerClient.GetBlobsAsync())
            {
                var blobClient = containerClient.GetBlobClient(blobItem.Name);
                BlobProperties properties = blobClient.GetProperties();

                var blobFile = new BlobFile
                {
                    Container = container,
                    Directory = (Path.GetDirectoryName(blobItem.Name) + "/").StartsWith("/") ? "" : (Path.GetDirectoryName(blobItem.Name) + "/").Replace("\\", "/"),
                    Name = Path.GetFileNameWithoutExtension(blobItem.Name),
                    Extension = Path.GetExtension(blobItem.Name),
                    Size = (int)properties.ContentLength,
                    Uri = blobClient.Uri.ToString(),
                    DateCreated = properties.CreatedOn.LocalDateTime,
                    LastModified = properties.LastModified.LocalDateTime,
                    UserID = 1,
                    ProjectID = 1
                };


                items.Add(blobFile);

            }

            return items;
        }

        public async Task<IEnumerable<string>> ListBlobsAsync(string container, string directory)
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(container.ToLower());
            var items = new HashSet<string>();

            var directoryNum = directory.Split("/").Count();

            await foreach (var blobItem in containerClient.GetBlobsAsync())
            {
                var blobDirectoryNum = blobItem.Name.Split("/").Count();
                var totalDirectoryNum = blobDirectoryNum - directoryNum;

                if (blobItem.Name.StartsWith(directory))
                {
                    switch (totalDirectoryNum)
                    {
                        case 0:
                            items.Add(blobItem.Name);
                            break;
                        case 1:
                            var newBlobItemName = blobItem.Name.Substring(0, blobItem.Name.LastIndexOf("/")+1);
                            items.Add(newBlobItemName);
                            break;
                    }
                }
            }

            return items;
        }

        public async Task<BlobClient> CreateFolder(string container, string filePath)
        {
            // Get Storage Container
            var containerClient = _blobServiceClient.GetBlobContainerClient(container.ToLower());

            bool isExist = containerClient.Exists();
            if (!isExist)
            {
                containerClient = await CreateContainer(containerClient);
            }

            // Get File Reference
            var blobClient = containerClient.GetBlobClient(filePath);

            // Upload PlaceHolder Since Empty Folder Can't Exist
            using (FileStream fs = File.OpenRead("wwwroot/$$.$$$"))
            {
                await blobClient.UploadAsync(fs);
                fs.Dispose();
            }

            // Return Blob Client
            return blobClient;
        }

        public async Task<BlobClient> UploadFileBlobAsync(IFormFile file, string container, string filePath)
        {
            // Get Storage Container
            var containerClient = _blobServiceClient.GetBlobContainerClient(container.ToLower());

            // Create Container If Storage Doesn't Exist
            bool isExist = containerClient.Exists();
            if (!isExist)
            {
                containerClient = await CreateContainer(containerClient);
            }

            // Get File Reference
            var blobClient = containerClient.GetBlobClient(filePath);

            // Create Or Overwrite File
            using (var fileStream = file.OpenReadStream())
            {
                await blobClient.UploadAsync(fileStream, new BlobHttpHeaders { ContentType = file.Name.GetContentType() });
            }

            // Return Blob Client
            return blobClient;
        }

        public async Task<BlobClient> UploadFileBlobResizeAsync(IFormFile file, string container, string filePath, int height, int width)
        {
            // Get Storage Container
            var containerClient = _blobServiceClient.GetBlobContainerClient(container.ToLower());

            // Create Container If Storage Doesn't Exist
            bool isExist = containerClient.Exists();
            if (!isExist)
            {
                containerClient = await CreateContainer(containerClient);
            }

            // Get File Reference
            var blobClient = containerClient.GetBlobClient(filePath);

            // Create Or Overwrite File
            using (var fileStream = file.OpenReadStream())
            {
                var encoder = ImageSharpResizer.GetEncoder(Path.GetExtension(file.FileName));
                using (var output = new MemoryStream())
                using (Image image = Image.Load(fileStream))
                {
                    image.Mutate(x => x.Resize(height, width));
                    image.Save(output, encoder);
                    output.Position = 0;
                    await blobClient.UploadAsync(output, new BlobHttpHeaders { ContentType = file.Name.GetContentType() });
                }
            }

            // Return Blob Client
            return blobClient;
        }

        public async Task<BlobClient> MoveBlobAsync(BlobFile blobFile, string filePath)
        {
            // Get Storage Container
            var containerClient = _blobServiceClient.GetBlobContainerClient(blobFile.Container.ToLower());

            // Get Source File Reference
            var blobClientSource = containerClient.GetBlobClient(blobFile.Directory + blobFile.Name + blobFile.Extension);

            // Get Target File Reference
            var blobClientTarget = containerClient.GetBlobClient(filePath);

            // Copy Source To Target Reference
            await blobClientTarget.StartCopyFromUriAsync(new Uri(blobFile.Uri));

            // Delete Source Reference
            await blobClientSource.DeleteIfExistsAsync();

            // Return Target Blob Client
            return blobClientTarget;
        }

        public async Task<BlobClient> DeleteBlobAsync(BlobFile blobFile)
        {
            // Get Storage Container
            var containerClient = _blobServiceClient.GetBlobContainerClient(blobFile.Container.ToLower());

            // Get File Reference
            var blobClient = containerClient.GetBlobClient(blobFile.Directory + blobFile.Name + blobFile.Extension);

            // Delete File If Exist
            await blobClient.DeleteIfExistsAsync();

            // Return Blob Client
            return blobClient;
        }
    }
}
