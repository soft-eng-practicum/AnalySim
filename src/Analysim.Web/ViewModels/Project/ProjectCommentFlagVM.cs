using System;
using System.Collections.Generic;

namespace Analysim.Web.ViewModels.Project
{
    public class ProjectCommentFlagVM
    {
        public int FlagID { get; set; }
        public int CommentID { get; set; }
        public int UserID { get; set; }
        public string CommentContentSnapshot { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class FlaggedCommentGroupVM
    {
        public int CommentID { get; set; }
        public string CommentOwnerUsername { get; set; } = null!;
        public string CommentProjectName { get; set; } = null!;
        public string CommentProjectOwner { get; set; } = null!;
        public List<ProjectCommentFlagRowVM> Flags { get; set; } = new();
    }

    public class ProjectCommentFlagRowVM
    {
        public int FlagID { get; set; }
        public string CommentContentSnapshot { get; set; } = null!;
        public string FlaggedByUsername { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
    }
}