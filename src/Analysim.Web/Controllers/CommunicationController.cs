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
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;

namespace Core.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class CommunicationController : ControllerBase
    {
        private readonly IMailNetService _mailNetService;
        private readonly ILoggerManager _loggerManager;
        private readonly IConfiguration _configuration;

        public CommunicationController(
            IMailNetService mailNetService,
            ILoggerManager loggerManager,
            IConfiguration configuration)
        {
            _mailNetService = mailNetService;
            _loggerManager = loggerManager;
            _configuration = configuration;
        }

        /*
         * Type : POST
         * URL : /api/communication/sendEmail
         * Param : SendMailParameter
         * Description: Send an Email
         * Response Status: 200 Ok, 400 Bad Request
         */
        [Authorize]
        [HttpPost("[action]")]
        public async Task<IActionResult> SendEmail([FromForm] SendEmailVM emailInfo)
        {
            var currentUsername = User.Identity?.Name ?? User.FindFirstValue(ClaimTypes.Name);
            var admins = _configuration.GetSection("AdminUsers").Get<List<string>>() ?? new List<string>();

            var isAdmin = admins.Any(u =>
                string.Equals(u, currentUsername, StringComparison.OrdinalIgnoreCase));
            if (!isAdmin) return Forbid();

            await _mailNetService.SendEmail(emailInfo.EmailAddress, emailInfo.Username, emailInfo.Subject, emailInfo.BodyHtml, emailInfo.BodyText);

            return Ok(new
            {
                result = emailInfo,
                message = "Registration Email was successfully sent"
            });
        }
    }
}
