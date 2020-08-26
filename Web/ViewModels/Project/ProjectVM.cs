using System.ComponentModel.DataAnnotations;

namespace Web.ViewModels.Project
{
    public class ProjectVM
    {
        [Required(ErrorMessage = "Project Name is a required field.")]
        [Display(Name = "Project Name")]
        public string Name { get; set; }

        [Required(ErrorMessage = "Visibility is a required field.")]
        public string Visibility { get; set; }

        public string Description { get; set; }

        [Required]
        public int UserID { get; set; }
    }
}
