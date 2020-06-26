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

namespace NeuroSimHub.Services
{
    public class BlobService : IBlobService
    {
        private readonly BlobServiceClient _blobServiceClient;

        public BlobService(BlobServiceClient blobServiceClient)
        {
            _blobServiceClient = blobServiceClient;
        }

        public async Task<BlobInfo> GetBlobAsync(string name)
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient("youtube");
            var blobClient = containerClient.GetBlobClient(name);
            var blobDownloadInfo = await blobClient.DownloadAsync();
            return new BlobInfo(blobDownloadInfo.Value.Content, blobDownloadInfo.Value.ContentType);
        }

        public async Task<IEnumerable<string>> ListBlobsAsync()
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient("youtube");
            var items = new List<string>();

            await foreach (var blobItem in containerClient.GetBlobsAsync())
            {
                items.Add(blobItem.Name);
            }

            return items;
        }

        public async Task<BlobClient> CreateFolder(string filePath, string container)
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(container);
            var blobClient = containerClient.GetBlobClient(filePath);


            using (var file = new FileStream("$$$.$$", FileMode.CreateNew))
            {
                await blobClient.UploadAsync(file);
            }

            

            return blobClient;
        }

        public async Task<BlobClient> UploadFileBlobAsync(IFormFile file, string filePath, string container)
        {


            var containerClient = _blobServiceClient.GetBlobContainerClient(container); 
            var blobClient = containerClient.GetBlobClient(filePath);

            // Create Or Overwrite File
            using (var fileStream = file.OpenReadStream())
            {
                await blobClient.UploadAsync(fileStream, new BlobHttpHeaders { ContentType = file.Name.GetContentType() });
            }

            return blobClient;
        }

        public async Task<BlobClient> UploadFileBlobResizeAsync(IFormFile file, string filePath, string container, int height, int width)
        {


            var containerClient = _blobServiceClient.GetBlobContainerClient(container);
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

        public async Task DeleteBlobAsync(string blobName)
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient("youtube");
            var blobClient = containerClient.GetBlobClient(blobName);
            await blobClient.DeleteIfExistsAsync();
        }

        public Task UploadImageBlobAsync(string filePath, string fileName)
        {
            throw new System.NotImplementedException();
        }
    }
}
