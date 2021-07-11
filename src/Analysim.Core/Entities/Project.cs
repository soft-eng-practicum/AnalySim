using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class Project

    {
        [KeyAttribute]
        public int ProjectID { get; set; }

        [Required(ErrorMessage = "Project Name is a required field.")]
        [MaxLength(20, ErrorMessage = "Maximum length for Project Name is 20 Character.")]
        public string Name { get; set; }

        [Required(ErrorMessage = "Project Visibility is a required field.")]
        public string Visibility { get; set; }

        [MaxLength(500, ErrorMessage = "Maximum length for Project Description is 500 Character.")]
        public string Description { get; set; }

        [Required(ErrorMessage = "Project Date Created is a required field.")]
        public DateTimeOffset DateCreated { get; set; }

        [Required(ErrorMessage = "Project Last Updated is a required field.")]
        public DateTimeOffset LastUpdated { get; set; }


        [Required(ErrorMessage = "Project Route is a required field.")]
        [Index(IsUnique = true)]
        public string Route { get; set; }

        public List<ProjectTag> ProjectTags { get; set; }
        public ICollection<ProjectUser> ProjectUsers { get; } = new List<ProjectUser>();
        public ICollection<BlobFile> BlobFiles { get; set; } = new List<BlobFile>();

        //public Project ForkedFrom { get; set; }
    }
}


