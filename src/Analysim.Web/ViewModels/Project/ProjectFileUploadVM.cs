using Microsoft.AspNetCore.Http;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace Web.ViewModels.Project
{
    public class ProjectFileUploadVM
    {

        [Required(ErrorMessage = "File is a required field.")]
        public IFormFile File { get; set; }

        public string Directory { get; set; } = "";

        [Required(ErrorMessage = "User ID is a required field.")]
        public int UserID { get; set; }

        [Required(ErrorMessage = "Project ID is a required field.")]
        public int ProjectID { get; set; }
    }
}
