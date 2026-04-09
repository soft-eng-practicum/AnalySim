using System.ComponentModel.DataAnnotations;

namespace Analysim.Web.ViewModels.Project
{
    public class UpdateProjectCommentVM
    {
        [Required(ErrorMessage = "Content is a required field.")]
        [MaxLength(1000, ErrorMessage = "Maximum length for Content is 1000 characters.")]
        public string Content { get; set; } = string.Empty;
    }
}