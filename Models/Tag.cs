using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AnalySim.Models
{
    public class Tag
    {
        [KeyAttribute]
        public int TagID { get; set; }

        [Required]
        [Index(IsUnique = true)]
        public string Name { get; set; }

        public ICollection<ProjectTag> ProjectTags { get; } = new List<ProjectTag>();
    }
}
