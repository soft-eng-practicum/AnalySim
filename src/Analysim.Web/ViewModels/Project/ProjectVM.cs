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

        // Nullable so older clients can continue creating and updating projects
        // without changing the existing member-permission defaults.
        public bool? MembersCanEditProject { get; set; }
        public bool? MembersCanManageMembers { get; set; }
        public bool? MembersCanManageTags { get; set; }
        public bool? MembersCanUploadFiles { get; set; }
        public bool? MembersCanManageFiles { get; set; }
        public bool? MembersCanUploadNotebooks { get; set; }
        public bool? MembersCanManageNotebooks { get; set; }
        public bool? MembersCanManagePublications { get; set; }
        public bool? MembersCanManageProjectLogs { get; set; }

        [Required]
        public int UserID { get; set; }
    }
}
