using System.ComponentModel.DataAnnotations;

namespace Analysim.Web.ViewModels.Project
{
    public class CreateProjectRecommendationVM
    {
        [Required(ErrorMessage = "Recommendation comment is a required field.")]
        [MaxLength(1000, ErrorMessage = "Maximum length for Recommendation Comment is 1000 characters.")]
        public string Comment { get; set; } = string.Empty;
    }
}
