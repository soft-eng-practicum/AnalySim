using System.ComponentModel.DataAnnotations;


namespace Web.ViewModels.Account
{
    public class ChangePasswordVM
    {
        [Required(ErrorMessage = "User ID is a required field.")]
        public string userId{ get; set; }

        [Required(ErrorMessage = "passwordToken is a required field.")]
        public string passwordToken{ get; set; }

        [Required]
        [StringLength(100, ErrorMessage = "The {0} must be at least {2} characters long.", MinimumLength = 6)]
        [DataType(DataType.Password)]
        [Display(Name = "New password")]
        public string NewPassword { get; set; }

        [DataType(DataType.Password)]
        [Display(Name = "Confirm new password")]
        [Compare("NewPassword", ErrorMessage = "The new password and confirmation password do not match.")]
        public string ConfirmPassword { get; set; }
    
    }
}