using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NeuroSimHub.Models
{
    public class Project
    {
        [KeyAttribute]
        public int ProjectID { get; set; }

        [Required]
        [MaxLength(20)]
        public string Name { get; set; }

        [Required]
        public string Visibility { get; set; }

        [MaxLength(500)]
        public string Description { get; set; }

        [Required]
        public DateTimeOffset DateCreated { get; set; }

        [Required]
        public DateTimeOffset LastUpdated { get; set; }

        [Required]
        [Index(IsUnique = true)]
        public string Route { get; set; }

        public List<ProjectTag> ProjectTags { get; set; }
        public ICollection<ProjectUser> ProjectUsers { get; } = new List<ProjectUser>();
        public ICollection<BlobFile> BlobFiles { get; } = new List<BlobFile>();
    }
}


