using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace NeuroSimHub.ViewModels.Project
{
    public class ProjectTagViewModel
    {
        [Required]
        public int ProjectID { get; set; }

        [Required]
        public string TagName { get; set; }
    }
}
