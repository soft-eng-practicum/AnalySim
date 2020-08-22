using System.ComponentModel.DataAnnotations;

namespace AnalySim.ViewModels.Base
{
    public class AccountUpdateVM
    {
        [Required(ErrorMessage = "Bio is a required field.")]
        public string Bio { get; set; }
    }
}
