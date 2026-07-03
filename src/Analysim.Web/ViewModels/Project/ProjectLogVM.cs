#nullable enable annotations

using System;
using System.Collections.Generic;

namespace Analysim.Web.ViewModels.Project
{
    public class ProjectLogVM
    {
        public int LogID { get; set; }
        public int UserID { get; set; }
        public string AuthorName { get; set; } = string.Empty;
        public int ProjectID { get; set; }
        public string? Title { get; set; }

        // base64 data URL.
        public string? Image { get; set; }

        public string Content { get; set; } = string.Empty;
        public bool IsDeleted { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public int CommentCount { get; set; }
    }
}
