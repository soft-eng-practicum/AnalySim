using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NeuroSimHub.Models
{
    public class ApplicationUser : IdentityUser
    {

        public ICollection<ApplicationUserProject> ApplicationUserProjects { get; set; }
        public ICollection<BlobFile> BlobFiles { get; set; }
    }
}
