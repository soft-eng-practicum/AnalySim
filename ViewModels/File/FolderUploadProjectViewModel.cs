using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace AnalySim.ViewModels.File
{
    public class FolderUploadProfileViewModel
    {
        public string Directory { get; set; } = "";

        [Required]
        public int UserID { get; set; }

        [Required]
        public int ProjectID { get; set; }
    }
}
