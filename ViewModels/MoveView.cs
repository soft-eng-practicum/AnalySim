using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace NeuroSimHub.ViewModels
{
    public class MoveView
    {
        [Required]
        public int FileID { get; set; }

        [Required]
        public string SubDirectory { get; set; }

    }
}
