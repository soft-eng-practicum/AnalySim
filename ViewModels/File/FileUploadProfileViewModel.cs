using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

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
