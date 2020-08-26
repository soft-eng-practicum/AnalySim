using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Core.Interfaces
{
    public interface IMailNetService
    {
        public Task SendEmail(string email, string name, string subject, string bodyHTML, string bodyText);
    }
}
