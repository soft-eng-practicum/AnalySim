using AnalySim.Models;
using System.Collections.ObjectModel;
using System.ComponentModel.DataAnnotations;

namespace AnalySim.ViewModels
{
    public class SendEmailVM
    {
        [Required(ErrorMessage = "User Name is a required field.")]
        [Display(Name = "User Name")]
        public string Username { get; set; }

        [Required(ErrorMessage = "Email Address is a required field.")]
        [Display(Name = "Email Address")]
        [EmailAddress]
        public string EmailAddress { get; set; }

        [Required(ErrorMessage = "Subject is a required field.")]
        [Display(Name = "Subject")]
        public string Subject { get; set; }

        [Required(ErrorMessage = "Body HTML is a required field.")]
        [Display(Name = "Body HTML")]
        public string BodyHtml { get; set; }

        [Required(ErrorMessage = "Body Text is a required field.")]
        [Display(Name = "Body Text")]
        public string BodyText { get; set; }
    }
}
