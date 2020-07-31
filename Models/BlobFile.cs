using System;
using System.ComponentModel.DataAnnotations;

namespace AnalySim.Models
{
    public class BlobFile
    {
        [KeyAttribute]
        public int BlobFileID { get; set; }
       
        [Required]
        public string Container { get; set; }

        [Required]
        public string Directory { get; set; }

        [Required]
        public string Name { get; set; }

        [Required]
        public string Extension { get; set; }

        [Required]
        public int Size { get; set; }

        [Required]
        public string Uri { get; set; }

        [Required]
        public DateTimeOffset DateCreated { get; set; }

        [Required]
        public DateTimeOffset LastModified { get; set; }

        //Foreign Key To User
        [Required]
        public ApplicationUser User { get; set; }
        public int UserID { get; set; }

        //Foreign Key to Project
        public Project Project { get; set; }
        public int? ProjectID { get; set; }

    }
}
