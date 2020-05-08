using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NeuroSimHub.Models
{
    public class ApplicationUser : IdentityUser<int>
    {
        public string Bio { get; set; }

        public virtual ICollection<UserUser> Followers { get; } = new List<UserUser>();
        public virtual ICollection<UserUser> Following { get; } = new List<UserUser>();
        public ICollection<ProjectUser> ProjectUsers { get; } = new List<ProjectUser>();
        public ICollection<BlobFile> BlobFiles { get; } = new List<BlobFile>();
    }
}
