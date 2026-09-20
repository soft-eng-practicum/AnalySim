#nullable enable

using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class ProjectRecommendation
    {
        [KeyAttribute]
        public int ProjectRecommendationID { get; set; }

        [ForeignKey("Project")]
        public int ProjectID { get; set; }
        public Project Project { get; set; } = null!;

        [ForeignKey("User")]
        public int UserID { get; set; }
        public User User { get; set; } = null!;

        [Required(ErrorMessage = "Recommendation comment is a required field.")]
        [MaxLength(1000, ErrorMessage = "Maximum length for Recommendation Comment is 1000 characters.")]
        public string Comment { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
