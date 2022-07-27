using Microsoft.AspNetCore.Mvc;
using MailKit.Net.Smtp;
using System.Threading.Tasks;
using MimeKit;
using Core.Entities;
using MimeKit.Text;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using Core.Interfaces;
using Web.ViewModels;
using System;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.WebUtilities;

namespace Core.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class CommunicationController : ControllerBase
    {
        private readonly IMailNetService _mailNetService;
        private readonly ILoggerManager _loggerManager;

        public CommunicationController(IMailNetService mailNetService, ILoggerManager loggerManager)
        {
            _mailNetService = mailNetService;
            _loggerManager = loggerManager;
        }

        /*
         * Type : POST
         * URL : /api/communication/sendEmail
         * Param : SendMailParameter
         * Description: Send an Email
         * Response Status: 200 Ok, 400 Bad Request
         */
        [HttpPost("[action]")]
        public async Task<IActionResult> SendEmail([FromForm] SendEmailVM emailInfo)
        {

            await _mailNetService.SendEmail(emailInfo.EmailAddress, emailInfo.Username, emailInfo.Subject, emailInfo.BodyHtml, emailInfo.BodyText);

            return Ok(new
            {
                result = emailInfo,
                message = "Registration Email was successfully sent"
            });
        }

        // todo: clean this up joe later
        [AllowAnonymous]
        public class RegisterConfirmationModel : PageModel
        {
            private readonly UserManager<IdentityUser> _userManager;
            private readonly IMailNetService _mailNetService;

            public RegisterConfirmationModel(UserManager<IdentityUser> userManager, IMailNetService mailNetService)
            {
                _userManager = userManager;
                _mailNetService = mailNetService;
            }

            /// <summary>
            ///     This API supports the ASP.NET Core Identity default UI infrastructure and is not intended to be used
            ///     directly from your code. This API may change or be removed in future releases.
            /// </summary>
            public string Email { get; set; }

            /// <summary>
            ///     This API supports the ASP.NET Core Identity default UI infrastructure and is not intended to be used
            ///     directly from your code. This API may change or be removed in future releases.
            /// </summary>
            public bool DisplayConfirmAccountLink { get; set; }

            /// <summary>
            ///     This API supports the ASP.NET Core Identity default UI infrastructure and is not intended to be used
            ///     directly from your code. This API may change or be removed in future releases.
            /// </summary>
            public string EmailConfirmationUrl { get; set; }

            public async Task<IActionResult> OnGetAsync(string email, string returnUrl = null)
            {
                if (email == null)
                {
                    return RedirectToPage("/Index");
                }
                returnUrl = returnUrl ?? Url.Content("~/");

                var user = await _userManager.FindByEmailAsync(email);
                if (user == null)
                {
                    return NotFound($"Unable to load user with email '{email}'.");
                }

                Email = email;
                // Once you add a real email sender, you should remove this code that lets you confirm the account
                DisplayConfirmAccountLink = false;
                if (DisplayConfirmAccountLink)
                {
                    var userId = await _userManager.GetUserIdAsync(user);
                    var code = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                    code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));
                    EmailConfirmationUrl = Url.Page(
                        "/Account/ConfirmEmail",
                        pageHandler: null,
                        values: new { area = "Identity", userId = userId, code = code, returnUrl = returnUrl },
                        protocol: Request.Scheme);
                }

                return Page();
            }
        }

    }
}
