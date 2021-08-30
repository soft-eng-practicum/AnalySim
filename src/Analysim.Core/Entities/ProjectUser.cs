using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class ProjectUser
    {
        [Key, Column(Order = 1)]
        [ForeignKey("User")]
        public int UserID { get; set; }
        public User User { get; set; }

        [Key, Column(Order = 2)]
        [ForeignKey("Project")]
        public int ProjectID { get; set; }
        public Project Project { get; set; }

        [Required(ErrorMessage = "User Role is a required field.")]
        public string UserRole { get; set; }

        [Required(ErrorMessage = "Is Following is a required field.")]
        public bool IsFollowing { get; set; }
    }
}
