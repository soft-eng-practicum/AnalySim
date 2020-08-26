using System.ComponentModel.DataAnnotations;

namespace AnalySim.Models
{
    public class AccountLoginVM
    {
        [Required(ErrorMessage = "User Name is a required field.")]
        [Display(Name="User Name")]
        public string Username { get; set; }
        [Required(ErrorMessage = "Password is a required field.")]
        [DataType(DataType.Password)]
        public string Password { get; set; }
    }
}
