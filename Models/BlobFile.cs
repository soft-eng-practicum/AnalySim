using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AnalySim.Models
{
    public class BlobFile
    {
        [KeyAttribute]
        public int BlobFileID { get; set; }

        [Required(ErrorMessage = "Blob File Container is a required field.")]
        public string Container { get; set; }

        [Required(ErrorMessage = "Blob File Directory is a required field.")]
        public string Directory { get; set; }

        [Required(ErrorMessage = "Blob File Name is a required field.")]
        public string Name { get; set; }

        [Required(ErrorMessage = "Blob File Extension is a required field.")]
        public string Extension { get; set; }

        [Required(ErrorMessage = "Blob File Size is a required field.")]
        public int Size { get; set; }

        [Required(ErrorMessage = "Blob File Uri is a required field.")]
        public string Uri { get; set; }

        [Required(ErrorMessage = "Blob File DateCreated is a required field.")]
        public DateTimeOffset DateCreated { get; set; }

        [Required(ErrorMessage = "Blob File LastModified is a required field.")]
        public DateTimeOffset LastModified { get; set; }

        //Foreign Key To User
        [Required(ErrorMessage = "User is a required field.")]
        public ApplicationUser User { get; set; }
        [Required(ErrorMessage = "User ID is a required field.")]
        public int UserID { get; set; }

        //Foreign Key to Project
        public Project Project { get; set; }
        public int? ProjectID { get; set; }

    }
}
