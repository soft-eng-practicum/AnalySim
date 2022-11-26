using System.ComponentModel.DataAnnotations;


namespace Web.ViewModels.Account
{
    public class ForgotPasswordVM
    {
        [Required(ErrorMessage = "Email Address is a required field.")]
        [DataType(DataType.EmailAddress)]
        public string EmailAddress { get; set; }
    
    }
}