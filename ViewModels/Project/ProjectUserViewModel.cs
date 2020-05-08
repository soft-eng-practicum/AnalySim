using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace NeuroSimHub.ViewModels
{
    public class ProjectUserViewModel
    {
        [Required]
        public int UserID { get; set; }

        [Required]
        public int ProjectID { get; set; }

        [Required]
        public string UserRole { get; set; }

        [Required]
        public bool IsFollowing { get; set; }
    }
}
