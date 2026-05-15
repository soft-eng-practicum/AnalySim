using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Core.Entities
{
    public class User : IdentityUser<int>
    {

        public string Bio { get; set; }

        [Required(ErrorMessage = "User Date Created is a required field.")]
        public DateTimeOffset DateCreated { get; set; }

        [Required(ErrorMessage = "User Last Online is a required field.")]
        public DateTimeOffset LastOnline { get; set; }

        public ICollection<UserUser> Followers { get; } = new List<UserUser>();
        public ICollection<UserUser> Following { get; } = new List<UserUser>();
        public ICollection<ProjectUser> ProjectUsers { get; } = new List<ProjectUser>();
        public ICollection<BlobFile> BlobFiles { get; } = new List<BlobFile>();
        
        // Comments
        public ICollection<ProjectComment> ProjectComments { get; set; } = new List<ProjectComment>();
        public ICollection<ProjectCommentLike> CommentLikes { get; set; } = new List<ProjectCommentLike>();
        public ICollection<ProjectCommentFlag> CommentFlags { get; set; } = new List<ProjectCommentFlag>();
        public bool ReceiveCommentReplyEmails { get; set; } = true;

        // Logs
        public ICollection<ProjectLog> ProjectLogs { get; set; } = new List<ProjectLog>();

        public string RegistrationSurvey {get; set;}

    }
}
