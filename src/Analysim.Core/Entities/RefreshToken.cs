using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class RefreshToken
    {
        public int RefreshTokenID { get; set; }

        public int UserID { get; set; }

        public User User { get; set; }

        [Required]
        public string TokenHash { get; set; }

        public Guid TokenFamilyID { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime ExpiresAt { get; set; }

        public DateTime? RevokedAt { get; set; }

        public string ReplacedByTokenHash { get; set; }

        public string RevokedReason { get; set; }

        public string CreatedByIp { get; set; }

        public string RevokedByIp { get; set; }

        [NotMapped]
        public bool IsExpired => DateTime.UtcNow >= ExpiresAt;

        [NotMapped]
        public bool IsRevoked => RevokedAt.HasValue;

        [NotMapped]
        public bool IsActive => !IsRevoked && !IsExpired;
    }
}
