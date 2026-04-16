using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class ProjectComment
    {
        // PK
        [KeyAttribute]
        public int CommentID { get; set; }

        // Comment Author
        [ForeignKey("User")]
        public int UserID { get; set; }
        public User User { get; set; } = null!;

        // Project comment is linked to
        [ForeignKey("Project")]
        public int ProjectID { get; set; }
        public Project Project{ get; set; } = null!;

        // Is this comment a reply?
        [ForeignKey("ParentComment")]
        public int? ParentCommentID { get; set; }
        public ProjectComment? ParentComment  { get; set; } 

        // Comment content
        public string Content { get; set; } = string.Empty;

        // Soft Delete
        public bool IsDeleted { get; set; }

        // Pending Review
        public bool IsPendingReview { get; set; }

        // Timestamps
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Replies to this comment
        public ICollection<ProjectComment> Replies { get; set; } = new List<ProjectComment>();
        public ICollection<ProjectCommentLike> CommentLikes { get; set; } = new List<ProjectCommentLike>();
        public ICollection<ProjectCommentFlag> CommentFlags { get; set; } = new List<ProjectCommentFlag>();
    }
}