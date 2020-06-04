using System.ComponentModel.DataAnnotations;

namespace NeuroSimHub.ViewModels.Base
{
    public class UserUpdateViewModel
    {
        [Required]
        public string Bio { get; set; }
    }
}
