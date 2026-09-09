using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class Notification
    {
        [Key]
        public int NotificationID { get; set; }

        [ForeignKey("RecipientUser")]
        public int RecipientUserID { get; set; }
        public User RecipientUser { get; set; }

        [ForeignKey("ActorUser")]
        public int? ActorUserID { get; set; }
        public User ActorUser { get; set; }

        [Required]
        [MaxLength(100)]
        public string Type { get; set; }

        [ForeignKey("Project")]
        public int? ProjectID { get; set; }
        public Project Project { get; set; }

        [ForeignKey("ProjectComment")]
        public int? CommentID { get; set; }
        public ProjectComment ProjectComment { get; set; }

        [ForeignKey("ProjectLog")]
        public int? ProjectLogID { get; set; }
        public ProjectLog ProjectLog { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; }

        [Required]
        [MaxLength(1000)]
        public string Body { get; set; }

        [MaxLength(500)]
        public string Link { get; set; }

        public string DataJson { get; set; }

        public bool IsRead { get; set; }

        public DateTime? ReadAt { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
