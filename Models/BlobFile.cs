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

        public int? Size { get; set; }

        [Required]
        public string Uri { get; set; }

        [Required]
        [DataType(DataType.DateTime)]
        public DateTime DateCreated { get; set; }

        //Foreign Key To User
        [Required]
        public ApplicationUser User { get; set; }
        public int UserID { get; set; }

        //Foreign Key to Project
        [Required]
        public Project Project { get; set; }
        public int ProjectID { get; set; }

    }
}
