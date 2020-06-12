using Microsoft.AspNetCore.Mvc;
using MailKit.Net.Smtp;
using MailKit;
using System.Threading.Tasks;
using MimeKit;
using NeuroSimHub.Models;
using MimeKit.Text;
using System.Net.Http;
using System.Net;
using MailKit.Security;

namespace NeuroSimHub.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CommunicationsController : ControllerBase
    {
        /*
         * Type : POST
         * URL : /api/communications/sendEmail
         * Param : SendMailParameter
         * Description: Send an Email
         * Response Status: 200 Ok, 400 Bad Request
         */
        [HttpPost("[action]")]
        public async Task<IActionResult> SendEmail([FromBody] SendMailParamaters Model)
        {
            MimeMessage message = new MimeMessage();

            if (string.IsNullOrEmpty(Model.From.Address))
            {
                return BadRequest(new { message = "A From Address is required for this request" });
            }

            if (string.IsNullOrEmpty(Model.To.Address))
            {
                return BadRequest(new { message = "A To Address is required for this request" });
            }

            if (string.IsNullOrEmpty(Model.From.Name))
            {
                Model.From.Name = Model.From.Address;
            }

            if (string.IsNullOrEmpty(Model.To.Name))
            {
                Model.To.Name = Model.To.Address;
            }

            if (string.IsNullOrEmpty(Model.Subject))
            {
                Model.Subject = "<No Subject>";
            }

            message.From.Add(new MailboxAddress(Model.From.Name, Model.From.Address));
            message.To.Add(new MailboxAddress(Model.To.Name, Model.To.Address));
            message.Subject = Model.Subject;
            if (!string.IsNullOrEmpty(Model.BodyHtml)) {
                message.Body = new TextPart(TextFormat.Html) { Text = Model.BodyHtml };
            } else if (!string.IsNullOrEmpty(Model.BodyText))
            {
                message.Body = new TextPart(TextFormat.Text) { Text = Model.BodyText };
            } else
            {
                return BadRequest(new { message = "A Body is required for this request" });
            } 

            if (Model.CcAddresses != null && Model.CcAddresses.Count > 0)
            {
                foreach( MailboxAddressParameter address in Model.CcAddresses )
                {
                    if (!string.IsNullOrEmpty(address.Address))
                    {
                        if (string.IsNullOrEmpty(address.Name))
                        {
                            address.Name = address.Address;
                        }

                        message.Cc.Add(new MailboxAddress(address.Name, address.Address));
                    }
                }
            }

            if (Model.BccAddresses != null && Model.BccAddresses.Count > 0)
            {
                foreach (MailboxAddressParameter address in Model.BccAddresses)
                {
                    if (!string.IsNullOrEmpty(address.Address))
                    {
                        if (string.IsNullOrEmpty(address.Name))
                        {
                            address.Name = address.Address;
                        }

                        message.Cc.Add(new MailboxAddress(address.Name, address.Address));
                    }
                }
            }

            using (var smtp = new SmtpClient())
            {
                smtp.ServerCertificateValidationCallback = (s, c, h, e) => true;
                await smtp.ConnectAsync("smtp-mail.outlook.com", 587, SecureSocketOptions.StartTls); 
                await smtp.AuthenticateAsync("analysim@outlook.com", "ChfG2Ufq5gw5knr"); 
                await smtp.SendAsync(message); 
                await smtp.DisconnectAsync(true); 
            }

            return Ok("Email was successfully sent");
        }

    }
}
