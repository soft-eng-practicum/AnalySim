using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace NeuroSimHub.ViewModels.Base
{
    public class UserUpdateViewModel
    {
        [Required]
        public string Bio { get; set; }
    }
}
