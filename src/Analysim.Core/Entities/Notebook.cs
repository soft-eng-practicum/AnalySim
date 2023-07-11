using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Core.Entities
{
    public class Notebook
    {
        [KeyAttribute]
        public int NotebookID { get; set; }

        [Required(ErrorMessage = "Project Container is a required field.")]
        public string Container { get; set; }


        [Required(ErrorMessage = "Notebook Name is a required field.")]
        public string Name { get; set; }

        [Required(ErrorMessage = "Notebook Extension is a required field.")]
        public string Extension { get; set; }

        [Required(ErrorMessage = "Notebook Size is a required field.")]
        public int Size { get; set; }

        [Required(ErrorMessage = "Notebook Uri is a required field.")]
        public string Uri { get; set; }

        [Required(ErrorMessage = "Notebook DateCreated is a required field.")]
        public DateTimeOffset DateCreated { get; set; }

        [Required(ErrorMessage = "Notebook LastModified is a required field.")]
        public DateTimeOffset LastModified { get; set; }


        //Foreign Key to Project
        public Project Project { get; set; }
        public int? ProjectID { get; set; }

        public string type { get; set; }


    }
}
