using System.ComponentModel.DataAnnotations;

namespace NeuroSimHub.ViewModels
{
    public class ProjectViewModel
    {
        [Required]
        [Display(Name = "Project Name")]
        public string Name { get; set; }

        [Required]
        [Display(Name = "Visibility")]
        public string Visibility { get; set; }

        [Display(Name = "Description")]
        public string Description { get; set; }

        [Required]
        public int UserID { get; set; }
    }
}
