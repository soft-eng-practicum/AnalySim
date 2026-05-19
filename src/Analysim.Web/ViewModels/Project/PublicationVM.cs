#nullable enable

using System;
using System.Collections.Generic;

namespace Analysim.Web.ViewModels.Project
{
    public class PublicationVM
    {
        public int PublicationID { get; set; }
        public int ProjectID { get; set; }
        public string? Title { get; set; }
        public string Journal { get; set; } = string.Empty;
        public string? Url { get; set; }
        public string? Doi { get; set; }
        public string SourceAuthor { get; set; } = string.Empty;
        public int? Year { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}