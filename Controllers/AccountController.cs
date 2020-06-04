using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using NeuroSimHub.Data;
using NeuroSimHub.Helpers;
using NeuroSimHub.Models;
using NeuroSimHub.ViewModels;
using NeuroSimHub.ViewModels.Base;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace NeuroSimHub.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signManager;
        private readonly AppSettings _appSettings;
        private readonly ApplicationDbContext _dbContext;
        private readonly string storageConnString;

        public AccountController(UserManager<ApplicationUser> _userManager, SignInManager<ApplicationUser> _signManager, IOptions<AppSettings> _appSettings, ApplicationDbContext _dbContext, IConfiguration config) 
        {
            this._userManager = _userManager;
            this._signManager = _signManager;
            this._appSettings = _appSettings.Value;
            this._dbContext = _dbContext;
            this.storageConnString = config.GetConnectionString("AccessKey");
        }

        #region GET REQUEST
        /*
         * Type : GET
         * URL : /api/account/getuserbyid/
         * Param : {userID}
         * Description: Get user from their id
         * Response Status: 200 Ok, 404 Not Found
         */
        [HttpGet("[action]/{userID}")]
        public IActionResult GetUserByID([FromRoute] int userID)
        {
            // Find User
            var user = _dbContext.Users
                .Include(u => u.Followers)
                .Include(u => u.Following)
                .Include(u => u.ProjectUsers)
                .Include(u => u.BlobFiles)
                .SingleOrDefault(x => x.Id == userID);
            if (user == null) return NotFound(new { message = "User Not Found" });
            return Ok(new 
            {
                result = user,
                message = "Recieved User: " + user.UserName
            });
        }

        /*
        * Type : GET
        * URL : /api/account/getuserbyname/
        * Param : {username}
        * Description: Get user from their username
        * Response Status: 200 Ok, 404 Not Found
        */
        [HttpGet("[action]/{username}")]
        public IActionResult GetUserByName([FromRoute] string username)
        {
            // Find User
            var user = _dbContext.Users
                .Include(u => u.Followers)
                .Include(u => u.Following)
                .Include(u => u.ProjectUsers)
                .Include(u => u.BlobFiles)
                .SingleOrDefault(u => u.UserName == username);
            if (user == null) return NotFound(new { message = "User Not Found" });
            return Ok(new
            {
                result = user,
                message = "Recieved User: " + user.UserName
            });
        }

        /*
        * Type : GET
        * URL : /api/account/getuserbyname?
        * Description: Get user from their username
        * Response Status: 200 Ok, 404 Not Found
        */
        [HttpGet("[action]")]
        public IActionResult GetUserRange([FromQuery(Name = "id")] List<int> ids)
        {
            // Find User
            var users = _dbContext.Users
                .Include(u => u.Followers)
                .Include(u => u.Following)
                .Include(u => u.ProjectUsers)
                .Include(u => u.BlobFiles)
                .Where(u => ids.Contains(u.Id))
                .ToList();
            if (users.Count != ids.Count) return NotFound(new { message = "Contains Invalid User" });

            return Ok(new
            {
                result = users,
                message = "Recieved User Range"
            });
        }

        /*
         * Type : GET
         * URL : /api/account/getuserlist
         * Param : None
         * Description: Get list of all user
         * Response Status: 200 Ok
         */
        [HttpGet("[action]")]
        public IActionResult GetUserList()
        {
            // Query All User Into A List
            var users = _dbContext.Users
                .Include(u => u.Followers)
                .Include(u => u.Following)
                .Include(u => u.ProjectUsers)
                .Include(u => u.BlobFiles)
                .ToList();

            return Ok(new
            {
                result = users,
                message = "Recieved User List"
            });
        }

        /*
         * Type : GET
         * URL : /api/account/search
         * Description: Filter and return search result
         * Response Status: 200 Ok, 204 Not Found
         */
        [HttpGet("[action]")]
        public IActionResult Search([FromQuery(Name = "term")] List<string> searchTerms)
        {
            var matchedUser = _dbContext.Users
                .Include(u => u.Followers)
                .Include(u => u.Following)
                .Include(u => u.ProjectUsers)
                .Include(u => u.BlobFiles)
                .ToList()
                .Where(u => searchTerms.All(k => u.UserName.ToLower().Contains(k.ToLower())));
            if (matchedUser.Count() == 0) return NoContent();

            return Ok(new
            {
                result = matchedUser,
                message = "Search Successful"
            });
        }
        #endregion

        #region POST REQUEST
        /*
         * Type : POST
         * URL : /api/account/follow
         * Param : UserFollowViewModel
         * Description: Have a user follow another user
         * Response Status: 200 Ok, 404 Not Found
         */
        [HttpPost("[action]")]
        public async Task<IActionResult> Follow([FromForm] UserFollowViewModel formdata)
        {
            // Find User
            var user = await _dbContext.Users.FindAsync(formdata.UserID);
            if (user == null) return NotFound(new { message = "User Not Found " + formdata.UserID });

            // Find Follower
            var follower = await _dbContext.Users.FindAsync(formdata.FollowerID);
            if (follower == null) return NotFound(new { message = "User Not Found " + formdata.UserID });

            // Create Many To Many Connection
            var userFollower = new UserUser
            {
                UserID = formdata.UserID,
                FollowerID = formdata.FollowerID
            };

            // Add To Database
            await _dbContext.UserUsers.AddAsync(userFollower);

            // Save Change
            await _dbContext.SaveChangesAsync();

            return Ok(new
            {
                result = userFollower,
                message = user.UserName +  " is now following " + follower.UserName
            });
        }

        /*
         * Type : POST
         * URL : /api/account/register
         * Param : UserRegisterViewModel
         * Description: Register Account
         * Response Status: 200 Ok, 400 Bad Request
         */
        [HttpPost("[action]")]
        public async Task<IActionResult> Register([FromForm] UserRegisterViewModel formdata)
        {

            // Hold Error List
            List<string> errorList = new List<string>();

            // Create User Object
            var user = new ApplicationUser
            {
                Email = formdata.EmailAddress,
                UserName = formdata.Username,
                DateCreated = DateTime.Now,
                LastOnline = DateTime.Now,
                SecurityStamp = Guid.NewGuid().ToString()
            };

            // Add User To Database
            var result = await _userManager.CreateAsync(user, formdata.Password);

            // If Successfully Created
            if (result.Succeeded)
            {
                // Add Role To User
                await _userManager.AddToRoleAsync(user, "Customer");

                // Return Ok Request
                return Ok(new
                {
                    resultObject = user,
                    message = "Registration Successful"
                });
            }
            else
            {
                // Add Error To ErrorList
                foreach (var error in result.Errors)
                {
                    ModelState.AddModelError("", error.Description);
                    errorList.Add(error.Description);
                }
            }

            // Return Bad Request Status With ErrorList
            return BadRequest(new { message = errorList });
        }

        /*
         * Type : POST
         * URL : /api/account/login
         * Param : UserLoginViewModel
         * Description: Register Account
         * Response Status: 200 Ok, 401 Unauthorized
         */
        [HttpPost("[action]")]
        public async Task<IActionResult> Login([FromForm] UserLoginViewModel formdata)
        {
            // Get The User
            var user = await _userManager.FindByNameAsync(formdata.Username);

            // Get The User Role
            var roles = await _userManager.GetRolesAsync(user);

            // Generate Key Token
            var key = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(_appSettings.Secret));

            // Generate Expiration Time For Token
            double tokenExpiryTime = Convert.ToDouble(_appSettings.ExpireTime);

            // Check Login Status
            if (user != null && await _userManager.CheckPasswordAsync(user, formdata.Password))
            {
                // Create JWT Token Handler
                var tokenHandler = new JwtSecurityTokenHandler();

                // Create Token Descriptor
                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(new Claim[]
                    {
                        new Claim(JwtRegisteredClaimNames.Sub, formdata.Username),
                        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                        new Claim(ClaimTypes.Role, roles.FirstOrDefault()),
                        new Claim("LoggedOn", DateTime.Now.ToString())
                    }),

                    SigningCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature),
                    Issuer = _appSettings.Site,
                    Audience = _appSettings.Audience,
                    Expires = DateTime.UtcNow.AddMinutes(tokenExpiryTime)
                };

                // Create Token
                var token = tokenHandler.CreateToken(tokenDescriptor);

                // Update Last Online
                user.LastOnline = DateTime.Now;

                // Save Database Change
                await _dbContext.SaveChangesAsync();

                _dbContext.Entry(user).Collection(u => u.ProjectUsers).Load();
                _dbContext.Entry(user).Collection(u => u.BlobFiles).Load();
                _dbContext.Entry(user).Collection(u => u.Followers).Load();
                _dbContext.Entry(user).Collection(u => u.Following).Load();

                // Return OK Request
                return Ok(new
                {
                    resultObject = user,
                    token = tokenHandler.WriteToken(token),
                    expiration = token.ValidTo,
                    message = "Login Successful"
                });

            }
            else
            {

                ModelState.AddModelError("", "Username/Password was not found");

                // Return Unauthorized Status If Unable To Login
                return Unauthorized(new
                {
                    LoginError = "Please Check the Login Creddentials - Invalid Username/Password was entered"
                });
            }
        }

        #endregion

        #region PUT REQUEST
        /*
         * Type : PUT
         * URL : /api/account/updateuser/
         * Param : {userID}, ProjectViewModel
         * Description: Update Project
         * Response Status: 200 Ok, 404 Not Found
         */
        [HttpPut("[action]/{userID}")]
        public async Task<IActionResult> UpdateUser([FromRoute] int userID, [FromForm] UserUpdateViewModel formdata)
        {
            // Check Model State
            if (!ModelState.IsValid) return BadRequest(ModelState);

            // Find Project
            var user = _dbContext.Users.FirstOrDefault(u => u.Id == userID);
            if (user == null) return NotFound(new { message = "User Not Found" });

            // If the product was found
            user.Bio = formdata.Bio;

            // Set Entity State
            _dbContext.Entry(user).State = EntityState.Modified;

            // Save Change
            await _dbContext.SaveChangesAsync();

            // Return Ok Status
            return Ok(new
            {
                result = user,
                message = "User has been updated"
            });

        }
        #endregion

        #region DELETE REQUEST
        /*
         * Type : DELETE
         * URL : /api/account/unfollow/
         * Param : {userID}/{followerID}
         * Description: Have the follower unfollow the user
         * Response Status: 200 Ok, 404 Not Found
         */
        [HttpDelete("[action]/{userID}/{followerID}")]
        public async Task<IActionResult> Unfollow([FromRoute] int userID, [FromRoute] int followerID)
        {
            // Find User
            var user = await _dbContext.Users.FindAsync(userID);
            if (user == null) return NotFound(new { message = "User Not Found" });

            // Find Follower
            var follower = await _dbContext.Users.FindAsync(followerID);
            if (follower == null) return NotFound(new { message = "Follower Not Found" });

            // Find Many To Many
            var userFollower = await _dbContext.UserUsers.FindAsync(user.Id, follower.Id);
            if (userFollower == null) return NotFound(new { message = "User Follower Connection Not FOund" });

            // Remove Project
            _dbContext.UserUsers.Remove(userFollower);

            // Save Change
            await _dbContext.SaveChangesAsync();

            return Ok(new
            {
                result = userFollower,
                message = follower.UserName + " has unfollow " + user.UserName
            });
        }
        #endregion

        #region Extra
        /*
         * Type : GET
         * URL : /api/account/getprojects/
         * Param : {userID}
         * Description: Get list of project user has connection to
         * Response Status: 200 Ok, 204 No Content
         */
        [HttpGet("[action]/{userID}")]
        public IActionResult GetProjects([FromRoute] int userID)
        {
            // Find User
            //var user = _dbContext.Users.SingleOrDefault(x => x.Id == userID);
            //if (user == null) return NotFound(new { message = "User Not Found" });

            var userProjects = _dbContext.ProjectUsers
                .Include(pu => pu.Project)
                    .ThenInclude(p => p.BlobFiles)
                .Include(pu => pu.Project)
                    .ThenInclude(p => p.ProjectUsers)
                .Include(pu => pu.Project)
                    .ThenInclude(p => p.ProjectTags)
                    .ThenInclude(pt => pt.Tag)
                .Where(pu => pu.UserID == userID)
                .AsEnumerable();

                
            //if (userProjects.Count() == 0) return NoContent();

            // Return Ok Status
            return Ok(new
            {
                result = userProjects,
                message = "Recieved User Project"
            });
        }

        /*
        * Type : GET
        * URL : /api/account/getfollowers/
        * Param : {userID}
        * Description: Get follower from user id
        * Response Status: 200 Ok, 204 No Content, 404 Not Found
        */
        [HttpGet("[action]/{userID}")]
        public IActionResult GetFollowers([FromRoute] int userID)
        {
            // Find User
            var user = _dbContext.Users.SingleOrDefault(x => x.Id == userID);
            if (user == null) return NotFound(new { message = "User Not Found" });

            var userFollowers = _dbContext.UserUsers
                .Include(uu => uu.Follower).ThenInclude(f => f.Followers)
                .Include(uu => uu.Follower).ThenInclude(f => f.Following)
                .Where(u => u.UserID == userID)
                .ToList();
                
            if (userFollowers.Count() == 0) return NoContent();

            return Ok(new
            {
                result = userFollowers,
                message = "Recieved User Follower"
            });
        }

        /*
        * Type : GET
        * URL : /api/account/getfollowings/
        * Param : {userID}
        * Description: Get user following from user id
        * Response Status: 200 Ok, 204 No Content, 404 Not Found
        */
        [HttpGet("[action]/{userID}")]
        public IActionResult GetFollowings([FromRoute] int userID)
        {
            // Find User
            var user = _dbContext.Users
                .Include(u => u.Following)
                .Include(u => u.Followers)
                .SingleOrDefault(x => x.Id == userID);
            if (user == null) return NotFound(new { message = "User Not Found" });

            var userFollowings = _dbContext.UserUsers
                .Include(uu => uu.User).ThenInclude(f => f.Followers)
                .Include(uu => uu.User).ThenInclude(f => f.Following)
                .Where(u => u.FollowerID == userID)
                .ToList();
            if (userFollowings.Count() == 0) return NoContent();

            return Ok(new
            {
                result = userFollowings,
                message = "Recieved User Following"
            });
        }
        #endregion
    }

}
