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
        [ForeignKey("User")]
        public int UserID { get; set; }
        public virtual ApplicationUser User { get; set; }

        [Key, Column(Order = 2)]
        [ForeignKey("Follower")]
        public int FollowerID { get; set; }
        public virtual ApplicationUser Follower { get; set; }
        
    }
}
