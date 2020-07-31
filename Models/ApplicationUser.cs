using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace AnalySim.Models
{
    public class ApplicationUser : IdentityUser<int>
    {

        public string Bio { get; set; }

        [Required]
        public DateTimeOffset DateCreated { get; set; }

        [Required]
        public DateTimeOffset LastOnline { get; set; }

        public ICollection<UserUser> Followers { get; } = new List<UserUser>();
        public ICollection<UserUser> Following { get; } = new List<UserUser>();
        public ICollection<ProjectUser> ProjectUsers { get; } = new List<ProjectUser>();
        public ICollection<BlobFile> BlobFiles { get; } = new List<BlobFile>();
    }
}
