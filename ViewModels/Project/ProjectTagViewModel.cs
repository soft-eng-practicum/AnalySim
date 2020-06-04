using System.ComponentModel.DataAnnotations;

namespace NeuroSimHub.ViewModels.Project
{
    public class ProjectTagViewModel
    {
        [Required]
        public int ProjectID { get; set; }

        [Required]
        public string TagName { get; set; }
    }
}
