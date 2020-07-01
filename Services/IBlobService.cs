using AnalySim.Models;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.AspNetCore.Http;
using NeuroSimHub.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NeuroSimHub.Services
{
    public interface IBlobService
    {
        public Task<BlobDownloadInfo> GetBlobAsync(BlobFile file);

        public Task<List<BlobFile>> ListBlobsAsync(string container);

        public Task<IEnumerable<string>> ListBlobsAsync(string container, string directory);

        public Task<BlobClient> CreateFolder(string container, string filePath);

        public Task<BlobClient> UploadFileBlobAsync(IFormFile file, string container, string filePath);

        public Task<BlobClient> UploadFileBlobResizeAsync(IFormFile file, string container, string filePath, int height, int width);

        public Task<BlobClient> MoveBlobAsync(BlobFile blobFile, string filePathTarget);

        public Task<BlobClient> DeleteBlobAsync(BlobFile file);
    }
}