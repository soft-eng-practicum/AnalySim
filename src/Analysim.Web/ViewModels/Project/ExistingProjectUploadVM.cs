using System;
using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;
using Core.Entities;
using System.Collections.Generic;

namespace Analysim.Web.ViewModels.Project
{
	public class ExistingProjectUploadVM
	{
	

            public string NotebookURL { get; set; }

            public String NotebookName { get; set; }

            [Required(ErrorMessage = "Project ID is a required field.")]
            public int ProjectID { get; set; }

            public string Type { get; set; }

            public string Directory { get; set; }

            public string observableNotebookDatasets
            {
                get; set;
            }


    }
}

