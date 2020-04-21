using NeuroSimHub.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace NeuroSimHub.ViewModels
{
    public class ProjectView
    {
        [Required]
        [Display(Name = "User Name")]
        public int Name { get; set; }

        [Required]
        [Display(Name = "Visibility")]
        public string Visibility { get; set; }

        [Display(Name = "Description")]
        public int Description { get; set; }

        [Required]
        public string UserID { get; set; }     
    }
}
