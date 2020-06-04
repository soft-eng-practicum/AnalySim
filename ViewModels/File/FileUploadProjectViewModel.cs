using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace NeuroSimHub.ViewModels
{
    public class FileUploadProjectViewModel
    {
        [Required]
        public IFormFile File { get; set; }

        [Required]
        public string Directory { get; set; }

        [Required]
        public int UserID { get; set; }

        [Required]
        public int ProjectID { get; set; }
    }
}
