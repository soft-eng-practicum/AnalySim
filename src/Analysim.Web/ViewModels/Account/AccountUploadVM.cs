using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace Web.ViewModels.Account
{
    public class AccountUploadVM
    {
        [Required(ErrorMessage = "File is a required field.")]
        public IFormFile File { get; set; }

        [Required(ErrorMessage = "User ID is a required field.")]
        public int UserID { get; set; }
    }
}
