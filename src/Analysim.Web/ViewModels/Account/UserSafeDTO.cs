using System;
using System.Collections.Generic;
using System.Linq;

namespace Web.ViewModels.Account
{
    /// <summary>
    /// Safe DTO for returning user information in API responses.
    /// Excludes sensitive authentication fields like PasswordHash, SecurityStamp, etc.
    /// </summary>
    public class UserSafeDTO
    {
        public int Id { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public string Bio { get; set; }
        public DateTimeOffset DateCreated { get; set; }

        /// <summary>
        /// Maps from User entity to safe DTO, excluding sensitive fields
        /// </summary>
        public static UserSafeDTO FromUser(Core.Entities.User user)
        {
            if (user == null)
                return null;

            return new UserSafeDTO
            {
                Id = user.Id,
                UserName = user.UserName,
                Email = user.Email,
                Bio = user.Bio,
                DateCreated = user.DateCreated
            };
        }

        /// <summary>
        /// Maps collection of users to safe DTOs
        /// </summary>
        public static List<UserSafeDTO> FromUsers(IEnumerable<Core.Entities.User> users)
        {
            if (users == null)
                return new List<UserSafeDTO>();

            return users.Select(FromUser).ToList();
        }
    }
}
