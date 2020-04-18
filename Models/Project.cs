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
        public int Name { get; set; }

        [Required]
        public string Visibility { get; set; }

        [MaxLength(150)]
        public int Description { get; set; }

        [Required]
        [Timestamp]
        public int DateCreated { get; set; }

        [Required]
        [Timestamp]
        public int LastUpdated { get; set; }

        public ApplicationUser User { get; set; }
        public string UserID { get; set; }
    }
}
