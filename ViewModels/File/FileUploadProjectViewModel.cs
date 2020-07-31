using Microsoft.AspNetCore.Http;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace AnalySim.ViewModels
{
    public class FileUploadProjectViewModel
    {

        [Required]
        public IFormFile File { get; set; }

        public string Directory { get; set; } = "";

        [Required]
        public int UserID { get; set; }

        [Required]
        public int ProjectID { get; set; }
    }
}
