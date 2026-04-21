using System.ComponentModel.DataAnnotations;

namespace Analysim.Web.ViewModels.Project
{
    public class CreatePublicationVM
    {
        [Required(ErrorMessage = "Project ID is a required field.")]
        public int ProjectID { get; set; }

        [Required(ErrorMessage = "Title is a required field.")]
        public string Title { get; set; } = string.Empty;
        public string? Url { get; set; }
        public string? Doi { get; set; }
        public string? SourceAuthor { get; set; }
        public int? Year { get; set; }
    }
}