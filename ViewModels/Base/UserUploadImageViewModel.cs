using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace AnalySim.ViewModels.Base
{
    public class UserUploadImageViewModel
    {
        [Required]
        public IFormFile File { get; set; }

        [Required]
        public string Container { get; set; }

        [Required]
        public string Directory { get; set; }

        [Required]
        public string Name { get; set; }

        [Required]
        public string Extension { get; set; }

        [Required]
        public int UserID { get; set; }
    }
}
