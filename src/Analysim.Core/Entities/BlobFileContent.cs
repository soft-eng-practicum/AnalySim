using Core.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Analysim.Core.Entities
{
    public class BlobFileContent
    {
        [KeyAttribute]
        [ForeignKey("BlobFile")]
        public int BlobFileID { get; set; }
        public BlobFile BlobFile { get; set; }

        [Required(ErrorMessage = "Blobfile content is a required field.")]
        public byte[] Content { get; set; }

        [Required(ErrorMessage = "BlobFile Date is a required field.")]
        public DateTimeOffset DateCreated { get; set; }
    }
}
