using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NeuroSimHub.Models
{
    public class ApplicationUserProject
    {
        public string ApplicationUserID { get; set; }
        public ApplicationUser ApplicationUser { get; set; }

        public int ProjectID { get; set; }
        public Project Project { get; set; }
    }
}
