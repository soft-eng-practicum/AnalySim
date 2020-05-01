using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace NeuroSimHub.Models
{
    public class ApplicationUserProject
    {
        [Key, Column(Order = 1)]
        public string ApplicationUserID { get; set; }
        public ApplicationUser ApplicationUser { get; set; }

        [Key, Column(Order = 2)]
        public int ProjectID { get; set; }
        public Project Project { get; set; }
        
        [Required]
        public string UserRole { get; set; }

        [Required]
        public bool IsFollowing { get; set; }
    }
}
