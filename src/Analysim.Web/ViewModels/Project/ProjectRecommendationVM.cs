using System;

namespace Analysim.Web.ViewModels.Project
{
    public class ProjectRecommendationVM
    {
        public int ProjectRecommendationID { get; set; }
        public int UserID { get; set; }
        public string AuthorName { get; set; } = string.Empty;
        public int ProjectID { get; set; }
        public string Comment { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
