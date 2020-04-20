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
        public string Container { get; set; }

        [Required]
        public string Directory { get; set; }

        [Required]
        public string Name { get; set; }

        [Required]
        public string Extension { get; set; }

        public long Size { get; set; }

        public string Uri { get; set; }

        public DateTime DateCreated { get; set; }

        //Foreign Key To User
        public ApplicationUser User { get; set; }
        public string UserID { get; set; }

        //Foreign Key to Project
        public Project Project { get; set; }
        public string ProjectID { get; set; }

    }
}
