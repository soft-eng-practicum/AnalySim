using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace NeuroSimHub.Models
{
    public class ProjectTag
    {
        [Key, Column(Order = 1)]
        [ForeignKey("Tag")]
        public int TagID { get; set; }
        public Tag Tag{ get; set; }

        [Key, Column(Order = 2)]
        [ForeignKey("Project")]
        public int ProjectID { get; set; }
        public Project Project{ get; set; }
    }
}
