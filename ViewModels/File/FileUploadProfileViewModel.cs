using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace NeuroSimHub.ViewModels.File
{
    public class FileUploadProfileViewModel
    {
        [Required]
        public IFormFile File { get; set; }

        [Required]
        public int UserID { get; set; }
    }
}
