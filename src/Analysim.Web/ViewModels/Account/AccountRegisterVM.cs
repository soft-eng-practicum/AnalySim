using System.ComponentModel.DataAnnotations;

namespace Web.ViewModels.Account
{
    public class AccountRegisterVM
    {
        [Required(ErrorMessage = "Email Address is a required field.")]
        [DataType(DataType.EmailAddress)]
        public string EmailAddress { get; set; }

        [Required(ErrorMessage = "Username is a required field.")]
        [Display(Name = "User Name")]
        public string Username { get; set; }

        [Required(ErrorMessage = "Password is a required field.")]
        [DataType(DataType.Password)]
        public string Password { get; set; }
    }
}
