using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Core.Helper
{
    public class JwtSettings
    {
        public string Issuer { get; set; }
        public string Secret { get; set; }
        public string ExpireTime { get; set; }
        public string Audience { get; set; }
    }
}
