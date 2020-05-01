using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace NeuroSimHub.Models
{
    public class Tag
    {
        [KeyAttribute]
        public int TagID { get; set; }

        [Required]
        public string Name { get; set; }

        public ICollection<ProjectTag> ProjectTags { get; } = new List<ProjectTag>();
    }
}
