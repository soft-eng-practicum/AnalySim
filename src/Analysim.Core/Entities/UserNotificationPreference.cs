using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class UserNotificationPreference
    {
        [ForeignKey("User")]
        public int UserID { get; set; }
        public User User { get; set; }

        [Required]
        [MaxLength(100)]
        public string NotificationType { get; set; }

        public bool InAppEnabled { get; set; } = true;

        public bool EmailEnabled { get; set; }
    }
}
