using System.ComponentModel.DataAnnotations;

namespace AnalySim.ViewModels.Project
{
    public class ProjectTagVM
    {
        [Required(ErrorMessage = "Project ID is a required field.")]
        public int ProjectID { get; set; }

        [Required(ErrorMessage = "Tag Name is a required field.")]
        [Display(Name ="Tag Name")]
        public string TagName { get; set; }
    }
}
