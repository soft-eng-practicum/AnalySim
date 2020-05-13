using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace NeuroSimHub.Models
{
    public class ProjectUser
    {
        [Key, Column(Order = 1)]
        [ForeignKey("User")]
        public int UserID { get; set; }
        public ApplicationUser User { get; set; }

        [Key, Column(Order = 2)]
        [ForeignKey("Project")]
        public int ProjectID { get; set; }
        public Project Project { get; set; }
        
        [Required]
        public string UserRole { get; set; }

        [Required]
        public bool IsFollowing { get; set; }
    }
}
