using System;
using System.Collections.Generic;

namespace Analysim.Web.ViewModels.Project
{
    public class ProjectCommentVM
    {
        public int CommentID { get; set; }
        public int UserID { get; set; }
        public string AuthorName { get; set; } = string.Empty;
        public int ProjectID { get; set; }
        public int? ParentCommentID { get; set; }
        public string Content { get; set; } = string.Empty;
        public bool IsDeleted { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<ProjectCommentVM> Replies { get; set; } = new();
    }
}