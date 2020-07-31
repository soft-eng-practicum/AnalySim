using System.ComponentModel.DataAnnotations;

namespace AnalySim.ViewModels.Base
{
    public class UserUpdateViewModel
    {
        [Required]
        public string Bio { get; set; }
    }
}
