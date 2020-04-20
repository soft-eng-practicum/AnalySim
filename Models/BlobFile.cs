using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace NeuroSimHub.Models
{
    public class BlobFile
    {
        [KeyAttribute]
        public int BlobFileID { get; set; }

        
        [Required]
        [FromForm(Name = "container")]
        public string Container { get; set; }

        [Required]
        [FromForm(Name = "directory")]
        public string Directory { get; set; }

        [Required]
        [FromForm(Name = "name")]
        public string Name { get; set; }

        [Required]
        [FromForm(Name = "size")]
        public string Size { get; set; }

        [Required]
        [FromForm(Name = "uri")]
        public string Uri { get; set; }

        [Required]
        [Timestamp]
        [FromForm(Name = "dateCreated")]
        public int DateCreated { get; set; }

        //Foreign Key To User
        public ApplicationUser User { get; set; }
        public string UserID { get; set; }

        //Foreign Key to Project
        public Project Project { get; set; }
        public string ProjectID { get; set; }

    }
}
