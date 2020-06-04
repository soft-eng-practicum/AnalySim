using System.ComponentModel.DataAnnotations;

namespace NeuroSimHub.ViewModels
{
    public class UserFollowViewModel
    {
        [Required]
        public int UserID { get; set; }

        [Required]
        public int FollowerID { get; set; }

    }
}
