using System.ComponentModel.DataAnnotations;

namespace Web.ViewModels.Account
{
    public class AccountFollowVM
    {
        [Required(ErrorMessage = "User ID is a required field.")]
        public int UserID { get; set; }

        [Required(ErrorMessage = "Follower ID is a required field.")]
        public int FollowerID { get; set; }

    }
}
