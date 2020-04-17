using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NeuroSimHub.Models
{
    public class ApplicationUser : IdentityUser
    {

        public List<Project> ProjectList { get; set; }
    }
}
