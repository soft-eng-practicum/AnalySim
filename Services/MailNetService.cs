using AnalySim.Helpers;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;
using MimeKit.Text;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AnalySim.Services
{
    public class MailNetService : IMailNetService
    {
        private readonly EmailSettings _emailSettings;
        public MailNetService(IOptions<EmailSettings> emailSettings) 
        {
            _emailSettings = emailSettings.Value;
        }

        public async Task SendEmail(string email, string name, string subject, string bodyHTML, string bodyText)
        {
            MimeMessage message = new MimeMessage();

            message.From.Add(new MailboxAddress(_emailSettings.SenderName, _emailSettings.SenderEmail));
            message.To.Add(new MailboxAddress(name, email));
            message.Subject = subject;

            message.Body = new TextPart(TextFormat.Text) { Text = bodyText };
            message.Body = new TextPart(TextFormat.Html) { Text = bodyHTML };

            using (var smtp = new SmtpClient())
            {
                smtp.ServerCertificateValidationCallback = (s, c, h, e) => true;
                
                await smtp.ConnectAsync(_emailSettings.Server, _emailSettings.Port, SecureSocketOptions.StartTls);
                await smtp.AuthenticateAsync(_emailSettings.Username, _emailSettings.Password);
                await smtp.SendAsync(message);
                await smtp.DisconnectAsync(true);
            }
        }
    }
}
