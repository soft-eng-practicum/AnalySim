#nullable enable

using System.ComponentModel.DataAnnotations;

namespace Analysim.Web.ViewModels.Project
{
    public class CreatePublicationVM
    {
        [Required(ErrorMessage = "Project ID is a required field.")]
        public int ProjectID { get; set; }

        public string? Title { get; set; }

        [Required(ErrorMessage = "Publication Journal / Conference is a required field.")]
        public string Journal { get; set; } = string.Empty;
        public string? Url { get; set; }
        public string? Doi { get; set; }

        [Required(ErrorMessage = "Publication Author is a required field.")]
        public string SourceAuthor { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Publication Year is a required field.")]
        [Range(1, 2100, ErrorMessage = "Enter a valid publication year.")]
        public int? Year { get; set; }

        public string? Volume { get; set; }
        public string? Issue { get; set; }
        public string? Pages { get; set; }
        
        public string? Notes { get; set; }
    }
}
