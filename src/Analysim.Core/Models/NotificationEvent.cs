using System.Collections.Generic;

namespace Core.Models
{
    public class NotificationEvent
    {
        public string Type { get; set; }
        public int? ActorUserID { get; set; }
        public int? RecipientUserID { get; set; }
        public int? ProjectID { get; set; }
        public int? CommentID { get; set; }
        public int? ParentCommentID { get; set; }
        public int? ProjectLogID { get; set; }
        public IDictionary<string, string> Data { get; set; } = new Dictionary<string, string>();
    }
}
