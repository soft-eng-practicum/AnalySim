using NeuroSimHub.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace NeuroSimHub.ViewModels
{
    public class ProjectCreateViewModel
    {
        [Required]
        [Display(Name = "Project Name")]
        public string Name { get; set; }

        [Required]
        [Display(Name = "Visibility")]
        public string Visibility { get; set; }

        [Display(Name = "Description")]
        public string Description { get; set; }

        [Required]
        public string UserID { get; set; }

        [Required]
        public string Route { get; set; }
    }
}
