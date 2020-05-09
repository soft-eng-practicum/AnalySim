using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace NeuroSimHub.Models
{
    public class UserUser 
    {
        [Key, Column(Order = 1)]
        public int UserID { get; set; }
        public ApplicationUser User { get; set; }

        [Key, Column(Order = 2)]
        public int FollowerID { get; set; }
        public ApplicationUser Follower { get; set; }
        
    }
}
