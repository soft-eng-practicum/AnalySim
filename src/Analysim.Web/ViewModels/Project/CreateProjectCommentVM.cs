using System.ComponentModel.DataAnnotations;

namespace Analysim.Web.ViewModels.Project
{
    public class CreateProjectCommentVM
    {
        [Required(ErrorMessage = "Project ID is a required field.")]
        public int ProjectID { get; set; }

        [Required(ErrorMessage = "Content is a required field.")]
        [MaxLength(1000, ErrorMessage = "Maximum length for Content is 1000 characters.")]
        public string Content { get; set; } = string.Empty;

        public int? ParentCommentID { get; set; }
    }
}