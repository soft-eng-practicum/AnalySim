using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace Analysim.Web.ViewModels.Project
{
    public class UpdateProjectLogVM
    {
        public string? Title { get; set; }

        [Required(ErrorMessage = "Project Log Content is a required field.")]
        public string Content { get; set; } = string.Empty;

        public IFormFile? Image { get; set; }

        // True when the user wants to remove the current image
        public bool RemoveImage { get; set; }
    }
}