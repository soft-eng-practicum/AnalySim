using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NeuroSimHub.Models
{
    public class UserUser 
    {
        public int UserID { get; set; }
        public ApplicationUser User { get; set; }
        public int FollowerID { get; set; }
        public ApplicationUser Follower { get; set; }
        
    }
}
