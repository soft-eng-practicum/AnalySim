#nullable enable // Enable nullable fields 

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class ProjectLog
    {
        // PK
        [KeyAttribute]
        public int LogID { get; set; }

        // Project Log Author
        [ForeignKey("User")]
        public int UserID { get; set; }
        public User User { get; set; } = null!;

        // Project Log is linked to
        [ForeignKey("Project")]
        public int ProjectID { get; set; }
        public Project Project{ get; set; } = null!;

        // Referenced Notebook
        [ForeignKey("ReferencedNotebookID")]
        public int? ReferencedNotebookID { get; set; }
        public Notebook? ReferencedNotebook { get; set; }

        public int? ReferencedNotebookVersion { get; set; }

        // Project Log Title
        public string? Title { get; set; }

        // Project Log Image
        public int? BlobFileID { get; set; }
        public BlobFile? BlobFile { get; set; }

        // Project Log Content
        [Required]
        public string Content { get; set; } = string.Empty;

        // Soft Delete
        public bool IsDeleted { get; set; }

        // Timestamps
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }

        // Replies to this Project Log
        public ICollection<ProjectComment> Comments { get; set; } = new List<ProjectComment>();
    }
}
