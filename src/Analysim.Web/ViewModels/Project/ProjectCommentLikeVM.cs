using System;
using System.Collections.Generic;

namespace Analysim.Web.ViewModels.Project
{
    public class ProjectCommentLikeVM
    {
        public int CommentID { get; set; }
        public int UserID { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}