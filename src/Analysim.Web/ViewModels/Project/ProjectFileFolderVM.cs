﻿using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace Web.ViewModels.Project
{
    public class FolderUploadProfileViewModel
    {
        public string Directory { get; set; } = "";

        [Required(ErrorMessage = "User ID is a required field.")]
        public int UserID { get; set; }

        [Required(ErrorMessage = "Project ID is a required field.")]
        public int ProjectID { get; set; }

        public string folderName { get; set; } = "";
    }
}
