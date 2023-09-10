using System;
using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace Analysim.Web.ViewModels.Project
{
	public class NotebookNameChangeVM
	{

        public int NotebookID { get; set; }


        public String NotebookName { get; set; }
    }
}

