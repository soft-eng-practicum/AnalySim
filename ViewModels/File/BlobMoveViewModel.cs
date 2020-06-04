using System.ComponentModel.DataAnnotations;

namespace NeuroSimHub.ViewModels
{
    public class BlobMoveViewModel
    {
        [Required]
        public int FileID { get; set; }

        [Required]
        public string SubDirectory { get; set; }

    }
}
