using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class ProjectCommentFlag
    {
        // PK
        [KeyAttribute]
        public int FlagID { get; set; }

        // Comment
        [ForeignKey("ProjectComment")]
        public int CommentID { get; set; }
        public ProjectComment ProjectComment { get; set; } = null!;

        // Flagger
        [ForeignKey("User")]
        public int UserID { get; set; }
        public User User { get; set; } = null!;

        // Snapshot comment content
        public string CommentContentSnapshot { get; set; } = null!;

        // Timestamp
        public DateTime CreatedAt { get; set; }
    }
}