using System.Collections.ObjectModel;
using System.ComponentModel.DataAnnotations;

namespace Web.ViewModels
{
    public class VerifyAccountVM
    {
        [Required(ErrorMessage = "User ID is required")]
        [Display(Name = "user ID")]
        public string userId { get; set; }

        [Required(ErrorMessage = "User token is required")]
        [Display(Name = "token")]
        public string token { get; set; }

    }
}
