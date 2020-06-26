using AnalySim.Models;
using Azure.Storage.Blobs;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NeuroSimHub.Services
{
    public interface IBlobService
    {
        public Task<BlobInfo> GetBlobAsync(string name);

        public Task<IEnumerable<string>> ListBlobsAsync();

        public Task<BlobClient> CreateFolder(string filePath, string container);

        public Task<BlobClient> UploadFileBlobAsync(IFormFile file, string filePath, string container);

        public Task<BlobClient> UploadFileBlobResizeAsync(IFormFile file, string filePath, string container, int height, int width);

        public Task UploadImageBlobAsync(string filePath, string fileName);

        public Task DeleteBlobAsync(string blobName);
    }
}