using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace AnalySim.Services
{
    public interface IMailNetService
    {
        public Task SendEmail(string email, string name, string subject, string bodyHTML, string bodyText);
    }
}
