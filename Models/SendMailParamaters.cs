using NeuroSimHub.Models;
using Microsoft.VisualBasic;
using MimeKit;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Threading.Tasks;

namespace NeuroSimHub.Models
{
    public class SendMailParamaters
    {
        public MailboxAddressParameter From { get; set; }
        public MailboxAddressParameter To { get; set; }
        public string Subject { get; set; }
        public string BodyHtml { get; set; }
        public string BodyText { get; set; }
        public Collection<MailboxAddressParameter> CcAddresses { get; set; }
        public Collection<MailboxAddressParameter> BccAddresses { get; set; }
    }
}
