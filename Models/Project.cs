using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

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
        [DataType(DataType.DateTime)]
        public DateTime DateCreated { get; set; }

        [Required]
        [DataType(DataType.DateTime)]
        public DateTime LastUpdated { get; set; }

        [Required]
        [Index(IsUnique = true)]
        public string Route { get; set; }

        public ICollection<ProjectTag> ProjectTags { get; } = new List<ProjectTag>();
        public ICollection<ProjectUser> ProjectUsers { get; } = new List<ProjectUser>();
        public ICollection<BlobFile> BlobFiles { get; } = new List<BlobFile>();
    }
}


