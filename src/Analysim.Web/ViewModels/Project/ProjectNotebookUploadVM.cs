using System;
using Microsoft.AspNetCore.Http;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace Web.ViewModels.Project
{
    public class ProjectNotebookUploadVM
    {
        
        public IFormFile NotebookFile { get; set; }


        public String NotebookName { get; set;}

        [Required(ErrorMessage = "Project ID is a required field.")]
        public int ProjectID { get; set; }

    }
}
