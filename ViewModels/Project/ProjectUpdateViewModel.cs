using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace NeuroSimHub.ViewModels
{
    public class ProjectUpdateViewModel
    {
        [Required]
        [MaxLength(20)]
        public string Name { get; set; }

        [Required]
        public string Visibility { get; set; }

        [Required]
        [MaxLength(150)]
        public string Description { get; set; }
    }
}
