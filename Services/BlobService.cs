using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using AnalySim.Extensions;
using BlobInfo = AnalySim.Models.BlobInfo;
using NeuroSimHub.Models;
using Microsoft.AspNetCore.Http;
using AnalySim.Helpers;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using System;
using System.Linq;
using System.Reflection.Metadata;

namespace NeuroSimHub.Services
{
    public class BlobService : IBlobService
    {
        private readonly BlobServiceClient _blobServiceClient;

        public BlobService(BlobServiceClient blobServiceClient)
        {
            _blobServiceClient = blobServiceClient;
        }

        public async Task<BlobInfo> GetBlobAsync(BlobFile file)
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(file.Container.ToLower());
            var blobClient = containerClient.GetBlobClient(file.Directory + file.Name + file.Extension);
            var blobDownloadInfo = await blobClient.DownloadAsync();
            return new BlobInfo(blobDownloadInfo.Value.Content, blobDownloadInfo.Value.ContentType);
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
                    Directory = (Path.GetDirectoryName(blobItem.Name) + "/").Replace("\\", "/"),
                    Name = Path.GetFileNameWithoutExtension(blobItem.Name),
                    Extension = Path.GetExtension(blobItem.Name),
                    Size = (int)properties.ContentLength,
                    Uri = blobClient.Uri.ToString(),
                    DateCreated = properties.CreatedOn.DateTime,
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
            var containerClient = _blobServiceClient.GetBlobContainerClient(container.ToLower());
            containerClient.CreateIfNotExists();

            var blobClient = containerClient.GetBlobClient(filePath);

            using (FileStream fs = File.Create("$$.$$$"))
            {
                await blobClient.UploadAsync(fs);
                fs.Dispose();
            }

            File.Delete("$$.$$$");

            return blobClient;
        }

        public async Task<BlobClient> UploadFileBlobAsync(IFormFile file, string container, string filePath)
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(container.ToLower());
            containerClient.CreateIfNotExists();

            var blobClient = containerClient.GetBlobClient(filePath);

            // Create Or Overwrite File
            using (var fileStream = file.OpenReadStream())
            {
                await blobClient.UploadAsync(fileStream, new BlobHttpHeaders { ContentType = file.Name.GetContentType() });
            }

            return blobClient;
        }

        public async Task<BlobClient> UploadFileBlobResizeAsync(IFormFile file, string container, string filePath, int height, int width)
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(container.ToLower());
            containerClient.CreateIfNotExists();

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

            return blobClient;
        }

        public async Task<BlobClient> MoveBlobAsync(BlobFile blobFile, string filePathTarget)
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(blobFile.Container.ToLower());
            var blobClientSource = containerClient.GetBlobClient(blobFile.Directory + blobFile.Name + blobFile.Extension);
            var blobClientTarget = containerClient.GetBlobClient(filePathTarget);


            await blobClientTarget.StartCopyFromUriAsync(new Uri(blobFile.Uri));
            await blobClientSource.DeleteIfExistsAsync();

            return blobClientTarget;
        }

        public async Task<BlobClient> DeleteBlobAsync(BlobFile blobFile)
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(blobFile.Container.ToLower());
            var blobClient = containerClient.GetBlobClient(blobFile.Directory + blobFile.Name + blobFile.Extension);
            await blobClient.DeleteIfExistsAsync();

            return blobClient;
        }
    }
}
