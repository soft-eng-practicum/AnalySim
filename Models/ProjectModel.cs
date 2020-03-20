using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace NeuroSimHub.Models
{
    public class ProjectModel
    {
        [Key]
        public int ProductId { get; set; }

        [Required]
        [MaxLength(150)]
        public int Name { get; set; }

        [Required]
        [MaxLength(20)]
        public int Type { get; set; }

        [Required]
        [MaxLength(150)]
        public int Description { get; set; }

        [Required]
        public int Visibility { get; set; }

        [Required]
        [Timestamp]
        public int DateCreated { get; set; }

        [Required]
        [Timestamp]
        public int LastUpdated { get; set; }

        [Required]
        public int Owner { get; set; }

    }
}
