using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class ProjectMembershipRequest
    {
        [Key]
        public int ProjectMembershipRequestID { get; set; }

        [Required(ErrorMessage = "Project ID is a required field.")]
        [ForeignKey("Project")]
        public int ProjectID { get; set; }
        public Project Project { get; set; }

        [Required(ErrorMessage = "Requester User ID is a required field.")]
        [ForeignKey("RequesterUser")]
        public int RequesterUserID { get; set; }
        public User RequesterUser { get; set; }

        [Required(ErrorMessage = "Target User ID is a required field.")]
        [ForeignKey("TargetUser")]
        public int TargetUserID { get; set; }
        public User TargetUser { get; set; }

        [Required(ErrorMessage = "Created By User ID is a required field.")]
        [ForeignKey("CreatedByUser")]
        public int CreatedByUserID { get; set; }
        public User CreatedByUser { get; set; }

        [Required(ErrorMessage = "Request Type is a required field.")]
        public string Type { get; set; }

        [Required(ErrorMessage = "Request Status is a required field.")]
        public string Status { get; set; }

        [MaxLength(500, ErrorMessage = "Maximum length for Message is 500 Character.")]
        public string Message { get; set; }

        [Required(ErrorMessage = "Created At is a required field.")]
        public DateTimeOffset CreatedAt { get; set; }

        public DateTimeOffset? RespondedAt { get; set; }
    }
}
