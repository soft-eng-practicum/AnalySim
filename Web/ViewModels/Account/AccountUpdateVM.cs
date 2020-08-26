using System.ComponentModel.DataAnnotations;

namespace Web.ViewModels.Account
{
    public class AccountUpdateVM
    {
        [Required(ErrorMessage = "Bio is a required field.")]
        public string Bio { get; set; }
    }
}
