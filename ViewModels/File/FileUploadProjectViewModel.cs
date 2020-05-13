using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

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
