using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Core.Entities
{
    public class ApplicationUser : IdentityUser<int>
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
    }
}
