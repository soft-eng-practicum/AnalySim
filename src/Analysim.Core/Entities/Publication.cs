using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class Publication
    {
        // PK
        [KeyAttribute]
        public int PublicationID { get; set; }

        // Project publication is linked to
        [ForeignKey("Project")]
        public int ProjectID { get; set; }
        public Project Project{ get; set; } = null!;

        // publication content
        [Required(ErrorMessage = "Publication Title is a required field.")]
        public string Title { get; set; } = string.Empty;
        public string? Url { get; set; }
        public string? Doi { get; set; }
        public string? SourceAuthor { get; set; }
        public int? Year { get; set; }

        // Timestamps
        public DateTime CreatedAt { get; set; }
    }
}