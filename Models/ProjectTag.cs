using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AnalySim.Models
{
    public class ProjectTag
    {
        [Key, Column(Order = 1)]
        [ForeignKey("Tag")]
        public int TagID { get; set; }
        public Tag Tag{ get; set; }

        [Key, Column(Order = 2)]
        [ForeignKey("Project")]
        public int ProjectID { get; set; }
        public Project Project{ get; set; }
    }
}
