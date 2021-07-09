using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class UserUser 
    {
        [Key, Column(Order = 1)]
        [ForeignKey("User")]
        public int UserID { get; set; }
        public User User { get; set; }

        [Key, Column(Order = 2)]
        [ForeignKey("Follower")]
        public int FollowerID { get; set; }
        public User Follower { get; set; }
        
    }
}
