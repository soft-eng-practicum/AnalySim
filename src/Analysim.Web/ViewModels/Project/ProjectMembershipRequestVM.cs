using System.ComponentModel.DataAnnotations;

namespace Web.ViewModels.Project
{
    public class ProjectMembershipInvitationVM
    {
        [Required(ErrorMessage = "Project ID is a required field.")]
        public int ProjectID { get; set; }

        [Required(ErrorMessage = "User ID is a required field.")]
        public int UserID { get; set; }

        [MaxLength(500, ErrorMessage = "Maximum length for Message is 500 Character.")]
        public string Message { get; set; }
    }
}
