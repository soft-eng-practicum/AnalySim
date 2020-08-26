using System.ComponentModel.DataAnnotations;

namespace Web.ViewModels.Project
{
    public class ProjectUserVM
    {
        [Required(ErrorMessage = "User ID is a required field.")]
        public int UserID { get; set; }

        [Required(ErrorMessage = "Project ID is a required field.")]
        public int ProjectID { get; set; }

        [Required(ErrorMessage = "User Role is a required field.")]
        public string UserRole { get; set; }

        [Required(ErrorMessage = "Is Following is a required field.")]
        public bool IsFollowing { get; set; }
    }
}
