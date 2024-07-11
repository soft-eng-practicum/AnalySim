using Core.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Analysim.Core.Entities
{
    public class NotebookContent
    {
        [Key, Column(Order = 1)]
        [ForeignKey("Notebook")]
        public int NotebookID { get; set; }
        public Notebook Notebook { get; set; }

        [Key, Column(Order = 2)]
        public int Version { get; set; }

        [Required(ErrorMessage = "Notebook Content is a required field.")]
        public byte[] Content { get; set; }

        [Required(ErrorMessage = "Notebook Author is a required field.")]
        public string Author { get; set; }

        [Required(ErrorMessage = "Notebook Size is a required field.")]
        public int Size { get; set; }

        [Required(ErrorMessage = "Notebook Date is a required field.")]
        public DateTimeOffset DateCreated { get; set; }
    }
}
