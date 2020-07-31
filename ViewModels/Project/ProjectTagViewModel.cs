using System.ComponentModel.DataAnnotations;

namespace AnalySim.ViewModels.Project
{
    public class ProjectTagViewModel
    {
        [Required]
        public int ProjectID { get; set; }

        [Required]
        public string TagName { get; set; }
    }
}
