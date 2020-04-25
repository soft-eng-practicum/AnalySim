using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
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

        [MaxLength(150)]
        public string Description { get; set; }

        [Required]
        [DataType(DataType.DateTime)]
        public DateTime DateCreated { get; set; }

        [Required]
        [DataType(DataType.DateTime)]
        public DateTime LastUpdated { get; set; }

        public ICollection<ApplicationUserProject> ApplicationUserProjects { get; } = new List<ApplicationUserProject>();
        public ICollection<BlobFile> BlobFiles { get; } = new List<BlobFile>();
    }
}



