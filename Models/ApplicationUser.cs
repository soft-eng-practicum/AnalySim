using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace NeuroSimHub.Models
{
    public class ApplicationUser : IdentityUser<int>
    {

        public string Bio { get; set; }

        [Required]
        [DataType(DataType.DateTime)]
        public DateTime DateCreated { get; set; }

        [Required]
        [DataType(DataType.DateTime)]
        public DateTime LastOnline { get; set; }

        public ICollection<UserUser> Followers { get; } = new List<UserUser>();
        public ICollection<UserUser> Following { get; } = new List<UserUser>();
        public ICollection<ProjectUser> ProjectUsers { get; } = new List<ProjectUser>();
        public ICollection<BlobFile> BlobFiles { get; } = new List<BlobFile>();
    }
}
