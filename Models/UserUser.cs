using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NeuroSimHub.Models
{
    public class UserUser 
    {
        [Key, Column(Order = 1)]
        [ForeignKey("User")]
        public int UserID { get; set; }
        public ApplicationUser User { get; set; }

        [Key, Column(Order = 2)]
        [ForeignKey("Follower")]
        public int FollowerID { get; set; }
        public ApplicationUser Follower { get; set; }
        
    }
}
