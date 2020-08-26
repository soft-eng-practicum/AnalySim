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

    }
}
