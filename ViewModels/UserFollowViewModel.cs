using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace NeuroSimHub.ViewModels
{
    public class UserFollowViewModel
    {
        [Required]
        public int UserID { get; set; }

        [Required]
        public int FollowerID { get; set; }

    }
}
