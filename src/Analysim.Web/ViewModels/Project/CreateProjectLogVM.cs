#nullable enable

using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace Analysim.Web.ViewModels.Project
{
    public class CreateProjectLogVM
    {
        [Required(ErrorMessage = "Project ID is a required field.")]
        public int ProjectID { get; set; }

        public string? Title { get; set; }

        [Required(ErrorMessage = "Project Log Content is a required field.")]
        public string Content { get; set; } = string.Empty;

        public IFormFile? Image { get; set; }

        public int? ReferencedNotebookID { get; set; }

        public int? ReferencedNotebookVersion { get; set; }
    }
}
