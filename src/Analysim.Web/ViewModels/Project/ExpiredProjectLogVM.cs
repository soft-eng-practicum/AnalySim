#nullable enable

using System;
using System.Collections.Generic;

namespace Analysim.Web.ViewModels.Project
{
    public class ExpiredProjectLogVM
    {
        public int LogID { get; set; }

        public string AuthorName { get; set; } = string.Empty;

        public string ProjectTitle { get; set; } = string.Empty;

        public string? Title { get; set; }

        public string Content { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

        public DateTime ExpiredAt { get; set; }

        public int CommentCount { get; set; }
    }
}